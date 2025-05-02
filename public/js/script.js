document.addEventListener('DOMContentLoaded', () => {
    // Gerenciamento de abas
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  
    // Carregar promoções
    fetch('/admin/promocoes')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('promocoes-container');
        container.innerHTML = '';
        
        for (const [dia, promocao] of Object.entries(data)) {
          if (dia === '_meta') continue;
          
          const div = document.createElement('div');
          div.className = 'promocao-item';
          div.innerHTML = `
            <h3>${dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
            <textarea id="${dia}-mensagem" placeholder="Mensagem">${promocao.mensagem || ''}</textarea>
            <input type="text" id="${dia}-imagem" placeholder="Caminho da imagem" value="${promocao.imagem || ''}">
          `;
          container.appendChild(div);
        }
      });
  
    // Salvar promoções
    document.getElementById('salvar-promocoes').addEventListener('click', () => {
      const promocoes = {};
      const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
      
      dias.forEach(dia => {
        promocoes[dia] = {
          mensagem: document.getElementById(`${dia}-mensagem`).value,
          imagem: document.getElementById(`${dia}-imagem`).value
        };
      });
  
      fetch('/admin/promocoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promocoes)
      })
      .then(() => alert('Promoções salvas com sucesso!'))
      .catch(err => console.error('Erro:', err));
    });
  
    // Carregar mensagens padrão (você pode expandir isso)
    fetch('/admin/mensagens')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('mensagens-container');
        container.innerHTML = '';
        
        data.opcoes.forEach((msg, index) => {
          const div = document.createElement('div');
          div.className = 'mensagem-item';
          div.innerHTML = `
            <h3>Opção ${index + 1}</h3>
            <textarea id="opcao-${index + 1}" placeholder="Mensagem">${msg}</textarea>
          `;
          container.appendChild(div);
        });
      });
  });