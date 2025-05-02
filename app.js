const express = require('express');
const app = express();
const chatbot = require('./chatbot'); // inicia o bot ao subir

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
