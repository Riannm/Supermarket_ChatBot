// Conectar ao WebSocket
const socket = new WebSocket(`ws://localhost:3001`); // Use a porta correta

socket.addEventListener("open", (event) => {
  console.log("WebSocket conectado:", event);
});

socket.addEventListener("error", (error) => {
  console.error("Erro WebSocket:", error);
});

socket.addEventListener("close", (event) => {
  console.warn("WebSocket fechado:", event);
});

socket.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === "qr") {
      const qrImg = document.getElementById("qrcode-img");
      qrImg.src = data.data; // Já vem formatado corretamente
      qrImg.style.display = "block";
    }
  } catch (error) {
    console.error("Erro ao processar mensagem WebSocket:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Gerenciamento de abas
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Carregar QR Code (Remova a lógica de fetch, vamos priorizar o WebSocket)
  const qrImg = document.getElementById("qrcode-img");
  const qrcodeContainer = document.getElementById("qrcode-container");

  // Função para mostrar mensagem de erro (opcional, o WebSocket deve cuidar disso)
  function showQRCodeError(message) {
    console.error("Erro ao carregar QR Code:", message);
    qrImg.style.display = "none";
    const errorElement = document.createElement("p");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    qrImg.parentNode.insertBefore(errorElement, qrImg.nextSibling);
    qrcodeContainer.classList.remove("loading");
  }

  // Carregar e gerenciar promoções
  const promocoesContainer = document.getElementById("promocoes-container");

  async function loadPromocoes() {
    try {
      const response = await fetch("/api/promocoes");
      if (!response.ok) {
        throw new Error("Falha ao carregar promoções");
      }
      const promocoes = await response.json();

      promocoesContainer.innerHTML = "";

      for (const [dia, config] of Object.entries(promocoes)) {
        if (dia === "_meta") continue;

        const card = document.createElement("div");
        card.className = "promocao-card";
        card.innerHTML = `
                    <h3>${dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
                    <label>Mensagem:</label>
                    <textarea id="${dia}-mensagem">${
          config.mensagem || ""
        }</textarea>
                    <label>Imagem:</label>
                    <input type="text" id="${dia}-imagem" value="${
          config.imagem || ""
        }">
                    <button class="btn-upload" data-dia="${dia}"><i class="fas fa-upload"></i> Upload</button>
                `;
        promocoesContainer.appendChild(card);
      }
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
    }
  }

  // Salvar promoções
  document
    .getElementById("salvar-promocoes")
    .addEventListener("click", async () => {
      const promocoes = {};
      const dias = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
      ];

      dias.forEach((dia) => {
        promocoes[dia] = {
          mensagem: document.getElementById(`${dia}-mensagem`).value,
          imagem: document.getElementById(`${dia}-imagem`).value,
        };
      });

      try {
        const response = await fetch("/api/promocoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promocoes),
        });

        if (response.ok) {
          alert("Promoções salvas com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao salvar promoções:", error);
        alert("Erro ao salvar promoções");
      }
    });

  // Carregar configurações
  async function loadConfig() {
    try {
      const response = await fetch("/api/config");
      if (!response.ok) throw new Error("Erro ao carregar configurações");

      const config = await response.json();

      const container = document.getElementById("config-container");
      container.innerHTML = `
                <label>Horário de Envio:</label>
                <input type="time" id="horario-envio" value="${
                  config.horario || "08:00"
                }">

                <label>Grupo Alvo:</label>
                <input type="text" id="grupo-alvo" value="${
                  config.target_group || ""
                }">
            `;
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);

      // Fallback para valores padrão
      const container = document.getElementById("config-container");
      container.innerHTML = `
                <label>Horário de Envio:</label>
                <input type="time" id="horario-envio" value="08:00">

                <label>Grupo Alvo:</label>
                <input type="text" id="grupo-alvo" value="">
            `;
    }
  }

  // Salvar configurações
  document
    .getElementById("salvar-config")
    .addEventListener("click", async () => {
      const config = {
        horario: document.getElementById("horario-envio").value,
        target_group: document.getElementById("grupo-alvo").value,
      };

      try {
        const response = await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });

        if (response.ok) {
          alert("Configurações salvas com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        alert("Erro ao salvar configurações");
      }
    });

  // Inicializar
  loadPromocoes();
  loadConfig();
});
