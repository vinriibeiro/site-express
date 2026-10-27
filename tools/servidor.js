// Servidor local que imita o GitHub Pages em /site-express/.
// Uso: node tools/servidor.js [porta]
const http = require('http'), fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..'), base = '/site-express/';
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain' };
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/site-express') { res.writeHead(301, { Location: base }); return res.end(); }
  if (!url.startsWith(base)) { res.writeHead(404); return res.end('404'); }
  let arq = path.join(raiz, url.slice(base.length));
  if (!arq.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(arq) && fs.statSync(arq).isDirectory()) arq = path.join(arq, 'index.html');
  fs.readFile(arq, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(arq)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(Number(process.argv[2]) || 8787, () => console.log('http://localhost:' + (Number(process.argv[2]) || 8787) + base));
