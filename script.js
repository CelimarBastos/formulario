// Preenchimento automático de data, mês, ano e município
function preencherDataAutomatica() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = hoje.toLocaleDateString('pt-BR', { month: 'long' });
  const ano = String(hoje.getFullYear());
  const municipio = localStorage.getItem('municipio') || 'Fortaleza'; // Padrão: Fortaleza

  document.getElementById('linha-dia').value = dia;
  document.getElementById('linha-mes').value = mes;
  document.getElementById('linha-ano').value = ano;
  document.getElementById('linha-cidade').value = municipio;
}

// Carregar nome do técnico do localStorage
function carregarTecnico() {
  const tecnico = localStorage.getItem('tecnico-nome');
  if (tecnico) {
    document.getElementById('linha-tecnico').value = tecnico;
  }
}

// Salvar nome do técnico ao sair do campo
function salvarTecnico() {
  const tecnico = document.getElementById('linha-tecnico').value;
  if (tecnico) {
    localStorage.setItem('tecnico-nome', tecnico);
  }
}

// Atualizar CPF: 123.xxx.xxx-89
function atualizarCPF(input, digitos) {
  digitos = (digitos || '').replace(/\D/g, '').substring(0, 11);
  input.dataset.cpf = digitos;
  
  let display = '';
  if (digitos.length <= 3) {
    display = digitos;
  } else {
    display = digitos.substring(0, 3) + '.xxx.xxx-';
    if (digitos.length > 9) {
      display += digitos.substring(9);
    }
  }
  
  input.value = display;
}

function mascararCPF(input) {
  const digitos = input.dataset.cpf || input.value.replace(/\D/g, '').substring(0, 11);
  atualizarCPF(input, digitos);
}

function tratarCPFKeyDown(event) {
  const input = event.target;
  const cpfAtual = input.dataset.cpf || '';
  const key = event.key;
  
  if (key === 'Backspace' || key === 'Delete') {
    if (cpfAtual.length > 0) {
      atualizarCPF(input, cpfAtual.slice(0, -1));
    }
    event.preventDefault();
    return;
  }
  
  if (/^[0-9]$/.test(key)) {
    if (cpfAtual.length < 11) {
      atualizarCPF(input, cpfAtual + key);
    }
    event.preventDefault();
    return;
  }
  
  const navegacao = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
  if (navegacao.includes(key)) {
    return;
  }
  
  event.preventDefault();
}

function tratarCFPPaste(event) {
  const input = event.target;
  const texto = event.clipboardData.getData('text/plain');
  const digitos = texto.replace(/\D/g, '').substring(0, 11);
  atualizarCPF(input, digitos);
  event.preventDefault();
}

// Mascarar MAC: aa:aa:aa:aa:aa:aa
function mascararMAC(input) {
  let valor = input.value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  let mascarado = '';
  
  for (let i = 0; i < valor.length && i < 12; i++) {
    if (i > 0 && i % 2 === 0) {
      mascarado += ':';
    }
    mascarado += valor[i];
  }
  
  input.value = mascarado;
}

// Inicializar ao carregar a página
function inicializar() {
  preencherDataAutomatica();
  carregarTecnico();
  
  // Adicionar event listeners para campos específicos
  const inputCPF = document.getElementById('linha3');
  if (inputCPF) {
    inputCPF.addEventListener('keydown', tratarCPFKeyDown);
    inputCPF.addEventListener('paste', tratarCFPPaste);
    inputCPF.addEventListener('input', function() { mascararCPF(this); });
  }
  
  // Campos de MAC
  const macsFields = [
    document.getElementById('linha-onu-mac'),
    document.getElementById('linha-rec-mac')
  ];
  
  macsFields.forEach(field => {
    if (field) {
      field.addEventListener('input', function() { mascararMAC(this); });
    }
  });
  
  // Salvar técnico ao sair do campo
  const tecnicoField = document.getElementById('linha-tecnico');
  if (tecnicoField) {
    tecnicoField.addEventListener('blur', salvarTecnico);
  }
}

function gerarPDF() {
  const container = document.getElementById('formulario-pdf');
  const opt = {
    margin: 0,
    filename: 'ordem-de-servico.pdf',
    image: { type: 'JPG', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container).save();
}

function limparFormulario() {
  const formulario = document.getElementById('formulario-pdf');
  const inputs = formulario.querySelectorAll('input[type="text"], input[type="email"], textarea');
  const checkboxes = formulario.querySelectorAll('input[type="checkbox"], input[type="radio"]');
  
  inputs.forEach(input => {
    // Não limpar data, mês, ano, cidade e técnico
    if (!['linha-dia', 'linha-mes', 'linha-ano', 'linha-cidade', 'linha-tecnico'].includes(input.id)) {
      input.value = '';
    }
  });
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Restaurar data automática
  preencherDataAutomatica();
  carregarTecnico();
}

function mostrarWhatsAppBox() {
  const box = document.getElementById('whatsapp-box');
  if (box) {
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
    if (box.style.display === 'flex') {
      document.getElementById('whatsapp-phone').focus();
    }
  }
}

function enviarWhatsApp() {
  const telefone = document.getElementById('whatsapp-phone').value;
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 11) {
    alert('Digite um telefone válido no formato (12)345678910.');
    return;
  }

  const telefoneCompleto = digitos.length === 11 ? `55${digitos}` : `55${digitos}`;
  const nome = document.getElementById('linha1').value || 'N/A';
  const cpf = document.getElementById('linha3').dataset.cpf || document.getElementById('linha3').value;
  const protocolo = document.getElementById('linha-protocolo').value || 'N/A';
  const tecnico = document.getElementById('linha-tecnico').value || 'N/A';

  const mensagem = encodeURIComponent(
    `Ordem de Serviço - Brisanet\nNome: ${nome}\nCPF: ${cpf}\nProtocolo: ${protocolo}\nTécnico: ${tecnico}`
  );

  const url = `https://api.whatsapp.com/send?phone=${telefoneCompleto}&text=${mensagem}`;
  window.open(url, '_blank');
}

function ajustarEscala() {
  const container = document.getElementById('formulario-pdf');
  const scale = Math.min(1, window.innerWidth / 794);
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = 'top left';
  document.body.style.overflowX = scale < 1 ? 'auto' : 'hidden';
}

window.addEventListener('resize', ajustarEscala);
window.addEventListener('load', function() {
  ajustarEscala();
  inicializar();
});
