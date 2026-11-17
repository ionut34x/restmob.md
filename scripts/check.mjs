import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { site } from './content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const origin = site.url;
const expectedAlternates = new Map([['ro', `${origin}/`], ['ru', `${origin}/ru/`], ['x-default', `${origin}/`]]);
const failures = [];
let checks = 0;
const verify = (condition, message) => {
  checks++;
  if (!condition) failures.push(message);
};
const exists = async file => {
  try { return (await stat(file)).isFile(); } catch { return false; }
};
const read = async file => {
  try { return await readFile(file, 'utf8'); }
  catch (error) { verify(false, `Cannot read ${path.relative(root, file)}: ${error.code}`); return ''; }
};
const json = async file => {
  const source = await read(file);
  if (!source) return null;
  try { return JSON.parse(source); }
  catch (error) { verify(false, `Invalid JSON in ${path.relative(root, file)}: ${error.message}`); return null; }
};
const decode = text => String(text).replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  if (entity.toLowerCase() in named) return named[entity.toLowerCase()];
  const hex = entity.toLowerCase().startsWith('&#x');
  return String.fromCodePoint(parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10));
});
function attributes(tag) {
  const result = {};
  const body = tag.replace(/^<[^\s>]+/, '').replace(/\/?\s*>$/, '');
  for (const match of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}
function tags(html) {
  return Array.from(html.matchAll(/<([a-z][\w:-]*)(?:"[^"]*"|'[^']*'|[^'">])*?>/gi), match => ({
    name: match[1].toLowerCase(), attrs: attributes(match[0]),
  }));
}
function resourcePath(url) {
  const decoded = decodeURIComponent(url.pathname);
  const destination = path.resolve(publicDir, `.${decoded}`);
  if (destination !== publicDir && !destination.startsWith(`${publicDir}${path.sep}`)) return null;
  return decoded.endsWith('/') ? path.join(destination, 'index.html') : destination;
}

const report = await json(path.join(root, 'asset-report.json'));
const variants = new Map((report?.entries ?? []).flatMap(entry => entry.variants.map(variant => [variant.file, { ...variant, entry }])));
verify(variants.size > 0, 'asset-report.json must describe the optimized images');
for (const [file, variant] of variants) {
  verify(await exists(path.join(publicDir, 'assets', 'images', file)), `Missing optimized image: ${file}`);
  verify(variant.width > 0 && variant.height > 0, `Invalid image dimensions in asset report: ${file}`);
}

const pages = [];
for (const [lang, relative] of [['ro', 'index.html'], ['ru', 'ru/index.html']]) {
  const file = path.join(publicDir, relative);
  const html = await read(file);
  if (!html) continue;
  const elements = tags(html);
  const label = `${lang.toUpperCase()} page`;
  const pageUrl = `${origin}${lang === 'ro' ? '/' : '/ru/'}`;
  const ids = elements.filter(element => element.attrs.id).map(element => element.attrs.id);
  const idSet = new Set(ids);
  const select = (name, key, value) => elements.filter(element => element.name === name && (!key || element.attrs[key] === value));
  pages.push({ lang, file, html, elements, pageUrl, idSet });

  verify(select('html')[0]?.attrs.lang === lang, `${label}: html lang must be ${lang}`);
  verify(select('h1').length === 1, `${label}: expected exactly one h1`);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  verify(Boolean(title) && title.includes('RESTMOB'), `${label}: missing descriptive RESTMOB title`);
  const descriptions = select('meta', 'name', 'description');
  verify(descriptions.length === 1 && descriptions[0].attrs.content?.trim().length >= 40, `${label}: missing meaningful meta description`);
  const canonicals = select('link', 'rel', 'canonical');
  verify(canonicals.length === 1 && canonicals[0].attrs.href === pageUrl, `${label}: canonical must be ${pageUrl}`);
  for (const [language, url] of expectedAlternates) {
    const alternatives = select('link', 'hreflang', language);
    verify(alternatives.length === 1 && alternatives[0].attrs.rel === 'alternate' && alternatives[0].attrs.href === url,
      `${label}: missing reciprocal ${language} hreflang ${url}`);
  }
  verify(ids.length === idSet.size, `${label}: duplicate IDs: ${ids.filter((id, index) => ids.indexOf(id) !== index).join(', ')}`);
  verify(!/lorem\s+ipsum|\bTODO\b|YOUR[_ -](?:PHONE|NAME|DOMAIN)|example\.com/i.test(html), `${label}: placeholder content remains`);
  verify(select('a', 'href', `tel:${site.phone}`).length > 0, `${label}: missing configured telephone link`);

  const schemas = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
    .filter(match => attributes(`<script ${match[1]}>`).type === 'application/ld+json');
  verify(schemas.length > 0, `${label}: missing JSON-LD`);
  for (const schema of schemas) {
    try {
      const value = JSON.parse(schema[2]);
      verify(value['@context'] === 'https://schema.org' && Array.isArray(value['@graph']), `${label}: invalid JSON-LD context or graph`);
      verify(value['@graph']?.some(node => node['@type'] === 'Organization' && node.telephone === site.phone), `${label}: JSON-LD organization/telephone missing`);
    } catch (error) { verify(false, `${label}: invalid JSON-LD: ${error.message}`); }
  }

  for (const image of select('img')) {
    const attrs = image.attrs;
    if (attrs.id === 'lightbox-image' && !attrs.src) continue;
    const imageLabel = `${label} image ${attrs.src ?? '(missing src)'}`;
    verify(Boolean(attrs.alt?.trim()), `${imageLabel}: missing nonempty alt`);
    verify(Number(attrs.width) > 0 && Number(attrs.height) > 0, `${imageLabel}: missing explicit dimensions`);
    const hero = (attrs.class ?? '').split(/\s+/).includes('hero-image');
    verify(hero ? attrs.fetchpriority === 'high' && attrs.loading !== 'lazy' : attrs.loading === 'lazy', `${imageLabel}: incorrect loading priority`);
    verify(Boolean(attrs.src) && Boolean(attrs.srcset) && Boolean(attrs.sizes), `${imageLabel}: src, srcset and sizes are required`);
    const widths = new Set();
    for (const candidate of (attrs.srcset ?? '').split(',').filter(Boolean)) {
      const match = candidate.trim().match(/^(\S+)\s+(\d+)w$/);
      verify(Boolean(match), `${imageLabel}: invalid srcset candidate ${candidate}`);
      if (!match) continue;
      const fileName = path.posix.basename(match[1]);
      const variant = variants.get(fileName);
      verify(Boolean(variant) && variant.width === Number(match[2]), `${imageLabel}: descriptor does not match actual width for ${fileName}`);
      verify(!widths.has(Number(match[2])), `${imageLabel}: duplicate srcset width ${match[2]}`);
      widths.add(Number(match[2]));
      verify(await exists(path.join(publicDir, match[1].replace(/^\//, ''))), `${imageLabel}: missing srcset file ${match[1]}`);
    }
    if (attrs.src) {
      const variant = variants.get(path.posix.basename(attrs.src));
      if (variant) verify(Math.abs(Number(attrs.width) / Number(attrs.height) - variant.entry.source_width / variant.entry.source_height) < 0.001,
        `${imageLabel}: width/height ratio does not match source`);
    }
  }

  for (const [name, attribute, extension] of [['link', 'href', 'css'], ['script', 'src', 'js']]) {
    const resources = select(name).filter(element => element.attrs[attribute]?.endsWith(`.${extension}`));
    verify(resources.length > 0, `${label}: missing ${extension} resource`);
    for (const element of resources) {
      const url = element.attrs[attribute];
      const hash = url.match(new RegExp(`\\.([a-f0-9]{10})\\.${extension}$`))?.[1];
      verify(Boolean(hash), `${label}: ${extension} must have a fingerprinted filename: ${url}`);
      const asset = path.join(publicDir, url.replace(/^\//, ''));
      if (hash && await exists(asset)) {
        const actual = createHash('sha256').update(await readFile(asset)).digest('hex').slice(0, 10);
        verify(actual === hash, `${label}: stale content fingerprint for ${url}`);
      }
    }
  }
}
verify(pages.length === 2, 'Both generated language pages must exist; run npm run build first');

for (const page of pages) {
  for (const element of page.elements) {
    for (const key of ['src', 'href']) {
      const reference = element.attrs[key];
      if (!reference || /^(?:tel:|mailto:|viber:|data:|javascript:)/i.test(reference)) continue;
      let url;
      try { url = new URL(reference, page.pageUrl); }
      catch { verify(false, `${page.lang}: invalid ${key} URL ${reference}`); continue; }
      if (url.origin !== origin) continue;
      const destination = resourcePath(url);
      verify(Boolean(destination) && await exists(destination), `${page.lang}: broken local ${key} ${reference}`);
      if (url.hash && destination) {
        const destinationPage = pages.find(candidate => candidate.file === destination);
        if (destinationPage) verify(destinationPage.idSet.has(decodeURIComponent(url.hash.slice(1))), `${page.lang}: missing anchor target ${reference}`);
      }
    }
    if (element.name === 'a' && element.attrs['data-full-width']) {
      const variant = variants.get(path.posix.basename(element.attrs.href ?? ''));
      verify(Boolean(variant) && variant.width === Number(element.attrs['data-full-width']) && variant.height === Number(element.attrs['data-full-height']),
        `${page.lang}: gallery full-image dimensions mismatch ${element.attrs.href}`);
    }
  }
}

const sitemap = await read(path.join(publicDir, 'sitemap.xml'));
verify(sitemap.includes('http://www.sitemaps.org/schemas/sitemap/0.9'), 'Sitemap namespace is missing');
const locations = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), match => decode(match[1]));
verify(locations.length === 2 && locations.includes(`${origin}/`) && locations.includes(`${origin}/ru/`), 'Sitemap must contain both canonical language URLs');
const sitemapAlternates = tags(sitemap).filter(element => element.name === 'xhtml:link');
for (const [lang, url] of expectedAlternates) {
  verify(sitemapAlternates.filter(element => element.attrs.hreflang === lang && element.attrs.href === url).length === 2, `Sitemap is missing reciprocal ${lang} alternatives`);
}
for (const match of sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)) {
  const url = new URL(decode(match[1]));
  const destination = resourcePath(url);
  verify(url.origin === origin && Boolean(destination) && await exists(destination), `Sitemap image does not exist: ${url.href}`);
}
const robots = await read(path.join(publicDir, 'robots.txt'));
verify(/User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots) && !/Disallow:\s*\/(?:\s|$)/i.test(robots), 'robots.txt must allow indexing');
verify(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'robots.txt must reference the canonical sitemap');
const vercel = await json(path.join(root, 'vercel.json'));
verify(vercel?.outputDirectory === 'public', 'Vercel outputDirectory must be public');
verify(vercel?.buildCommand === 'npm run build', 'Vercel must run the static build');
verify(await exists(path.join(publicDir, '404.html')), 'Static 404 page is missing');

if (failures.length) {
  console.error(`\nRESTMOB checks failed (${failures.length}/${checks}):\n${failures.map(message => `- ${message}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  console.log(`RESTMOB: ${checks} static checks passed. Both languages, SEO, image widths, links and Vercel configuration are valid.`);
}
