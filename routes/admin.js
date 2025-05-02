const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Carregar dados
function loadPromocoes() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/promocoes.json')));
}

function savePromocoes(data) {
  fs.writeFileSync(path.join(__dirname, '../data/promocoes.json'), JSON.stringify(data, null, 2));
}

// Página principal do admin
router.get('/', (req, res) => {
  const promocoes = loadPromocoes();
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// API para obter promoções
router.get('/promocoes', (req, res) => {
  res.json(loadPromocoes());
});

// API para atualizar promoções
router.post('/promocoes', (req, res) => {
  savePromocoes(req.body);
  res.json({ success: true });
});

// API para mensagens padrão (você pode expandir isso)
router.get('/mensagens', (req, res) => {
  res.json({
    opcoes: [
      "1️⃣ - Fazer um pedido",
      "2️⃣ - Receber promoções diárias",
      "3️⃣ - Falar com um atendente",
      "4️⃣ - Cancelar promoções",
      "5️⃣ - Encerrar conversa"
    ]
  });
});

module.exports = router;