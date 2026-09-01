import { chromium } from 'playwright';
import { createServer } from 'node:http';
import worker from '../dist/worker.js';
const PORT=8790, BASE=`http://localhost:${PORT}`;
const server=createServer(async(rq,rs)=>{const r=await worker.fetch(new Request(BASE+rq.url));
  rs.writeHead(r.status,Object.fromEntries(r.headers));rs.end(Buffer.from(await r.arrayBuffer()))});
await new Promise(ok=>server.listen(PORT,ok)); server.unref();
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for (const scheme of ['light','dark']) {
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,colorScheme:scheme});
  const p=await ctx.newPage();
  for(const [path,name] of [['/','index'],['/hantke','qr'],['/r/hantke','review']]){
    await p.goto(BASE+path,{waitUntil:'networkidle'});
    await p.screenshot({path:`/tmp/shot-${name}-${scheme}.png`,fullPage:true});
  }
  await ctx.close();
}
await b.close(); server.close(); console.log('shots done');
