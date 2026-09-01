// Local preview: runs the built Worker over node:http.
import { createServer } from 'node:http';
import worker from '../dist/worker.js';
const port = Number(process.argv[2] || 8787);
createServer(async (req, res) => {
  const r = await worker.fetch(new Request(`http://localhost:${port}${req.url}`));
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log(`preview on http://localhost:${port}`));
