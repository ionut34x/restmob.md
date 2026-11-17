# Verificare RESTMOB — 17 noiembrie 2026

- `npm run build`: finalizat fără dependențe externe.
- `npm run check`: 1.396 de verificări statice trecute, pentru RO/RU, SEO, imagini, legături și configurarea Vercel.
- Răspuns HTTP local: 200.
- Verificare vizuală în browser: română pe desktop și mobil 360 px; rusă la 320, 360, 768, 960, 1024 și 1440 px. Fără depășire orizontală la dimensiunile verificate.
- Testate: deschiderea/închiderea meniului mobil și navigarea la contact; schimbarea limbii; schimbarea comparației; separatorul prin tastatură; filtrarea galeriei; încărcarea a încă șase lucrări; deschiderea, navigarea și închiderea fotografiilor cu Escape.
- Consola browserului: fără erori sau avertismente ale site-ului în verificarea finală.
- Originalele JPG nu au fost modificate. Sunt 55 de originale; galeria publică folosește o selecție de 18 lucrări.

Aceste verificări nu reprezintă un scor Lighthouse sau un test pe fiecare browser fizic. Nu s-a publicat site-ul și nu s-a modificat DNS-ul domeniului.

## Corecții vizuale — 17 noiembrie 2026

- Comparatorul mesei respectă raportul original 64:85; fotografiile umplu cadrul fără benzi gri și fără decuparea piesei. Pe desktop, descrierea este alături; până la 800 px este sub fotografie.
- Comparatorul canapelei respectă raportul 4:3, iar cel al scaunelor 16:9. Lățimile de pe desktop sunt limitate pentru a evita mărirea excesivă.
- Galeria păstrează proporțiile fotografiilor într-un aranjament pe trei, două sau o coloană. Fotografiile verticale nu mai sunt tăiate pentru a umple un cadru orizontal.
- Corectate dimensiunile declarate ale imaginilor responsive, numele accesibil al apelului și pragul meniului mobil (mobil până la 960 px, desktop de la 961 px).
- RO: verificat la 320, 640, 768, 960 și 1440 px. RU: verificat la 320, 360, 640, 641, 768, 800, 960, 961, 1024 și 1440 px. Fără depășire orizontală sau texte care ies din casetele lor la dimensiunile verificate.
- Toate cele 18 fotografii din galerie păstrează raportul original la pragurile verificate. Testate filtrele, afișarea 6/12/18 lucrări, mărirea și închiderea fotografiilor, separatorul la 0/100% și tranziția meniului 959→960→961 px.
- Verificarea statică finală: 1.396 de verificări trecute. Consola browserului: fără erori sau avertismente ale site-ului.

## Stil clasic, contact și animații — 17 noiembrie 2026

- Numărul actual este **068 122 935**, în format internațional **+373 68 122 935**. Actualizate legăturile telefon, WhatsApp și Viber, metadatele RO/RU și datele structurate.
- Tipografie locală cu serife (Palatino/Georgia), texte principale de 16–18 px, butoane și navigare mai lizibile. Pe tabletele înguste, serviciile au o prezentare mai aerisită.
- Animații: trecere luminoasă pe fotografia principală, contur trasat, sigiliu discret, desenarea pictogramelor și a liniilor de proces. Comparatorul face o singură demonstrație scurtă.
- Verificat în browser că demonstrația pornește automat și se oprește imediat la folosirea tastaturii, revenind la controlul normal al separatorului. Codul respectă preferința sistemului pentru mișcare redusă și oprește RAF/listeners după demo.
- RO/RU verificate de la 320 la 1440 px, inclusiv pragurile 640/641, 800/801 și 960/961. Fără texte tăiate sau depășiri orizontale la dimensiunile verificate. Antetul rămâne pe un singur rând inclusiv la 320 px.
- Verificate numărul și destinațiile legăturilor, meniul mobil, comparatorul, filtrarea galeriei și deschiderea/închiderea fotografiilor. Fără erori sau avertismente ale site-ului în consolă.
- CSS-ul de structură, tipografie și animații este reunit într-un singur fișier pentru publicare; nu sunt adăugate biblioteci sau fonturi externe.

## Album de atelier și scăunel — 17 noiembrie 2026

- Portofoliul are copertă animată, pagini crem și efect scurt de răsfoire. Două lucrări pe desktop și una până la 640 px, cu fotografii complete și passepartout de hârtie.
- Verificate deschiderea, pagina următoare/anterioară, Home/End, filtrele, categoria cu trei lucrări și ultima filă, vizualizarea tuturor celor 18 lucrări și mărirea fotografiilor. La schimbarea mobil→desktop, pagina 5 rămâne în perechea 5–6.
- RO/RU: verificări responsive la 320–1440 px, inclusiv pragul 640/641. Fără depășire orizontală sau texte tăiate în stările verificate. Numerele de pagină și numărul lucrărilor vizibile sunt corecte.
- Verificare reală în browser a unei copii temporare fără script: toate cele 18 lucrări sunt vizibile, comenzile inactive și scăunelul sunt ascunse. Copia temporară a fost eliminată după test.
- Scăunelul SVG urmărește derularea și funcționează ca ancoră „Înapoi sus”. Testate revenirea sus și ascunderea la contact și în lightbox. Actualizările sunt programate numai la evenimente, cu un singur RAF în așteptare; nu există buclă permanentă în repaus.
- Imaginile următoarei file sunt pregătite după deschiderea albumului, cu respectarea Save-Data și evitarea preîncărcării pe conexiuni 2G/3G. Fotografiile originale au rămas nemodificate.
- CSS/JS rămân câte un singur fișier pentru publicare. Dimensiune locală combinată aproximativ 18 KB după compresie Brotli; aceasta este o măsurare a fișierelor, nu un scor Lighthouse sau o promisiune de timp de încărcare.
- Verificare statică: 1.400 de verificări trecute. Sintaxa modulelor este validă; consola browserului nu a afișat erori sau avertismente ale site-ului.

## Galerie de fotografii și texte clare — 17 noiembrie 2026

Această revizie înlocuiește albumul descris mai sus cu galeria cerută ulterior.

- Galerie cu 22 de fotografii, inclusiv detalii: 12 inițial, apoi câte 6. Filtrele afișează 5 fotografii de canapele/fotolii, 3 de scaune și 14 de mobilier din lemn. La schimbarea categoriei, limita revine la 12.
- Fotografii întregi în proporțiile originale, pe trei/două/o coloană, cu passepartout crem, contur fin la interacțiune și apariție scurtă. Preferința pentru mișcare redusă este respectată. Nu există preîncărcare suplimentară sau biblioteci noi.
- Titlurile principale descriu restaurarea și reparația mobilei în Chișinău; textele de pe fotografia principală descriu fotoliul prezentat. Traduceri RO/RU actualizate. Restul stilului, comparațiile, scăunelul și contactele sunt păstrate.
- RO/RU verificate în browser la 320, 360, 640, 641, 768, 960, 961, 1024 și 1440 px. Fără depășire orizontală sau titluri/butoane tăiate în stările verificate. Proporțiile tuturor celor 12 fotografii inițiale au fost verificate în pagina randată.
- Testate afișarea 12/18/22, toate filtrele, resetarea limitei, mărirea fotografiilor, navigarea circulară prin toate cele 22, săgețile și Escape. Închiderea fotografiei readuce focusul pe declanșator; după ascunderea ultimului buton „Mai multe fotografii”, focusul trece la prima fotografie nouă. Meniul mobil se închide la navigarea spre galerie.
- Verificare în browser a unei copii fără script: toate cele 22 de fotografii sunt afișate, filtrele și butonul suplimentar sunt ascunse, la fel scăunelul. Copia temporară a fost eliminată.
- HTML semantic cu figure/figcaption, descrieri traduse, 25 de ImageObject și un ItemList cu 22 de fotografii. Sitemapul include 25 de imagini unice pe fiecare URL de limbă. Canonical și hreflang reciproc sunt păstrate.
- `npm run build` și `npm run check`: finalizate; **1.574 de verificări statice trecute**. Consola browserului: fără erori sau avertismente ale site-ului.
- CSS: 56.796 B brut / 9.685 B Brotli; JavaScript: 19.873 B brut / 4.530 B Brotli. Total comprimat local: 14.215 B, aproximativ 19% sub varianta cu album. Măsurarea nu este un scor Lighthouse sau o promisiune de încărcare pe orice conexiune.
- Originalele și fișierele fotografiilor nu au fost modificate. Nu s-a publicat site-ul, nu s-au modificat DNS-ul și Search Console. Pașii de verificare/indexare după publicare sunt în README.

## Galerie compactă, cu pagini scurte — 17 noiembrie 2026

Această revizie înlocuiește galeria extensibilă descrisă anterior, pentru a reduce derularea pe telefon.

- Selecție redusă la 12 fotografii de piese complete: 3 de mobilier tapițat, 3 de scaune și 6 de mobilier din lemn. Fotografiile de detaliu repetate au fost scoase din galerie; originalele și variantele WebP rămân intacte.
- Câte 4 fotografii pe telefon/tabletă (până la 960 px), în două coloane, și câte 6 pe desktop, în trei coloane. Paginația înlocuiește selecția curentă, fără să adauge rânduri la nesfârșit. La 360 px, prima grilă are aproximativ 493 px înălțime; această valoare nu include titlul și comenzile secțiunii.
- Cadre de previzualizare uniforme, cu fotografii întregi prin object-fit: contain și deschidere la dimensiune mare. Introducerea galeriei este mai scurtă; filtrele sunt aranjate 2×2 pe telefon.
- Testate paginile 1/2/3 pe mobil și 1/2 pe desktop, limitele butoanelor, categoriile, revenirea la prima pagină și navigarea prin tastatură. La redimensionare, selecția păstrează fotografia relevantă; închiderea lightboxului readuce la pagina declanșatorului dacă aceasta s-a schimbat.
- RO/RU verificate la 320, 360, 390, 640, 641, 768, 960, 961 și 1440 px; pragul final 960/961 px a fost verificat separat. Toate cele trei pagini RU la 320 px sunt fără titluri sau butoane care depășesc cadrul.
- Fără JavaScript: toate cele 12 fotografii sunt afișate în grilă compactă, filtrele/paginația și scăunelul sunt ascunse. Copia temporară de verificare a fost eliminată.
- Schema și sitemapul sunt regenerate pentru selecția curentă: 15 ImageObject și 12 elemente în ItemList pe limbă, cu 15 imagini în sitemap pentru fiecare URL. Pagini RO/RU, canonical, hreflang, contacte și restul site-ului sunt păstrate.
- `npm run build` și `npm run check`: finalizate, **1.154 de verificări statice trecute**. Numărul verificărilor scade odată cu selecția mai mică de fotografii. Fără erori sau avertismente ale site-ului în consolă. Nu au fost adăugate dependențe, fonturi externe sau preîncărcare suplimentară.

## Colaj fără rame sau benzi albe — 17 noiembrie 2026

- Cadrele uniforme cu spațiu alb au fost înlocuite cu un colaj de fotografii la proporțiile originale: trei coloane pe desktop și două pe telefon/tabletă. Paddingul, bordurile și fundalul de passepartout au fost eliminate. Mobilierul nu este decupat pentru a umple o formă arbitrară.
- Titluri scurte RO/RU sub fotografii; descrierile complete rămân în alt, legăturile accesibile, datele structurate și vizualizarea mărită. Săgeată rotundă discretă, cu apariție la hover/focus pe dispozitivele cu mouse; zoom scurt și preferință pentru mișcare redusă păstrată.
- Selecția de 12 fotografii și paginația de 4/6 rămân neschimbate. La 360 px, cele trei pagini ale colajului RO măsoară aproximativ 397, 550 și 486 px, fără titlul și comenzile secțiunii.
- RO/RU verificate în browser la 320, 360, 640, 641, 768, 960, 961 și 1440 px. Fără depășiri orizontale sau titluri/butoane care ies din casetă. Toate cele trei pagini de titluri RU au fost verificate și la 320 px.
- Verificat în pagina randată că fotografiile vizibile au aceeași dimensiune ca suprafața lor, fără padding sau borduri. Testate paginația, filtrele, deschiderea fotografiei întregi, navigarea în lightbox, Escape și revenirea focusului.
- Aranjare CSS nativă, fără dependențe sau calcule de poziționare în JavaScript. Conținutul HTML complet și ascunderea comenzilor fără JavaScript sunt păstrate. Originalele și fișierele WebP nu au fost modificate.
- `npm run build` și `npm run check`: finalizate, **1.154 de verificări statice trecute**. Consola browserului nu a afișat erori sau avertismente ale site-ului. Site-ul rămâne local; publicarea și DNS-ul nu au fost modificate.

## Sertare, cusătură, pensulă și salut — 17 noiembrie 2026

- FAQ: mânere SVG și deschidere ca un sertar, cu animație finită de 340 ms. Testate deschiderea cu click și închiderea cu Enter; răspunsurile rămân în elemente native details/summary.
- Butonul principal: cusătură CSS și ac de 550 ms la hover/focus. Verificat focusul vizibil prin tastatură și activarea animației acului.
- Logo: patină decorativă curățată de o pensulă în 1,1 s; o singură iterație, fără ascunderea textului sau schimbarea dimensiunii antetului.
- Scăunel: observat în browser salutul la încărcare (`chair-greeting`), apoi terminarea lui. Scena de contact așază pensula lângă scaun și rămâne sub textele de contact; verificată poziția sub telefon/localitate și ascunderea scăunelului fix la contact.
- RO: verificat FAQ pe desktop la 1440 px și FAQ/contact la 320 px. RU: FAQ/contact la 320 și 961 px. Fără depășiri orizontale, texte tăiate sau decor care acoperă contactele în stările verificate.
- Nu sunt adăugate biblioteci, fișiere imagine, bucle permanente de animație sau cereri de rețea pentru aceste efecte. CSS dezactivează mișcarea la prefers-reduced-motion; scăunelul are aceeași verificare și în JavaScript. Preferința redusă a fost verificată prin cod, fără schimbarea setărilor sistemului.
- `npm run build` și `npm run check`: finalizate, **1.154 de verificări statice trecute**. Sintaxa modulelor SVG/JavaScript este validă. Fără erori sau avertismente ale site-ului în consola browserului.
