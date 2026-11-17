# RESTMOB

Site informativ în română și rusă pentru restaurare și reparație mobilă în Chișinău. HTML, CSS și JavaScript simplu, fără framework, biblioteci, fonturi externe, cookie-uri sau baze de date.

## Pornire locală

Este necesar Node.js 20 sau mai nou. Nu este nevoie de `npm install`.

```powershell
cd "C:\Users\ionpo\OneDrive\Desktop\RESTMOB PROJECT"
npm run build
npm run dev
```

Deschide [http://127.0.0.1:4173](http://127.0.0.1:4173). Oprește serverul cu `Ctrl+C`.

Site-ul utilizează URL-uri absolute de la rădăcină pentru portabilitate între hosturi. Previzualizează-l prin serverul local, nu prin dublu click pe fișierul HTML.

## Publicare pe Vercel

1. Încarcă proiectul într-un repository Git și importă-l în Vercel. Păstrează `public/`, `scripts/`, `asset-report.json`, `package.json` și `vercel.json`.
2. Framework: **Other**. Build command: **npm run build**. Output directory: **public**. Nu sunt necesare variabile de mediu.
3. Configurația `vercel.json` include deja comanda de build și directorul publicat.
4. În proiectul Vercel, deschide **Settings → Domains** și adaugă **restmob.2bd.net**.
5. În panoul freedomain.one configurează înregistrarea DNS exact cum o afișează Vercel. Pentru subdomenii, în mod normal este un CNAME; folosește valoarea returnată pentru proiectul tău. Nu schimba nameserverele domeniului părinte `2bd.net`.
6. Așteaptă validarea DNS și emiterea HTTPS. Verifică ambele adrese: `/` și `/ru/`.

Vercel publică doar conținutul `public/`. Originalele din `images/` nu ajung în site. Dacă alegi alt host static, setează tot `public/` ca director publicat și păstrează servirea fișierelor `ru/index.html`, `404.html`, `robots.txt` și `sitemap.xml`.

Documentație: [Vercel — configurarea proiectului](https://vercel.com/docs/project-configuration/vercel-json), [Vercel — adăugarea unui domeniu](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

## Editare

- Texte, traduceri, telefon și domeniu: `scripts/content.mjs`.
- Structura HTML și datele structurate: `scripts/build.mjs`.
- Structură și responsive: `public/assets/style.css`.
- Tipografie clasică și lizibilitate: `public/assets/classic.css`.
- Animațiile de prezentare: `public/assets/motion.css` și `public/assets/main.js`.
- Galeria de lucrări: `scripts/gallery.mjs`, `public/assets/gallery.css` și interacțiunile din `public/assets/main.js`.
- Titlurile scurte de sub fotografii: `galleryLabels` din `scripts/content.mjs`; descrierile complete pentru alt, SEO și vizualizarea mărită rămân în `gallery`.
- Scăunelul SVG: `scripts/atelier.mjs`, `public/assets/atelier.css` și `public/assets/atelier.js`.
- Cele cinci fișiere CSS și cele două fișiere JavaScript sunt reunite la build în câte un singur fișier, cu nume versionat.
- Meniu, comparații, filtre și galerie: `public/assets/main.js`.
- Fotografii pentru publicare: `public/assets/images/`.
- Clasificarea fotografiilor și dimensiunile variantelor: `asset-report.json`.

După editare rulează `npm run build`, apoi `npm run check`. Build-ul generează separat paginile RO/RU și nume cu amprentă pentru CSS/JS; astfel versiunile noi nu rămân blocate în cache. Fotografiile folosesc revalidare, pentru a permite înlocuirea lor sub același nume.

## Fotografii

Au fost găsite **55 de fișiere JPG** originale. Sunt pregătite 31 de fotografii distincte în variante WebP de 480, 900 și 1440 px. Galeria prezintă o selecție de **12 fotografii reprezentative**, fără fotografiile de detaliu repetate. Fotografiile își păstrează proporțiile originale într-un colaj pe coloane, fără rame, padding sau benzi goale în jurul imaginilor. Cu JavaScript sunt afișate câte 4 fotografii pe telefon și tabletă și câte 6 pe desktop. Butoanele „Înapoi” și „Înainte” schimbă pagina de fotografii, fără să extindă lista. Vizitatorii pot filtra pe categorii și deschide fotografiile întregi în vizualizarea mărită. Imaginile folosesc încărcare întârziată. Fără JavaScript, toate cele 12 fotografii rămân accesibile în colajul din pagina HTML.

Comparațiile sunt clasificate după elementele vizibile din fotografii:

| Piesă | Înainte | După |
| --- | --- | --- |
| Canapea clasică | `photo17.jpg` | `photo18.jpg` |
| Set de scaune | `21.jpg` | `22.jpg` |
| Masă din lemn | `38.jpg` | `40.jpg` |

Fotografiile sunt realizate din unghiuri diferite. Comparatorul arată etapele lucrării; nu pretinde aliniere fotografică perfectă. Poți corecta clasificarea în `scripts/content.mjs` dacă o piesă aparține altei lucrări.

Originalele rămân intacte. Pipeline-ul opțional `scripts/optimize-images.py` necesită Python și Pillow; nu este necesar pentru build sau publicare, deoarece imaginile WebP sunt deja incluse.

## SEO și indexare

Implementarea include pagini HTML complete în ambele limbi, H1-uri explicite despre restaurare și reparație mobilă în Chișinău, titluri și descrieri distincte, canonical individual, hreflang reciproc cu `x-default`, Open Graph, robots.txt și texte alternative traduse. Datele structurate descriu Organization, WebSite, WebPage și cele trei servicii reale.

Fiecare versiune de limbă include **15 ImageObject**: cele 12 fotografii din galerie și trei fotografii „înainte” din comparații. Acestea au URL-uri reale și dimensiunile variantelor publicate. Un **ItemList cu 12 elemente** descrie selecția galeriei, iar WebPage face referire la fotografii și la listă. Sitemapul include cele două URL-uri canonice, fiecare cu **15 imagini unice**. Acest markup descrie conținutul; nu reprezintă o promisiune de rezultat special sau de poziție în Google.

Localizarea principală este Chișinău. Nu sunt inventate adresă, recenzii, prețuri, program sau ani de experiență. Fără o adresă reală furnizată, site-ul păstrează Organization și Service, fără a pretinde eligibilitate pentru rezultate LocalBusiness.

După ce domeniul este public:

1. Adaugă și verifică proprietatea în Google Search Console. Poți verifica subdomeniul `restmob.2bd.net` prin înregistrarea DNS cerută de Google, dacă furnizorul permite acest lucru. Alternativ, adaugă proprietatea URL-prefix `https://restmob.2bd.net/` și folosește fișierul sau tagul HTML de verificare furnizat de Google. Păstrează metoda de verificare și după publicările următoare.
2. Trimite [sitemap.xml](https://restmob.2bd.net/sitemap.xml) în secțiunea Sitemaps.
3. Folosește URL Inspection pentru `https://restmob.2bd.net/` și `https://restmob.2bd.net/ru/`. Verifică accesibilitatea publică, conținutul randat, indexabilitatea și canonical-ul; apoi poți solicita indexarea celor două pagini.
4. Creează sau completează profilul real Google Business numai dacă activitatea este eligibilă. Folosește numele real, telefonul **068 122 935**, site-ul, fotografiile proprii și zona efectiv deservită. Dacă afacerea se deplasează la clienți și nu îi primește la sediu, aplică regulile Google pentru service-area businesses și ascunde adresa din profil. Nu inventa o adresă publică sau un program.

SEO pregătește site-ul pentru căutare; pozițiile și timpul până la indexare depind de Google și de concurență. Dacă schimbi domeniul, modifică `site.url` în `scripts/content.mjs` și rulează din nou build-ul.

Referințe: [Google — versiuni localizate](https://developers.google.com/search/docs/specialty/international/localized-versions), [Google — optimizarea imaginilor](https://developers.google.com/search/docs/appearance/google-images), [Google — verificarea proprietății în Search Console](https://support.google.com/webmasters/answer/9008080?hl=en), [Google — sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Google — regulile Business Profile](https://support.google.com/business/answer/3038177).

## Verificare

```powershell
npm run build
npm run check
```

Interacțiunile sunt îmbunătățiri progresive: conținutul, contactele, întrebările și fotografiile rămân accesibile fără JavaScript. Animațiile respectă preferința sistemului pentru mișcare redusă. WhatsApp deschide o conversație, Viber necesită aplicația instalată, iar telefonul folosește legături `tel:`.

Datele de contact folosite: **068 122 935**, WhatsApp/Viber, în principal Chișinău.

## Galeria și scăunelul de atelier

Galeria are pagini scurte și un colaj cu înălțimi variate: două coloane pe telefon/tabletă (până la 960 px) și trei pe desktop. Aranjarea folosește CSS nativ, fără bibliotecă sau calcul de layout în JavaScript. Titlurile sunt scurte, iar săgeata de mărire este discretă; pe dispozitive cu mouse apare la hover sau focus. La schimbarea dimensiunii ecranului, pagina păstrează în vedere fotografia focalizată sau prima fotografie din selecția curentă. Filtrarea, paginația și mărirea sunt îmbunătățiri JavaScript peste conținutul HTML complet.

Scăunelul este un SVG mic și o legătură „Înapoi sus”. Culoarea și mișcarea lui urmăresc derularea. Se retrage de lângă contact, meniul deschis, fotografiile mărite sau comenzile galeriei dacă acestea ajung în colțul lui. Nu rulează o animație continuă în repaus.

Efectele respectă preferința sistemului pentru mișcare redusă. Fără JavaScript, toate cele 12 fotografii rămân în pagina HTML, linkurile deschid fotografiile mari, iar comenzile care necesită JavaScript sunt ascunse. Nu sunt adăugate biblioteci, fonturi descărcate sau fișiere video.

## Micile gesturi de atelier

- Întrebările folosesc în continuare elemente native `details/summary`, cu mânere SVG și o glisare de 340 ms la deschidere. Se pot folosi cu tastatura și fără JavaScript.
- Butonul principal are o cusătură desenată la hover sau focus, în 550 ms, cu un ac discret. Efectul este făcut din CSS.
- Logo-ul din antet primește o singură trecere de pensulă de 1,1 s la încărcarea paginii; textul rămâne permanent lizibil. Fără JavaScript este afișat logo-ul simplu.
- Scăunelul salută o singură dată la prima apariție. La contact apare o scenă decorativă separată, în fluxul paginii, în care pensula este așezată lângă scaun o singură dată. Scăunelul fix continuă să se ascundă lângă contact, meniu și fotografiile mărite.

Stilurile sunt în `public/assets/motion.css` și `public/assets/atelier.css`, iar gesturile scăunelului în `public/assets/atelier.js`. Animațiile nu rulează în buclă și respectă `prefers-reduced-motion`.
