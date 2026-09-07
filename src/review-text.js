// Baut einen Bewertungsvorschlag zusammen.
//
// Der Text soll klingen, als hätte ihn jemand am Handy getippt: kurz, in der
// Länge unterschiedlich, mal mit Empfehlung, mal ohne. Deshalb wird nicht immer
// dasselbe Gerüst befüllt, sondern zuerst eine Satzform gewürfelt — sonst hat
// jeder Text dieselbe Silhouette, und genau daran erkennt man generierten Text
// schneller als an einzelnen Wörtern.
//
// Die Qualitäts-, Empfehlungs- und Schlussbausteine sind pro Betrieb exklusiv
// (siehe src/phrases.js), deshalb kann derselbe Satz nie bei zwei Betrieben der
// Gruppe auftauchen. Die Suchbegriffe hängen am Auftragssatz, damit die
// Empfehlung am Ende zum beschriebenen Auftrag passt.
//
// Wird serverseitig für den ersten Vorschlag benutzt und per
// Function.prototype.toString in die Seite eingebettet, damit "anderer Text"
// ohne Neuladen funktioniert — die Funktion muss deshalb rein bleiben und darf
// nichts außerhalb ihrer Argumente referenzieren.
export function buildReview(g, rnd) {
  var pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  var job = pick(g.open);              // [Satz, ...passende Suchbegriffe]
  var kw = pick(job.slice(1));

  // Zwei verschiedene Bausteine, zufällig verbunden. Bei '. ' werden daraus
  // zwei kurze Sätze, was den Rhythmus deutlich mehr aufbricht als ein Komma.
  var rest = g.quality.slice();
  var a = rest.splice(Math.floor(rnd() * rest.length), 1)[0];
  var quality;
  if (rnd() < 0.28) {
    quality = cap(a) + '.';
  } else {
    var b = pick(rest);
    var join = pick(g.join);
    quality = join === '. ' ? cap(a) + '. ' + cap(b) + '.' : cap(a) + join + b + '.';
  }

  var recommend = cap(pick(g.recommend).replace('{kw}', kw)) + '.';
  var closer = pick(g.closer);

  // Satzform würfeln. Kurze Bewertungen sind der Normalfall, nicht die Ausnahme.
  // Wenn etwas vor dem Auftragssatz steht, dann ein Schlussbaustein: die sind
  // alle Urteile ("Alles bestens.") und funktionieren als Einstieg. Ein
  // Qualitätsbaustein vorn ("Termine wurden von sich aus bestätigt.") würde
  // dagegen von etwas reden, das der Leser noch gar nicht kennt.
  var out;
  var shape = rnd();
  if (shape < 0.16) out = [job[0], quality];
  else if (shape < 0.30) out = [job[0], quality, closer];
  else if (shape < 0.46) out = [closer, job[0], quality];
  else if (shape < 0.58) out = [job[0], recommend, closer];
  else {
    out = [job[0], quality, recommend];
    if (rnd() < 0.35) out.push(closer);
  }
  if (out.indexOf(recommend) < 0 && rnd() < 0.45) out.push(recommend);

  // Ein Detail zum Betrieb schiebt sich gelegentlich hinter den Auftragssatz.
  if (g.extra && g.extra.length && rnd() < 0.28) {
    var at = out.indexOf(job[0]);
    if (at >= 0) out.splice(at + 1, 0, pick(g.extra));
  }

  var text = out.join(' ');
  if (rnd() < 0.12) text = text.replace(/\.$/, '!');
  return text;
}

/** Grobe Zahl möglicher Texte - für den Bericht, nicht für die Logik. */
export function variantCount(g) {
  var jobs = g.open.reduce(function (n, o) { return n + (o.length - 1); }, 0);
  var q = g.quality.length;
  var quality = q + q * (q - 1) * g.join.length;
  var extra = 1 + (g.extra ? g.extra.length : 0);
  var rec = 1 + g.recommend.length;
  var close = 1 + g.closer.length;
  return jobs * quality * extra * rec * close;
}
