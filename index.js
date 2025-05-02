const { app, server } = require('./app'); // Importe o server
const PORT = process.env.PORT || 3001; // Use a mesma porta alterada

// Importe o chatbot (a ordem não importa muito aqui)
require('./chatbot');

// Inicie o servidor HTTP e WebSocket
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/admin`);
});