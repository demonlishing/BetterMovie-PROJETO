const http = require('http');
const fs = require('fs');
const path = require('path');

const porta = 3000;
const dataPath = './users.json';

// Verifica se o arquivo JSON existe. Se não, cria um com uma lista vazia.
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

// Função para carregar os usuários do arquivo JSON
function loadUsers() {
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
}

// Função para salvar novos usuários no arquivo JSON
function saveUsers(users) {
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 4));
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // Servindo a página de login
        if (req.url === '/') {
            fs.readFile('./public/login.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                res.end();
            });
        }
        // Servindo a página de registro com verificação de erro
        else if (req.url === '/register') {
            fs.readFile('./public/register.html', (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('Página não encontrada');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                }
            });
        }
        // Servindo arquivos estáticos como CSS e imagens
        else {
            const filePath = path.join(__dirname, 'public', req.url);
            const extname = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.gif': 'image/gif',
            }[extname] || 'text/plain';

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('Arquivo não encontrado');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        }
    } else if (req.method === 'POST') {
        // Rota de login
        if (req.url === '/login') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { username, password } = JSON.parse(body);
                const users = loadUsers();

                const user = users.find(user => user.username === username && user.password === password);

                if (user) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Login bem-sucedido!', success: true, redirect: true }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Usuário não encontrado. Por favor, registre-se primeiro.', success: false }));
                }
            });
        }
        // Rota de registro
        else if (req.url === '/register') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const { username, password } = JSON.parse(body);
                let users = loadUsers();

                const userExists = users.find(user => user.username === username);

                if (userExists) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Usuário já existe!', success: false }));
                } else {
                    users.push({ username, password });
                    saveUsers(users);

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Usuário registrado com sucesso!', success: true, redirect: true }));
                }
            });
        }
    }
});

server.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}/`);
});
