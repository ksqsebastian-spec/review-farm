import { companies, bySlug, reviewUrl } from './companies.js';
import { qrSvg } from './qr.js';
import { buildReview } from './review-text.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

const CSS = `
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%;background:#fff}
body{margin:0;background:#fff;color:#111;
  font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
.wrap{max-width:480px;margin:0 auto;padding:22px 20px 60px}
a{color:inherit}
img{max-width:100%}
h1{font-size:22px;font-weight:600;letter-spacing:-.01em;margin:0 0 2px}
.muted{color:#737373}
.small{font-size:13.5px}
.brand{display:flex;align-items:center;gap:9px;margin-bottom:30px}
.brand img{height:20px;width:auto}
.brand span{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#111}
.rows{border-top:1px solid #e5e5e5;margin-top:20px}
.row{display:flex;align-items:center;gap:12px;padding:15px 2px;border-bottom:1px solid #e5e5e5;
  text-decoration:none;min-height:62px}
.row:active{background:#fafafa}
.row .t{flex:1;min-width:0}
.row .nm{font-weight:500;display:block}
.row .tr{display:block;color:#737373;font-size:13px;margin-top:2px}
.row .ar{color:#bbb;flex:0 0 auto}
.back{display:inline-block;color:#737373;text-decoration:none;font-size:14px;margin-bottom:22px}
.logo{display:block;height:32px;width:auto;max-width:210px;object-fit:contain;object-position:left;margin-bottom:4px}
.logo.mid{height:36px;max-width:230px;object-position:center;margin:6px auto 22px}
.qr{border:1px solid #e5e5e5;padding:16px;margin-top:22px}
.qr svg{display:block;width:100%;height:auto}
.url{margin:12px 0 0;font:12.5px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#737373;
  word-break:break-all;text-align:center}
.stars{font-size:17px;letter-spacing:3px;color:#111;margin:0 0 10px;text-align:center}
.lead{margin:0 0 22px;text-align:center;color:#444}
.quote{border:1px solid #e5e5e5;padding:17px 18px;font-size:16px;line-height:1.62}
.act{display:block;width:100%;margin-top:14px;padding:16px 14px;border:1px solid #111;background:#111;
  color:#fff;font:inherit;font-weight:500;text-align:center;text-decoration:none;cursor:pointer;
  -webkit-appearance:none;appearance:none;border-radius:0}
.act:active{opacity:.8}
.alt{display:flex;gap:18px;justify-content:center;margin-top:16px}
.alt button,.alt a{background:none;border:0;padding:6px 2px;font:inherit;font-size:14px;color:#737373;
  text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.ghost{display:block;width:100%;margin-top:14px;padding:15px 14px;border:1px solid #d4d4d4;background:#fff;
  color:#111;font:inherit;font-weight:500;text-align:center;text-decoration:none;cursor:pointer;
  -webkit-appearance:none;appearance:none;border-radius:0}
.foot{margin-top:40px;padding-top:16px;border-top:1px solid #e5e5e5;color:#737373;font-size:12.5px;
  text-align:center;line-height:1.7}
.note{margin-top:26px;color:#737373;font-size:13px;text-align:center}
.q{display:block;font-weight:600;font-size:14.5px;margin:20px 0 7px}
.q .n{color:#a3a3a3;font-weight:500;margin-right:7px}
textarea{width:100%;border:1px solid #d4d4d4;padding:12px 13px;font:inherit;font-size:16px;
  line-height:1.5;resize:vertical;border-radius:0;-webkit-appearance:none;background:#fff;color:#111}
textarea:focus{outline:none;border-color:#111}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.chip{border:1px solid #d4d4d4;background:#fff;color:#404040;font:inherit;font-size:13px;
  padding:6px 9px;cursor:pointer;border-radius:0;-webkit-appearance:none;line-height:1.35}
.chip:active{background:#f5f5f5}
.chip.used{border-color:#111;color:#111}
.prev{margin-top:26px;border-top:1px solid #e5e5e5;padding-top:16px}
.prev .lbl{font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#a3a3a3}
.prev p{margin:8px 0 0;font-size:16px;line-height:1.6;min-height:1.6em}
.prev p.empty{color:#a3a3a3}
.act[disabled]{background:#fff;color:#a3a3a3;border-color:#e5e5e5;cursor:default}
.toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,10px);background:#111;color:#fff;
  padding:11px 18px;font-size:14px;opacity:0;pointer-events:none;transition:opacity .16s,transform .16s;z-index:9}
.toast.on{opacity:1;transform:translate(-50%,0)}
`;

function page({ title, description, body, script = '', noStore = false }) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/l/gruppenwerk.svg">
<style>${CSS}</style>
</head><body><div class="wrap">${body}</div>${script ? `<script>${script}</script>` : ''}
${noStore ? '' : ''}</body></html>`;
}

const ARROW = '<svg class="ar" width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true"><path d="M1 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>';

export function indexPage() {
  const rows = companies.map((c) => `<a class="row" href="/${c.slug}">
<span class="t"><span class="nm">${esc(c.name)}</span><span class="tr">${esc(c.trade)}</span></span>
${ARROW}</a>`).join('');
  return page({
    title: 'Gruppenwerk · Bewertungen',
    description: 'QR-Codes für Google-Bewertungen der Gruppenwerk-Betriebe.',
    body: `<div class="brand"><img src="/l/gruppenwerk.svg" alt=""><span>Gruppenwerk</span></div>
<h1>Bewertungen</h1>
<p class="muted small" style="margin:0">Betrieb wählen, QR-Code zeigen.</p>
<div class="rows">${rows}</div>`,
  });
}

export function qrPage(c, origin) {
  const url = `${origin}/r/${c.slug}`;
  return page({
    title: `${c.name} · QR-Code`,
    description: `QR-Code für Google-Bewertungen von ${c.name}.`,
    body: `<a class="back" href="/">&larr; Übersicht</a>
<img class="logo" src="/l/${esc(c.logo)}" alt="${esc(c.name)}">
<div class="qr">${qrSvg(url, { dark: '#111111' })}</div>
<p class="url">${esc(url.replace(/^https?:\/\//, ''))}</p>
<button class="ghost" type="button" id="share">Link teilen</button>
<p class="note">Kunde scannt den Code und bekommt dort einen fertigen Bewertungstext.</p>
<div class="toast" id="toast">Link kopiert</div>`,
    script: `(function(){
  var url=${JSON.stringify(url)},t=document.getElementById('toast');
  function toast(m){t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on')},1900)}
  document.getElementById('share').addEventListener('click',function(){
    var d={title:${JSON.stringify(c.name)},text:'Bewerten Sie uns bei Google',url:url};
    if(navigator.share&&(!navigator.canShare||navigator.canShare(d))){navigator.share(d).catch(function(){});return}
    if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast('Link kopiert')},function(){toast(url)});return}
    toast(url);
  });
})();`,
  });
}

export function reviewPage(c) {
  const target = reviewUrl(c);
  // Rendered fresh per request (the page is sent no-store), so every customer who
  // opens the QR link gets a different suggestion even without JavaScript.
  const first = buildReview(c, Math.random);
  const grammar = { open: c.open, extra: c.extra, quality: c.quality,
    recommend: c.recommend, closer: c.closer, join: c.join };
  return page({
    title: `${c.name} bewerten`,
    description: `Bewerten Sie ${c.name} in wenigen Sekunden bei Google.`,
    noStore: true,
    body: `<img class="logo mid" src="/l/${esc(c.logo)}" alt="${esc(c.name)}">
<p class="stars" role="img" aria-label="Fünf Sterne">★★★★★</p>
<p class="lead">Vielen Dank für Ihren Auftrag! Über eine kurze Bewertung bei Google freuen wir uns sehr.</p>
<div class="quote" id="quote">${esc(first)}</div>
<button class="act" type="button" id="go">Text kopieren &amp; bei Google bewerten</button>
<div class="alt">
  <button type="button" id="again">Anderer Text</button>
  <a href="${esc(target)}" id="plain">Ohne Text bewerten</a>
</div>
<p class="foot">${esc(c.legal)}<br>${esc(c.address)}<br><a href="https://${esc(c.site)}">${esc(c.site)}</a></p>
<div class="toast" id="toast">Text kopiert</div>`,
    script: `(function(){
  var target=${JSON.stringify(target)},G=${JSON.stringify(grammar)};
  var q=document.getElementById('quote'),toast=document.getElementById('toast');
  var build=${buildReview.toString()};
  function fresh(){var t;do{t=build(G,Math.random)}while(t===q.textContent);q.textContent=t}
  document.getElementById('again').addEventListener('click',fresh);
  function copy(t){
    try{var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');
      ta.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,999999);
      document.execCommand('copy');document.body.removeChild(ta)}catch(e){}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(function(){});
  }
  document.getElementById('go').addEventListener('click',function(){
    copy(q.textContent);
    toast.textContent='Text kopiert – bei Google einfügen';toast.classList.add('on');
    setTimeout(function(){location.href=target},650);
  });
})();`,
  });
}

export function promptPage(c) {
  const target = reviewUrl(c);
  const chips = (list, into) => list.map((t) =>
    `<button class="chip" type="button" data-into="${into}">${esc(t)}</button>`).join('');
  return page({
    title: `${c.name} bewerten`,
    description: `Bewerten Sie ${c.name} in wenigen Sekunden bei Google.`,
    body: `<img class="logo mid" src="/l/${esc(c.logo)}" alt="${esc(c.name)}">
<p class="stars" role="img" aria-label="Fünf Sterne">★★★★★</p>
<p class="lead">Vielen Dank für Ihren Auftrag! Zwei kurze Fragen &mdash; daraus wird Ihre Bewertung.</p>

<label class="q" for="a1"><span class="n">1</span>Was haben wir für Sie gemacht?</label>
<textarea id="a1" rows="2" placeholder="${esc(c.hints.did[0])} …" autocapitalize="sentences"></textarea>
<div class="chips">${chips(c.hints.did, 'a1')}</div>

<label class="q" for="a2"><span class="n">2</span>Was hat Ihnen gefallen?</label>
<textarea id="a2" rows="2" placeholder="${esc(c.hints.good[0])} …" autocapitalize="sentences"></textarea>
<div class="chips">${chips(c.hints.good, 'a2')}</div>

<div class="prev"><span class="lbl">Ihre Bewertung</span><p id="prev" class="empty">Beantworten Sie die beiden Fragen &mdash; hier steht dann Ihr Text.</p></div>
<button class="act" type="button" id="go" disabled>Text kopieren &amp; bei Google bewerten</button>
<div class="alt"><a href="${esc(target)}" id="plain">Ohne Text bewerten</a></div>
<p class="foot">${esc(c.legal)}<br>${esc(c.address)}<br><a href="https://${esc(c.site)}">${esc(c.site)}</a></p>
<div class="toast" id="toast">Text kopiert</div>`,
    script: `(function(){
  var target=${JSON.stringify(target)},MIN=20;
  var a1=document.getElementById('a1'),a2=document.getElementById('a2');
  var prev=document.getElementById('prev'),go=document.getElementById('go'),toast=document.getElementById('toast');
  function tidy(s){
    s=s.trim().replace(/\\s+/g,' ');
    if(!s)return '';
    s=s.charAt(0).toUpperCase()+s.slice(1);
    return /[.!?]$/.test(s)?s:s+'.';
  }
  function text(){return [tidy(a1.value),tidy(a2.value)].filter(Boolean).join(' ')}
  function render(){
    var t=text();
    prev.textContent=t||'Beantworten Sie die beiden Fragen – hier steht dann Ihr Text.';
    prev.className=t?'':'empty';
    go.disabled=t.length<MIN;
  }
  [a1,a2].forEach(function(el){el.addEventListener('input',render)});
  // Stichworte fügen nur kurze Fragmente ein - den Satz baut der Kunde selbst.
  [].forEach.call(document.querySelectorAll('.chip'),function(ch){
    ch.addEventListener('click',function(){
      var el=document.getElementById(ch.dataset.into),v=el.value.trim();
      el.value=v?v.replace(/[.,]$/,'')+', '+ch.textContent:ch.textContent;
      ch.classList.add('used');el.focus();render();
    });
  });
  function copy(t){
    try{var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');
      ta.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,999999);
      document.execCommand('copy');document.body.removeChild(ta)}catch(e){}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(function(){});
  }
  go.addEventListener('click',function(){
    if(go.disabled)return;
    copy(text());
    toast.textContent='Text kopiert – bei Google einfügen';toast.classList.add('on');
    setTimeout(function(){location.href=target},650);
  });
  render();
})();`,
  });
}
