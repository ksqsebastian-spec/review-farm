// One entry per customer-facing Gruppenwerk company.
//
// placeId: the Google Place ID of the company's Business Profile. When set, the
// review link opens Google's "write a review" dialog directly. When null, the
// link falls back to a Google Maps search for the business, where the customer
// taps "Rezension schreiben" — one extra tap, but it works with no setup.
// See README.md for how to look a Place ID up.
//
// reviews: suggested review texts. Several per company on purpose — Google
// filters out reviews that are near-duplicates of each other, so everyone
// handing in the same sentence would defeat the point. Each one is phrased
// around the services and wording the company uses on its own website.

export const companies = [
  {
    slug: 'hantke',
    name: 'Maler Hantke',
    legal: 'Tomas Hantke Malermeister GmbH',
    trade: 'Malerbetrieb',
    address: 'Bötelkamp 31, 22529 Hamburg',
    site: 'maler-hantke.de',
    accent: '#e0603a',
    placeId: null,
    reviews: [
      'Maler Hantke hat unsere Wohnung in Hamburg komplett gestrichen und tapeziert. Saubere Arbeit, die Termine wurden eingehalten und die Farbberatung war richtig hilfreich. Klare Empfehlung für einen Malerbetrieb in Hamburg.',
      'Wir hatten einen Wasserschaden und Maler Hantke hat die Bautrocknung und die anschließende Renovierung übernommen. Schnelle Reaktion, faire Preise, am Ende sah alles besser aus als vorher. Top Malerbetrieb aus Hamburg.',
      'Fassadenanstrich an unserem Haus in Hamburg – von der Beratung bis zur Ausführung alles top. Das Team arbeitet sauber, pünktlich und denkt mit. Gerne wieder.',
      'Spachteln, Glätten und die Türen lackieren – Maler Hantke hat alles in einem Rutsch erledigt. Ordentliche Baustelle, freundliche Handwerker, ehrliche Beratung. Für Malerarbeiten in Hamburg absolut zu empfehlen.',
      'Böden verlegt und Wände gestrichen, alles termingerecht und ohne Diskussionen. Sehr angenehme Zusammenarbeit mit einem zuverlässigen Malerbetrieb in Hamburg.',
    ],
  },
  {
    slug: 'brink',
    name: 'Tischlerei Brink',
    legal: 'Karl Brink Tischlereibetrieb GmbH',
    trade: 'Fenster, Türen & Sicherheit',
    address: 'Heselstücken 10, 22453 Hamburg',
    site: 'tischlerei-brink.de',
    accent: '#2f7d5c',
    placeId: null,
    reviews: [
      'Nach einem Einbruchversuch hat die Tischlerei Brink unsere Fenster gesichert – Pilzzapfenverriegelung nachgerüstet und alles neu eingestellt. Jemand war innerhalb von 24 Stunden da. Sehr zu empfehlen für Fenster und Türen in Hamburg.',
      'Unsere alten Holzfenster waren an mehreren Stellen morsch. Tischlerei Brink hat sie mit Repair Care repariert statt sie komplett zu tauschen – deutlich günstiger und sieht aus wie neu. Ehrliche Beratung, saubere Tischlerarbeit.',
      'Türschloss defekt, Notdienst angerufen, am nächsten Tag war jemand vor Ort. Schnell, freundlich und fair abgerechnet. Für Fenster- und Türreparaturen in Hamburg die richtige Adresse.',
      'Wir lassen als Hausverwaltung regelmäßig die Fenster und Türen von Tischlerei Brink warten. Zuverlässig, gut organisiert, und die Dichtungen werden gleich mit getauscht. Spart uns langfristig richtig Geld.',
      'Kostenloser Sicherheits-Check gemacht, danach Fenster und Haustür nachgerüstet. Man merkt die jahrzehntelange Erfahrung als Meisterbetrieb. Top Tischlerei in Hamburg.',
    ],
  },
  {
    slug: 'seehafer',
    name: 'Seehafer Elemente',
    legal: 'Alfred Seehafer GmbH',
    trade: 'Fenster, Türen & Objekttüren',
    address: 'Heselstücken 10, 22453 Hamburg',
    site: 'seehafer-elemente.de',
    accent: '#1f6feb',
    placeId: null,
    reviews: [
      'Seehafer Elemente hat die Objekttüren in unserer Wohnanlage in Hamburg erneuert. Schallschutz und Einbruchschutz sind deutlich besser, die Montage lief reibungslos. Sehr professionelles Team.',
      'Neue Fenster fürs ganze Haus – von der Beratung über das Aufmaß bis zum Einbau alles aus einer Hand. Saubere Montage, Termine eingehalten. Empfehlenswerter Fensterbauer in Hamburg.',
      'Wir haben die jährliche Wartung unserer Türen an Seehafer Elemente vergeben. Alles wird ordentlich dokumentiert und kleine Mängel werden direkt behoben. Man merkt, dass die seit Jahrzehnten wissen, was sie tun.',
      'Reparatur an der Haustür – Beschlag und Dichtung getauscht, die Tür schließt wieder wie neu. Schnelle Terminvergabe und fairer Preis. Danke an das Team von Seehafer Elemente in Hamburg.',
      'Als Hausverwaltung arbeiten wir seit Jahren mit Seehafer Elemente zusammen. Zuverlässig bei Wartung und Service, gute Erreichbarkeit, saubere Ausführung. Sehr zu empfehlen.',
    ],
  },
  {
    slug: 'werner-bau',
    name: 'Werner Bau',
    legal: 'Werner GmbH Bauunternehmung',
    trade: 'Fassaden- & Gebäudesanierung',
    address: 'Heselstücken 10, 22453 Hamburg',
    site: 'werner-bau.eu',
    accent: '#8a5a2b',
    placeId: null,
    reviews: [
      'Werner Bau hat die Fassade unseres Altbaus in Hamburg saniert. Die Klinkerarbeiten sind top ausgeführt, die Baustelle war immer sauber und die Kommunikation vorbildlich. Für Fassadensanierung in Hamburg eine klare Empfehlung.',
      'Komplette Wohnungssanierung über Werner Bau – alle Gewerke aus einer Hand koordiniert. Der Zeitplan wurde gehalten und die Qualität stimmt. Sehr erfahrenes Bauunternehmen.',
      'Balkonsanierung an unserem Mehrfamilienhaus. Die Ursache wurde vorher sauber analysiert statt einfach drüberzustreichen – genau so soll es sein. Ehrliche und qualifizierte Bauunternehmung aus Hamburg.',
      'Wir haben mit Werner Bau ein öffentliches Gebäude saniert. Zuverlässig, VOB-sicher und fachlich stark bei historischen Klinkerfassaden. Gerne wieder.',
      'Gebäudesanierung inklusive Putz-, Maler- und Fliesenarbeiten. Ein Ansprechpartner für alles, klare Absprachen und ein sehr gutes Ergebnis. Empfehlenswert.',
    ],
  },
  {
    slug: 'werner-geruestbau',
    name: 'J. Werner Gerüstbau',
    legal: 'J. Werner Gerüstbau GmbH & Co. KG',
    trade: 'Gerüstbau',
    address: 'Werner-Siemens-Str. 105, 22113 Hamburg',
    site: 'j-werner-geruestbau.de',
    accent: '#c9911d',
    placeId: null,
    reviews: [
      'J. Werner Gerüstbau hat unser Einfamilienhaus in Hamburg eingerüstet. Aufbau pünktlich, das Gerüst stand sicher, Abbau nach Absprache sofort. Unkompliziert und zuverlässig.',
      'Für unsere Fassadensanierung brauchten wir kurzfristig ein Gerüst – Werner Gerüstbau war innerhalb weniger Tage vor Ort. Faires Angebot, saubere Ausführung. Empfehlung für Gerüstbau in Hamburg.',
      'Wetterschutzdach über die Baustelle, alles fachgerecht geplant und montiert. Man merkt die jahrzehntelange Erfahrung. Sehr guter Gerüstbauer aus Hamburg.',
      'Großes Wohnprojekt eingerüstet – Termintreue und Sicherheit waren top, Rückfragen wurden sofort geklärt. Sehr angenehme Zusammenarbeit.',
      'Gerüst für ein öffentliches Gebäude, alles nach Vorschrift und ohne Verzögerung. Zuverlässiger Partner für Gerüstbau in Hamburg.',
    ],
  },
  {
    slug: 'mehlig',
    name: 'Tischlerei Mehlig',
    legal: 'tischlerei mehlig gmbH',
    trade: 'Innenausbau & Objekteinrichtung',
    address: 'Beesenweide 14, 25436 Moorrege',
    site: 'mehlig-gmbh.de',
    accent: '#6b4fa3',
    placeId: null,
    reviews: [
      'Die Tischlerei Mehlig hat unseren kompletten Innenausbau umgesetzt – Einbauschränke nach Maß, perfekt verarbeitet. Handwerklich auf höchstem Niveau. Empfehlung für Innenausbau im Raum Hamburg und Pinneberg.',
      'Wir haben unser Restaurant von Mehlig einrichten lassen. Vom Entwurf bis zur Montage alles aus einer Hand, Termine wurden gehalten und die Qualität ist außergewöhnlich.',
      'Maßmöbel für unser Wohnzimmer – Beratung, Materialauswahl und Ausführung waren erstklassig. Diskret, sauber und absolut zuverlässig. Top Tischlerei in Moorrege.',
      'Büroeinrichtung durch die Tischlerei Mehlig. Individuelle Lösungen statt Standard von der Stange, alles perfekt eingepasst. Sehr zu empfehlen für Objekteinrichtung.',
      'Exklusiver Innenausbau für unser Hotel, termingerecht und in hervorragender Qualität umgesetzt. Ein Tischlerbetrieb, dem man große Projekte bedenkenlos anvertrauen kann.',
    ],
  },
  {
    slug: 'bsi',
    name: 'Gruppenwerk BSI',
    legal: 'Gruppenwerk BSI Bausanierung und Instandhaltung GmbH',
    trade: 'Sanierung, Planung & Leckortung',
    address: 'Bötelkamp 31, 22529 Hamburg',
    site: 'gruppenwerk-bau.de',
    accent: '#3d7a8c',
    placeId: null,
    reviews: [
      'Gruppenwerk BSI hat unsere Dachaufstockung geplant und die Bauleitung übernommen. Der Bauantrag lief reibungslos und die Kosten blieben im Rahmen. Sehr kompetente Sanierungsplanung in Hamburg.',
      'Wasserschaden mit unklarer Ursache – die Leckortung von Gruppenwerk BSI hat die Stelle punktgenau gefunden, ohne die halbe Wohnung aufzureißen. Schnell und professionell.',
      'Komplettsanierung unserer Wohnung in vier Wochen, koordiniert von Gruppenwerk BSI. Klare Ansagen, realistische Termine, gutes Ergebnis. Empfehlenswert für Bausanierung in Hamburg.',
      'Von der Bestandsaufnahme über den Bauantrag bis zur fertigen Sanierung alles aus einer Hand. Man wird gut informiert und muss sich um nichts kümmern. Danke!',
      'Umbau und Ausbau unseres Gebäudes professionell begleitet. Erfahrene Bauleitung, verlässliche Planung und ehrliche Kostenschätzung. Gerne wieder.',
    ],
  },
  {
    slug: 'groundpassion',
    name: 'GroundPassion',
    legal: 'Ein Service von Gruppenwerk BSI GmbH',
    trade: 'Immobilien-Investment',
    address: 'Bötelkamp 31, 22529 Hamburg',
    site: 'groundpassion.de',
    accent: '#2f6b4f',
    placeId: null,
    reviews: [
      'GroundPassion hat uns beim Kauf unserer ersten Anlageimmobilie begleitet. Der Quick-Check war ehrlich – auch bei Objekten, von denen abgeraten wurde. Sehr seriöse Immobilienberatung in Hamburg.',
      'Von der Investmentstrategie über die Finanzierung bis zur Vermietung alles begleitet. Das Team denkt langfristig, statt schnell etwas verkaufen zu wollen. Klare Empfehlung.',
      'Wir haben unser Portfolio mit GroundPassion optimiert und ein Objekt erfolgreich verkauft. Fundierte Analysen, realistische Zahlen, kein Verkaufsdruck. Top Beratung rund um Immobilien-Investment.',
      'Sehr gute Begleitung bei Standortanalyse und Due Diligence. Man bekommt Fakten statt Versprechen. Für Kapitalanlagen in Hamburg absolut empfehlenswert.',
    ],
  },
  {
    slug: 'networking',
    name: 'Gruppenwerk Networking',
    legal: 'Gruppenwerk Networking GmbH',
    trade: 'Coworking für Bau & Immobilien',
    address: 'Bötelkamp 31, 22529 Hamburg',
    site: 'gruppenwerk-networking.de',
    accent: '#a13d6b',
    placeId: null,
    reviews: [
      'Super Coworking Space in Hamburg mit echtem Branchenfokus – hier sitzen Leute aus Bau, Immobilien und Architektur zusammen. Daraus sind bei uns schon mehrere Projekte entstanden.',
      'Modernes Büro, schnelles Internet, gute Meetingräume und eine angenehme Lounge. Monatlich kündbar, und man kann jederzeit Plätze dazunehmen. Sehr empfehlenswert.',
      'Wir sind als kleines Team eingezogen und fühlen uns sehr wohl. Freundliche Betreuung, gute Ausstattung und ein Netzwerk, das wirklich etwas bringt. Top Coworking in Hamburg.',
      'Schöne Räume, faire Konditionen und echte Kontakte in die Bau- und Immobilienbranche. Deutlich besser als ein anonymes Großraumbüro.',
    ],
  },
];

export const bySlug = Object.fromEntries(companies.map((c) => [c.slug, c]));

/** Where the customer is sent to leave the review. */
export function reviewUrl(c) {
  return c.placeId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(c.placeId)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.gmbName || c.name} ${c.address}`)}`;
}
