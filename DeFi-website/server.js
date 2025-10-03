const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((request, response) => {
  let filePath;

  if (request.url.startsWith('/static/')) {
    // Sert les fichiers CSS, JS, etc. depuis le dossier static
    filePath = path.join(__dirname, request.url);
  } else {
    // Sert les pages HTML depuis le dossier template
    filePath = path.join(__dirname, 'template', request.url === '/' ? 'index.html' : request.url);
  }

  const extname = path.extname(filePath);

  let contentType = 'text/html';
  switch (extname) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('404 Not Found');
      } else {
        response.writeHead(500);
        response.end(`Erreur serveur : ${err.code}`);
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
});

server.listen(3000, 'localhost', () => {
  console.log('✅ Serveur HTTP lancé sur http://localhost:3000');
});
