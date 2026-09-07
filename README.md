# Gruppenwerk · Google-Bewertungen

Eine sehr kleine Seite, mit der Mitarbeiter am Ende eines Auftrags einen QR-Code
zeigen. Der Kunde scannt, bekommt einen fertig formulierten Bewertungstext und
landet mit einem Tipp direkt im Google-Bewertungsfenster – der Text liegt dabei
schon in der Zwischenablage.

```
Mitarbeiter                          Kunde
────────────────────────────────     ──────────────────────────────────
Seite öffnen                         QR scannen
Betrieb antippen        ──QR──▶      Vorschlag lesen (oder neu würfeln)
QR-Code zeigen                       Ein Tipp → Google → einfügen, fertig
```

**Live:** https://gruppenwerk-bewertungen.ksqsebastian.workers.dev

## Seiten

| Pfad           | Für wen     | Inhalt |
|----------------|-------------|--------|
| `/`            | Mitarbeiter | Liste aller Betriebe |
| `/<betrieb>`   | Mitarbeiter | Großer QR-Code zum Vorzeigen, z. B. `/hantke` |
| `/r/<betrieb>` | Kunde       | Ziel des QR-Codes: Textvorschlag + Google-Link |
| `/r/<betrieb>?selbst=1` | Kunde | Variante: Kunde beantwortet zwei Fragen |
| `/l/<datei>`   | –           | Logos (ein Jahr cachebar) |

Betriebe: `hantke`, `brink`, `seehafer`, `werner-bau`, `werner-geruestbau`,
`mehlig`, `bsi`, `groundpassion`, `networking`.

## Textvorschlag (Standard)

Unter `/r/<betrieb>` bekommt der Kunde einen fertigen Satzvorschlag, den er
antippen, ändern oder neu würfeln kann. Der Text kommt **nicht** aus einer Liste
fertiger Bewertungen, sondern wird pro Aufruf aus Bausteinen zusammengesetzt
(`src/review-text.js`):

1. ein Einstiegssatz zum Auftrag,
2. optional ein Detail zum Betrieb,
3. ein bis zwei Bemerkungen dazu, wie die Arbeit lief,
4. eine Empfehlung mit passendem Suchbegriff,
5. optional ein kurzer Schlusssatz.

Welche Teile vorkommen und in welcher Reihenfolge, würfelt der Generator
mit — mal drei Sätze, mal einer. Sonst hat jeder Text dieselbe Silhouette,
und daran erkennt man generierten Text schneller als an einzelnen Wörtern.

Jeder Einstiegssatz bringt seine eigenen Suchbegriffe mit, damit die Empfehlung
am Ende zum beschriebenen Auftrag passt (eine Bautrocknung endet nicht mit
„Empfehlung für Fassadenanstrich"). Die Seite wird mit `no-store` ausgeliefert,
jeder Kunde sieht also einen anderen Text; „Anderer Text" würfelt sofort neu.

### Warum das nicht nach Werbetext klingt

Die Bausteine sind in dem Register geschrieben, in dem Leute tatsächlich eine
Bewertung tippen — kurz, gesprochen, oft ohne Artikel:

> Treppenhaus neu streichen lassen, gemacht hat es Maler Hantke. Termin hat
> gepasst und wir wurden gut informiert. Für einen Maler in Hamburg klare
> Empfehlung.

Konkret heißt das: keine Gedankenstriche (das deutlichste Erkennungszeichen für
generierten Text), kein Amtsdeutsch wie „die Ausführung war handwerklich
einwandfrei", verbfreie Aufzählungen statt vollständiger Nebensätze, gelegentlich
ein Ausrufezeichen oder ein 👍, und Sätze, die auch mal mit dem Urteil anfangen
statt mit dem Auftrag.

Der Preis dafür: die Suchbegriffe stehen im Akkusativ („einen Maler in Hamburg"),
also darf im Empfehlungssatz nur „für {kw}" oder ein Objekt davorstehen. Eine
Dativ-Präposition ergibt „Bei ein Büro in Hamburg …". `test/e2e.mjs` prüft das.

### Warum das keine Duplikate erzeugt

Die erste Fassung hatte ganze Sätze im Pool, die sich alle neun Betriebe teilten.
Eine Simulation bei realistischem Aufkommen (78 Bewertungen im Jahr, auf neun
Betriebe verteilt) ergab dort im schlechtesten Fall 20 wortgleiche
Wiederholungen eines Satzes und einen Satz, der bei acht der neun Betriebe
auftaucht. Genau darauf reagiert Google: Beinahe-Duplikate werden auf Satzebene
erkannt, und identische Sätze über mehrere verbundene Betriebe hinweg sind das
auffälligste Muster.

Zwei Änderungen beheben das strukturell:

* **Sätze entstehen aus Teilsätzen.** Statt „die Arbeit wurde sauber ausgeführt."
  als fertigem Satz werden zwei Teilsätze zufällig kombiniert — mit `und`, mit
  Komma, oder als zwei getrennte kurze Sätze. Aus 10 Bausteinen werden so 90.
* **Getrennte Wortvorräte pro Betrieb** (`src/phrases.js`). Die Pools werden
  reihum verteilt, sodass **kein Baustein bei zwei Betrieben vorkommt**.

Gemessen über 400 simulierte Jahre à 78 Bewertungen:

| | |
|---|---|
| identische ganze Texte | 0,00 pro Jahr |
| Betriebe, die sich einen Satz teilen | 1 (Ziel: 1) |
| häufigste Satzwiederholung, schlechtester Lauf | 7× (typisch 3–4×) |
| Textlänge | 64–353 Zeichen, ⌀ 179 |

## Prompt-Modus (`?selbst=1`)

Unter `/r/<betrieb>?selbst=1` bekommt der Kunde **keinen fertigen Text**, sondern
zwei kurze Fragen:

1. *Was haben wir für Sie gemacht?*
2. *Was hat Ihnen gefallen?*

Darunter stehen kurze Stichworte zum Antippen (*„Fenster repariert"*,
*„pünktlich"*, *„in Hamburg"*) — bewusst nur Fragmente, nie fertige Sätze. Aus
den beiden Antworten wird live die Bewertung zusammengesetzt, die der Kunde vor
dem Absenden sieht. Der Button bleibt gesperrt, bis wirklich etwas dasteht.

Damit sind die Bewertungen inhaltlich die des Kunden — die sauberste Variante,
wenn Rückfragen zu erwarten sind. Sie kostet aber Zeit am Kunden, deshalb ist
der Textvorschlag der Standard.

## Ablauf und Grenzen

Wichtig für den Ablauf: **der Kunde scannt mit seinem eigenen Handy.** Tippt er
auf dem Firmenhandy, hängen alle Bewertungen an einem Google-Konto bzw. einem
Gerät. Wenn der QR-Code nicht gescannt werden kann, den Link über „Link teilen"
per WhatsApp/SMS schicken.

Bewertungen sollten von echten Kunden nach einem echten Auftrag kommen und nicht
mit Rabatten o. Ä. erkauft werden, sonst drohen Löschung oder eine Sperre des
Profils. Ein vorgeschlagener Text bleibt ein vorgeschlagener Text — der Kunde
muss ihn lesen und darf ihn ändern, sonst sind es nicht seine Worte.

Inhaltlich greifen die Bausteine die Leistungen und die Selbstdarstellung der
jeweiligen Website auf und nennen Gewerk und Ort, damit die Bewertungen für die
lokale Suche etwas hergeben.

## Google Place IDs

Acht Betriebe haben eine hinterlegte Place ID – der Link öffnet damit direkt das
Bewertungsfenster. Jede ID wurde vor dem Eintragen gegen Google Maps geprüft
(Firmenname, Website und Telefonnummer mussten übereinstimmen).

**Gruppenwerk Networking** hat kein eigenes Google-Unternehmensprofil (die Suche
liefert den BSI-Eintrag an derselben Adresse). Dort führt der Link auf die
Google-Maps-Suche. Sobald ein Profil existiert, in `src/companies.js` die
`placeId` eintragen — zu finden über den
[Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder).

## Logos

Unter `src/assets/` liegen die echten Logos der Betriebe, von deren Websites
geholt und optimiert. Zwei davon (Brink, Gruppenwerk) sind im Original weiß für
dunkle Kopfzeilen gezeichnet und wurden auf `currentColor` umgestellt, damit sie
auf hellem Grund sichtbar sind.

## Entwicklung

```bash
npm install
npm test              # QR-Encoder gegen die Referenzbibliothek prüfen
npm run build         # dist/worker.js bauen
node test/serve.mjs   # lokale Vorschau auf http://localhost:8787
node test/e2e.mjs     # QR-Codes einscannen, Klickstrecke und Textvielfalt prüfen
node test/shots.mjs   # Screenshots nach /tmp/shot-*.png
```

`src/qr.js` erzeugt die QR-Codes selbst, damit der Worker sie für die Domain
rendert, unter der er gerade läuft — kein externer Bilddienst, keine
CDN-Abhängigkeit, und die Codes brechen nicht, wenn später eine eigene Domain
davorgehängt wird. Die Ausgabe ist gegen die `qrcode`-Referenzbibliothek
verifiziert (`npm test`), und `test/e2e.mjs` scannt die gerenderten Codes mit
einem echten Decoder wieder ein.

## Deployment

Cloudflare Worker `gruppenwerk-bewertungen`.

```bash
npm run build
npx wrangler deploy          # benötigt CLOUDFLARE_API_TOKEN
```
