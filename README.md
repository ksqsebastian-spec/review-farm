# Gruppenwerk · Google-Bewertungen

Eine sehr kleine Seite, mit der Mitarbeiter am Ende eines Auftrags einen QR-Code
zeigen. Der Kunde scannt, tippt einen fertigen Textvorschlag an und landet mit dem
Text in der Zwischenablage direkt bei Google.

```
Mitarbeiter                          Kunde
────────────────────────────────     ──────────────────────────────────
Seite öffnen                         QR scannen
Betrieb antippen        ──QR──▶      Text antippen (wird kopiert)
QR-Code zeigen                       Bei Google einfügen, absenden
```

## Seiten

| Pfad          | Für wen      | Inhalt |
|---------------|--------------|--------|
| `/`           | Mitarbeiter  | Liste aller Betriebe |
| `/<betrieb>`  | Mitarbeiter  | Großer QR-Code zum Vorzeigen, z. B. `/hantke` |
| `/r/<betrieb>`| Kunde        | Ziel des QR-Codes: Textvorschläge + Google-Link |

Die Betriebe: `hantke`, `brink`, `seehafer`, `werner-bau`, `werner-geruestbau`,
`mehlig`, `bsi`, `groundpassion`, `networking`.

## Google Place IDs eintragen (empfohlen, ~5 Minuten)

Ohne Place ID landet der Kunde auf dem Google-Maps-Eintrag des Betriebs und muss
dort noch einmal auf „Rezension schreiben“ tippen. **Mit** Place ID öffnet sich das
Bewertungsfenster sofort — ein Tipp weniger.

1. https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder öffnen
2. Betrieb suchen (Name + Adresse), die angezeigte Place ID kopieren (beginnt mit `ChIJ…`)
3. In `src/companies.js` beim passenden Betrieb eintragen:
   ```js
   placeId: 'ChIJ...',
   ```
4. `npm run build` und neu deployen

Alternativ steht im Google-Unternehmensprofil unter „Bewertungen erhalten“ ein
fertiger Kurzlink (`https://g.page/r/…/review`). Wer den lieber nutzt, kann
`reviewUrl()` in `src/companies.js` entsprechend anpassen.

## Textvorschläge

Pro Betrieb liegen mehrere Vorschläge in `src/companies.js`. Sie greifen die
Leistungen und die Selbstdarstellung der jeweiligen Website auf und nennen Gewerk
und Ort, damit die Bewertungen für die lokale Suche etwas hergeben.

Die Seite zeigt pro Aufruf drei zufällig gewählte Vorschläge, und der Kunde kann
den Text vor dem Absenden frei ändern. Das ist Absicht: Google filtert
Bewertungen heraus, die sich stark ähneln — identische Texte würden dem Profil
eher schaden. Bewertungen sollten außerdem von echten Kunden nach einem echten
Auftrag kommen und nicht mit Rabatten o. Ä. erkauft werden, sonst drohen
Löschung oder eine Sperre des Profils.

## Entwicklung

```bash
npm install
npm test              # QR-Encoder gegen die Referenzbibliothek prüfen
npm run build         # dist/worker.js bauen
node test/serve.mjs   # lokale Vorschau auf http://localhost:8787
node test/e2e.mjs     # QR-Codes einscannen + Klickstrecke prüfen
```

`src/qr.js` erzeugt die QR-Codes selbst, damit der Worker sie für die Domain
rendern kann, unter der er gerade läuft — kein externer Bilddienst, keine
CDN-Abhängigkeit, und die Codes brechen nicht, wenn später eine eigene Domain
davorgehängt wird. Die Ausgabe ist gegen die `qrcode`-Referenzbibliothek
verifiziert (`npm test`).

## Deployment

Cloudflare Worker. Nach Änderungen:

```bash
npm run build
npx wrangler deploy          # benötigt CLOUDFLARE_API_TOKEN
```
