const http = require('http');
const fs = require('fs');

const port = 3000;

http.createServer((req, res) => {
  fs.readFile('MainPage.html', (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Error: File not found');
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    }
  });
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});