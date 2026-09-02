// Builds a review suggestion by combining one opening sentence, one remark about
// how the job went, an optional detail and one closing recommendation. Every
// opening sentence carries the search terms that actually fit the job it
// describes, so the closing recommendation never talks about a different trade.
//
// Each company's grammar yields a few thousand combinations, so two customers
// practically never hand in the same text — which matters, because Google filters
// out reviews that read like copies of each other.
//
// Used on the server to render the first suggestion, and inlined into the page
// (via Function.prototype.toString) so "anderer Text" can regenerate without a
// round trip. It must therefore stay pure and reference nothing outside its args.
export function buildReview(g, rnd) {
  var pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
  var opener = pick(g.open);                       // [sentence, ...keywords]
  var parts = [opener[0], pick(g.quality)];
  if (g.extra && g.extra.length && rnd() < 0.55) parts.push(pick(g.extra));
  parts.push(pick(g.close).replace('{kw}', pick(opener.slice(1))));
  return parts.join(' ');
}

/** How many distinct texts a grammar can produce. */
export function variantCount(g) {
  var extra = g.extra && g.extra.length ? g.extra.length + 1 : 1;
  return g.open.reduce(function (n, o) {
    return n + (o.length - 1) * g.close.length;
  }, 0) * g.quality.length * extra;
}
