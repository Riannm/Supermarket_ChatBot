const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

(async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
    headless: chromium.headless,
  });
  
  const qrcode = require("qrcode-terminal");
  const { Client, Buttons, List, MessageMedia } = require("whatsapp-web.js"); // Mudança Buttons
  const fs = require("fs");
  const path = require("path");
  const client = new Client;
  const interessadosPath = "./data/interessados.json";
  const cron = require("node-cron");
  
  
  // Carregar promoções
  const PROMOCOES = require("./data/promocoes.json");
  
  // Serviço de leitura do QR code
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });
  
  // Após isso ele diz que foi tudo certo
  client.on("ready", () => {
    console.log("Tudo certo! WhatsApp conectado.");
  });
  
  //Lista de interessados
  function adicionarInteressado(numero) {
    let interessados = [];
    if (fs.existsSync(interessadosPath)) {
      interessados = JSON.parse(fs.readFileSync(interessadosPath));
    }
  
    if (!interessados.includes(numero)) {
      interessados.push(numero);
      fs.writeFileSync(interessadosPath, JSON.stringify(interessados));
    }
  }
  
  //Mensagens Diarias
  cron.schedule("0 8 * * *", async () => {
    //minuto, hora, dia, mes, dia da semana, ano
    const interessados = JSON.parse(fs.readFileSync(interessadosPath));
    // Enviar promoção do dia
    const diasMapeados = {
      "segunda-feira": "segunda",
      "terça-feira": "terca",
      "quarta-feira": "quarta",
      "quinta-feira": "quinta",
      "sexta-feira": "sexta",
      sábado: "sabado",
      domingo: "domingo",
    };
  
    const diaAtual = new Date()
      .toLocaleString("pt-BR", { weekday: "long" })
      .toLowerCase();
    const diaSemana = diasMapeados[diaAtual];
    const promocao = PROMOCOES[diaSemana];
  
    if (promocao) {
      for (const numero of interessados) {
        await client.sendMessage(numero, promocao.mensagem);
        if (promocao.imagem) {
          const media = MessageMedia.fromFilePath(
            path.resolve(__dirname, promocao.imagem)
          );
          await client.sendMessage(numero, media);
        }
      }
    }
  });
  
  // Inicializa tudo
  client.initialize();
  
  const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra
  
  // Funil
  client.on("message", async (msg) => {
    if (
      msg.body.match(
        /(promo(?:cao|ção)?|desconto|oferta|ofertas|preço|valores?|oi+|ol[aá]+|e[ai]+|bom dia|boa (tarde|noite)|tudo bem|como vai|tem algo|quais os produtos|quero ver|quero saber|me mostra|me envie|manda algo|o que tem hoje|atendimento|comprar|pedido)/i
      ) &&
      msg.from.endsWith("@c.us")
    ) {
      const chat = await msg.getChat();
      await delay(3000); // Delay de 3 segundos
      await chat.sendStateTyping(); // Simulando Digitação
      await delay(3000); // Delay de 3000 milisegundos mais conhecido como 3 segundos
      const contact = await msg.getContact(); // Pegando o contato
      const name = contact.pushname; // Pegando o nome do contato
      await client.sendMessage(
        msg.from,
        `Olá, ${
          name.split(" ")[0]
        }! 👋🏼\n\nSou o assistente virtual do *Sacolão Soares* 🥦🍅\n\nComo posso te ajudar hoje? Por favor, escolha uma das opções abaixo digitando o número correspondente:\n\n1️⃣ - Fazer um pedido\n2️⃣ - Receber promoções diárias\n3️⃣ - Falar com um atendente\n4️⃣ - Cancelar promoções\n5️⃣ - Encerrar conversa`
      );
      await delay(3000); // Delay de 3 segundos
      await chat.sendStateTyping(); // Simulando Digitação
      await delay(5000); // Delay de 5 segundos
    }
  
    if (msg.body !== null && msg.body === "1" && msg.from.endsWith("@c.us")) {
      const chat = await msg.getChat();
      await delay(3000); // Delay de 3 segundos
      await chat.sendStateTyping(); // Simulando Digitação
      await delay(3000);
      await client.sendMessage(
        msg.from,
        `Ótimo! 🛒 Por favor, digite o que deseja pedir com os detalhes (quantidade, produto, etc.).\n\nExemplo: "3kg de banana prata, 1kg de tomate, 2 maços de couve." 📝`
      );
    }
  
    if (msg.body !== null && msg.body === "2" && msg.from.endsWith("@c.us")) {
      adicionarInteressado(msg.from);
      const chat = await msg.getChat();
      await delay(3000); // Delay de 3 segundos
      await chat.sendStateTyping(); // Simulando Digitação
      await delay(3000);
  
      // Enviar promoção do dia
      const diasMapeados = {
        "segunda-feira": "segunda",
        "terça-feira": "terca",
        "quarta-feira": "quarta",
        "quinta-feira": "quinta",
        "sexta-feira": "sexta",
        sábado: "sabado",
        domingo: "domingo",
      };
  
      const diaAtual = new Date()
        .toLocaleString("pt-BR", { weekday: "long" })
        .toLowerCase();
      const diaSemana = diasMapeados[diaAtual];
      const promocao = PROMOCOES[diaSemana];
  
      if (promocao) {
        await client.sendMessage(msg.from, promocao.mensagem);
        if (promocao.imagem) {
          const media = MessageMedia.fromFilePath(
            path.resolve(__dirname, promocao.imagem)
          );
          await client.sendMessage(msg.from, media);
        }
      } else if (!promocao) {
        await client.sendMessage(
          msg.from,
          "Desculpe, não temos promoções para hoje. 💤"
        );
        return;
      }
  
      await chat.sendStateTyping(); // Simulando Digitação
      await delay(3000);
      await client.sendMessage(msg.from, 'Você foi adicionado à lista de promoções diárias! Todo dia enviaremos novidades para você. Caso queira sair, digite "4️⃣ - Cancelar promoções".');
  
  
    }
  
    if (msg.body !== null && msg.body === "3" && msg.from.endsWith("@c.us")) {
      const chat = await msg.getChat();
      await delay(3000); // Delay de 3 segundos
      await chat.sendStateTyping(); // Simulando Digitação
      await delay(3000);
      await client.sendMessage(
        msg.from,
        `Tudo certo! 🤝 Iremos encaminhar sua mensagem para um de nossos atendentes. Aguarde só um instante, e logo alguém do nosso time vai te responder! 💬`
      );
    }
  
    if (msg.body !== null && msg.body === "4" && msg.from.endsWith("@c.us")) {
      let interessados = JSON.parse(fs.readFileSync(interessadosPath));
      interessados = interessados.filter(numero => numero !== msg.from);
      fs.writeFileSync(interessadosPath, JSON.stringify(interessados));
      await client.sendMessage(msg.from, 'Você foi removido da lista de promoções diárias. Se quiser voltar, basta digitar 2 novamente!');
    }
  
    if (msg.body !== null && msg.body === "5" && msg.from.endsWith("@c.us")) {
      const chat = await msg.getChat();
      await delay(3000); // Delay de 3 segundos
      await chat.sendStateTyping(); // Simulando Digitação
      await delay(3000);
      await client.sendMessage(
        msg.from,
        `Agradecemos por conversar com a equipe do *Sacolão Soares*! 🍉🥕\n\nEsperamos te ver em breve. Qualquer dúvida, é só chamar. Tenha um ótimo dia! ☀️`
      );
    }
  });
  
  
})();

