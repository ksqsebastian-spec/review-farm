import { bySlug } from './companies.js';
import { indexPage, qrPage, reviewPage } from './site.js';

const html = (body, maxAge) => new Response(body, {
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': `public, max-age=${maxAge}`,
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
    if (path === '/') return html(indexPage(), 300);

    const review = path.match(/^\/r\/([a-z0-9-]+)$/);
    if (review && bySlug[review[1]]) return html(reviewPage(bySlug[review[1]]), 300);

    const staff = path.match(/^\/([a-z0-9-]+)$/);
    if (staff && bySlug[staff[1]]) return html(qrPage(bySlug[staff[1]], url.origin), 300);

    return Response.redirect(`${url.origin}/`, 302);
  },
};
