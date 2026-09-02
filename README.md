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
| `/l/<datei>`   | –           | Logos (ein Jahr cachebar) |

Betriebe: `hantke`, `brink`, `seehafer`, `werner-bau`, `werner-geruestbau`,
`mehlig`, `bsi`, `groundpassion`, `networking`.

## Bewertungstexte

Die Texte stehen **nicht** als fertige Liste in der Datei. Jeder Aufruf setzt
einen neuen Text aus vier Bausteinen zusammen (`src/review-text.js`):

1. ein Einstiegssatz zum Auftrag,
2. eine Bemerkung dazu, wie die Arbeit lief,
3. optional ein Detail,
4. eine Empfehlung mit passendem Suchbegriff.

Jeder Einstiegssatz bringt seine eigenen Suchbegriffe mit, damit die Empfehlung
am Ende zum beschriebenen Auftrag passt (eine Bautrocknung endet nicht mit
„Empfehlung für Fassadenanstrich"). Das ergibt **2.300 bis 8.800 Varianten pro
Betrieb**, zusammen gut 57.000. Die Seite wird mit `no-store` ausgeliefert, also
sieht jeder Kunde einen anderen Text; „Anderer Text" würfelt sofort neu, und der
Kunde kann vor dem Absenden alles ändern.

Das ist Absicht: Google filtert Bewertungen heraus, die sich stark ähneln –
identische Texte würden dem Profil eher schaden als nützen. Bewertungen sollten
außerdem von echten Kunden nach einem echten Auftrag kommen und nicht mit
Rabatten o. Ä. erkauft werden, sonst drohen Löschung oder eine Sperre des
Profils.

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
