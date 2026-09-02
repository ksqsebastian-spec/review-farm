// Baut einen Bewertungsvorschlag zusammen.
//
// Aufbau: Auftragssatz → (optional) Detail → Qualitätssatz aus zwei verbundenen
// Hauptsätzen → (optional) Empfehlung → (optional) kurzer Schluss. Welche Teile
// vorkommen, entscheidet der Zufall mit, damit die Texte auch in Länge und Form
// variieren und nicht alle gleich gebaut wirken.
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
  var out = [job[0]];

  if (g.extra && g.extra.length && rnd() < 0.45) out.push(pick(g.extra));

  // Zwei verschiedene Bausteine, zufällig verbunden - das trägt die meiste Varianz.
  var rest = g.quality.slice();
  var first = rest.splice(Math.floor(rnd() * rest.length), 1)[0];
  var quality = rnd() < 0.82 ? first + pick(g.join) + pick(rest) : first;
  out.push(cap(quality) + '.');

  if (rnd() < 0.85) out.push(cap(pick(g.recommend).replace('{kw}', pick(job.slice(1)))) + '.');
  if (rnd() < 0.4) out.push(pick(g.closer));

  return out.join(' ');
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
