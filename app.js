const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Configurações iniciais
const configPath = './data/config.json';
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ horario: '08:00', target_group: '' }, null, 2));
}

// Inicializar WebSocket Server e gerenciar o último QR Code
const websocketManager = {
    wss: new WebSocket.Server({ server }),
    lastQR: null,
    updateQR: function(qr) {
        this.lastQR = qr;
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'qr', data: qr }));
            }
        });
    }
};

websocketManager.wss.on('connection', (ws) => {
    console.log('Novo cliente WebSocket conectado');

    ws.on('error', (error) => {
        console.error('Erro WebSocket:', error);
    });

    // Envie o QR code imediatamente se já existir
    if (websocketManager.lastQR) {
        ws.send(JSON.stringify({ type: 'qr', data: websocketManager.lastQR }));
    }
});

// Middleware
app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Rotas da API
app.get('/api/qrcode', (req, res) => {
    if (!websocketManager.lastQR) {
        return res.status(404).json({ error: 'QR Code não disponível' });
    }
    res.json({ qrcode: `data:image/png;base64,${websocketManager.lastQR}` });
});

app.get('/api/promocoes', (req, res) => {
    try {
        const promocoes = JSON.parse(fs.readFileSync('./data/promocoes.json'));
        res.json(promocoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar promoções' });
    }
});

app.post('/api/promocoes', (req, res) => {
    try {
        fs.writeFileSync('./data/promocoes.json', JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar promoções' });
    }
});

app.get('/api/config', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar configurações' });
    }
});

app.post('/api/config', (req, res) => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

module.exports = { websocketManager, app, server }; // Exporte o server também