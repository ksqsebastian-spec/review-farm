import { bySlug } from './companies.js';
import { logos } from './logos.js';
import { indexPage, qrPage, reviewPage, promptPage } from './site.js';

const html = (body, cache) => new Response(body, {
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': cache,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
  },
});

export default {
  fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    const logo = path.match(/^\/l\/([a-z0-9-]+\.(?:svg|png))$/);
    if (logo && logos[logo[1]]) {
      const { type, body } = logos[logo[1]];
      return new Response(body, {
        headers: {
          'content-type': type,
          'cache-control': 'public, max-age=31536000, immutable',
          'x-content-type-options': 'nosniff',
        },
      });
    }

    if (path === '/') return html(indexPage(), 'public, max-age=300');

    // Standard ist der fertige Vorschlag - ein Tipp, fertig. Er wird pro Aufruf
    // neu erzeugt, darf also nie gecacht werden. ?selbst=1 liefert stattdessen
    // die Variante, bei der der Kunde den Text über zwei Fragen selbst schreibt.
    const review = path.match(/^\/r\/([a-z0-9-]+)$/);
    if (review && bySlug[review[1]]) {
      const c = bySlug[review[1]];
      return url.searchParams.has('selbst')
        ? html(promptPage(c), 'public, max-age=300')
        : html(reviewPage(c), 'no-store');
    }

    const staff = path.match(/^\/([a-z0-9-]+)$/);
    if (staff && bySlug[staff[1]]) return html(qrPage(bySlug[staff[1]], url.origin), 'public, max-age=300');

    return Response.redirect(`${url.origin}/`, 302);
  },
};
