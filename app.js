const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Configurações
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rotas
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Painel administrativo rodando em http://localhost:${PORT}/admin`);
});