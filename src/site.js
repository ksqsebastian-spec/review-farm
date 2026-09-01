import { companies, bySlug, reviewUrl } from './companies.js';
import { qrSvg } from './qr.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

const CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{
  --bg:#f6f6f4; --card:#fff; --fg:#16181d; --muted:#6b7280; --line:#e4e4e1;
  --accent:#16181d; --shadow:0 1px 2px rgba(0,0,0,.05),0 8px 24px -12px rgba(0,0,0,.18);
}
@media (prefers-color-scheme:dark){:root{
  --bg:#0f1115; --card:#181b21; --fg:#f2f3f5; --muted:#9aa1ad; --line:#282c34;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -12px rgba(0,0,0,.7);
}}
html{-webkit-text-size-adjust:100%}
[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--fg);
  font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
.wrap{max-width:560px;margin:0 auto;padding:24px 18px 56px}
a{color:inherit}
h1{font-size:26px;line-height:1.2;margin:0 0 6px;letter-spacing:-.02em}
h2{font-size:20px;line-height:1.25;margin:0 0 4px;letter-spacing:-.01em}
.sub{color:var(--muted);margin:0 0 24px;font-size:15px}
.eyebrow{font-size:12px;font-weight:650;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
.list{display:flex;flex-direction:column;gap:10px;list-style:none;padding:0;margin:0}
.item{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);
  border-radius:14px;padding:14px 16px;text-decoration:none;box-shadow:var(--shadow);
  min-height:68px;transition:transform .08s ease}
.item:active{transform:scale(.985)}
.badge{flex:0 0 42px;height:42px;border-radius:11px;display:grid;place-items:center;
  color:#fff;font-weight:700;font-size:15px;letter-spacing:-.02em}
.item .nm{font-weight:620;letter-spacing:-.01em}
.item .tr{color:var(--muted);font-size:13.5px;margin-top:1px}
.chev{margin-left:auto;color:var(--muted);flex:0 0 auto}
.back{display:inline-block;color:var(--muted);text-decoration:none;font-size:14.5px;margin-bottom:18px}
.qrcard{background:#fff;border-radius:20px;padding:20px;box-shadow:var(--shadow);border:1px solid var(--line)}
.qrcard svg{display:block;width:100%;height:auto}
.urlbar{margin:14px 0 0;font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);
  word-break:break-all;text-align:center}
.btnrow{display:flex;gap:10px;margin-top:16px}
.btn{flex:1;width:100%;appearance:none;border:1px solid var(--line);background:var(--card);color:var(--fg);
  font:inherit;font-weight:600;padding:13px 12px;border-radius:12px;cursor:pointer;text-align:center;
  text-decoration:none;min-height:48px;display:flex;align-items:center;justify-content:center;gap:7px}
.btn:active{transform:scale(.985)}
.btn.primary{background:var(--accent);color:#fff;border-color:transparent}
.hint{color:var(--muted);font-size:14px;margin:18px 0 0;text-align:center}
.stars{font-size:30px;letter-spacing:5px;color:#f5a623;margin:0 0 4px}
.steps{display:flex;flex-direction:column;gap:9px;margin:0 0 18px;padding:0;list-style:none;
  color:var(--muted);font-size:14.5px}
.steps li{display:flex;gap:10px;align-items:flex-start}
.steps .n{flex:0 0 21px;height:21px;border-radius:50%;background:var(--line);color:var(--fg);
  font-size:12px;font-weight:700;display:grid;place-items:center;margin-top:1px}
.texts{display:flex;flex-direction:column;gap:12px}
.tcard{width:100%;text-align:left;font:inherit;background:var(--card);border:1px solid var(--line);
  border-radius:15px;padding:16px 17px;cursor:pointer;box-shadow:var(--shadow);color:var(--fg);
  display:block;position:relative;transition:transform .08s ease,border-color .15s ease}
.tcard:active{transform:scale(.99)}
.tcard.copied{border-color:var(--accent)}
.tcard p{margin:0;font-size:15.5px;line-height:1.55}
.tcard .go{display:flex;align-items:center;gap:7px;margin-top:13px;font-weight:650;font-size:14.5px;color:var(--accent)}
.tcard.copied .go .lbl::after{content:" ✓"}
.foot{margin-top:34px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:13px;text-align:center}
.foot a{color:var(--muted)}
.plain{display:block;text-align:center;margin-top:18px;color:var(--muted);font-size:14.5px}
.toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,14px);background:#16181d;color:#fff;
  padding:12px 20px;border-radius:999px;font-size:14.5px;font-weight:600;opacity:0;pointer-events:none;
  transition:opacity .18s ease,transform .18s ease;z-index:9}
.toast.on{opacity:1;transform:translate(-50%,0)}
@media (prefers-color-scheme:dark){.toast{background:#f2f3f5;color:#16181d}}
`;

function page({ title, description, accent, body, script = '' }) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#f6f6f4" media="(prefers-color-scheme:light)">
<meta name="theme-color" content="#0f1115" media="(prefers-color-scheme:dark)">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#16181d"/><text x="16" y="23" font-size="20" text-anchor="middle" fill="#f5a623">★</text></svg>'
  )}">
<style>${CSS}${accent ? `\n:root{--accent:${accent}}` : ''}</style>
</head><body><div class="wrap">${body}</div>${script ? `<script>${script}</script>` : ''}</body></html>`;
}

const initials = (name) => {
  const words = name.replace(/^(J\.|Die|Ein)\s+/, '').split(/\s+/).filter((w) => /[A-Za-zÄÖÜ]/.test(w[0]));
  // Single-word names like "GroundPassion" still get two letters.
  if (words.length === 1) return (words[0].match(/[A-ZÄÖÜ]/g) || [words[0][0]]).slice(0, 2).join('').toUpperCase();
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
};

const CHEV = '<svg class="chev" width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5 7 7.5l-5.5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function indexPage() {
  const items = companies.map((c) => `<li><a class="item" href="/${c.slug}">
<span class="badge" style="background:${c.accent}">${esc(initials(c.name))}</span>
<span><span class="nm">${esc(c.name)}</span><br><span class="tr">${esc(c.trade)}</span></span>
${CHEV}</a></li>`).join('');
  return page({
    title: 'Gruppenwerk · Bewertungen',
    description: 'QR-Codes für Google-Bewertungen aller Gruppenwerk-Betriebe.',
    body: `<p class="eyebrow">Gruppenwerk</p><h1>Google-Bewertungen</h1>
<p class="sub">Betrieb antippen, QR-Code dem Kunden zeigen. Fertig.</p>
<ul class="list">${items}</ul>
<p class="foot">Der Kunde scannt, bekommt einen fertigen Text vorgeschlagen und landet direkt bei Google.</p>`,
  });
}

export function qrPage(c, origin) {
  const url = `${origin}/r/${c.slug}`;
  return page({
    title: `${c.name} · QR-Code`,
    description: `QR-Code für Google-Bewertungen von ${c.name}.`,
    accent: c.accent,
    body: `<a class="back" href="/">&larr; Alle Betriebe</a>
<h2>${esc(c.name)}</h2><p class="sub">${esc(c.trade)}</p>
<div class="qrcard">${qrSvg(url, { dark: '#111827' })}</div>
<p class="urlbar">${esc(url.replace(/^https?:\/\//, ''))}</p>
<div class="btnrow">
  <button class="btn" type="button" id="share">Link teilen</button>
  <a class="btn primary" href="/r/${c.slug}">Vorschau</a>
</div>
<p class="hint">Kunde scannt den Code &mdash; der Bewertungstext ist dort schon vorbereitet.</p>
<div class="toast" id="toast">Link kopiert</div>`,
    script: `(function(){
  var url=${JSON.stringify(url)},t=document.getElementById('toast');
  function toast(m){t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on')},1900)}
  document.getElementById('share').addEventListener('click',function(){
    var d={title:${JSON.stringify(c.name)},text:'Bewerten Sie uns bei Google',url:url};
    if(navigator.share&&(!navigator.canShare||navigator.canShare(d))){navigator.share(d).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast('Link kopiert')},function(){toast(url)})}
    else{toast(url)}
  });
})();`,
  });
}

export function reviewPage(c) {
  const target = reviewUrl(c);
  const cards = c.reviews.map((t, i) => `<button class="tcard" type="button" data-i="${i}"${i > 2 ? ' hidden' : ''}>
<p>${esc(t)}</p><span class="go"><span class="lbl">Diesen Text nehmen</span> &rarr;</span></button>`).join('');
  return page({
    title: `${c.name} bewerten`,
    description: `Bewerten Sie ${c.name} in wenigen Sekunden bei Google.`,
    accent: c.accent,
    body: `<p class="eyebrow">${esc(c.trade)}</p>
<h1>${esc(c.name)}</h1>
<p class="stars" role="img" aria-label="Fünf Sterne">★★★★★</p>
<p class="sub">Vielen Dank für Ihren Auftrag! Über eine kurze Bewertung freuen wir uns sehr &mdash; das dauert keine 30&nbsp;Sekunden.</p>
<ul class="steps">
  <li><span class="n">1</span><span>Passenden Text antippen &mdash; er wird automatisch kopiert.</span></li>
  <li><span class="n">2</span><span>Google öffnet sich: Sterne vergeben, ins Textfeld tippen und einfügen.</span></li>
</ul>
<div class="texts" id="texts">${cards}</div>
<button class="btn" type="button" id="more" style="margin-top:12px">Andere Vorschläge zeigen</button>
<a class="plain" href="${esc(target)}" id="plain">Lieber eigenen Text schreiben &rarr;</a>
<p class="foot">${esc(c.legal)}<br>${esc(c.address)}<br><a href="https://${esc(c.site)}">${esc(c.site)}</a></p>
<div class="toast" id="toast">Text kopiert</div>`,
    script: `(function(){
  var target=${JSON.stringify(target)},total=${c.reviews.length},shown=3;
  var texts=document.getElementById('texts'),cards=[].slice.call(texts.children);
  var toast=document.getElementById('toast');
  // Randomise which suggestions appear so customers don't all submit the same text.
  for(var i=cards.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));texts.appendChild(cards[j]);cards.splice(j,1)}
  cards=[].slice.call(texts.children);
  var offset=0;
  function render(){cards.forEach(function(el,i){
    var k=(i-offset+total*2)%total; el.hidden=k>=shown;});}
  render();
  document.getElementById('more').addEventListener('click',function(){offset=(offset+shown)%total;render();
    window.scrollTo({top:texts.offsetTop-90,behavior:'smooth'})});
  function copy(t){
    try{var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');
      ta.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,999999);
      document.execCommand('copy');document.body.removeChild(ta)}catch(e){}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(function(){});
  }
  texts.addEventListener('click',function(e){
    var el=e.target.closest('.tcard'); if(!el)return;
    copy(el.querySelector('p').textContent);
    el.classList.add('copied');
    toast.textContent='Text kopiert – jetzt bei Google einfügen';toast.classList.add('on');
    setTimeout(function(){location.href=target},700);
  });
})();`,
  });
}
