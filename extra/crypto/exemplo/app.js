/**
 * @file Este script é a lógica principal da aplicação web. Ele inicializa os Web Workers,
 * envia tarefas para eles e manipula os resultados recebidos.
 */

// Lista para armazenar as instâncias de workers que foram inicializadas com sucesso.
const workersLista = [];
// Obtém o número de núcleos de processamento do hardware do usuário para criar um worker por núcleo.
const processadores = window.navigator.hardwareConcurrency;

console.log(`Número de processadores detectado: ${processadores}`);

// Inicializa um pool de Web Workers.
for (let i = 0; i < processadores; i++) {
  // Cria um novo worker. A opção `{ type: "module" }` é essencial para permitir o uso de `import` no script do worker.
  let worker = new Worker("./worker.js", { type: "module" });
  
  // Adiciona um event listener para receber mensagens do worker.
  worker.addEventListener("message", (e) => {
    // Manipula a mensagem de inicialização do worker.
    if (e.data.operacao === "INICIALIZAR") {
      if (e.data.success) {
        workersLista.push(worker);
        console.log(`Worker ${i} inicializado com sucesso.`);
      } else {
        console.error(`Falha ao inicializar o Worker ${i}:`, e.data.error);
      }
    }
    
    // Encaminha os resultados para as funções de manipulação apropriadas com base na operação.
    if (e.data.operacao === "KEY_DERIVATION") {
      handleKeyDerivationResult(e.data);
    }
    if (e.data.operacao === "ENCRYPTION") {
      handleEncryptionResult(e.data);
    }
    if (e.data.operacao === "HMAC") {
      handleHMACResult(e.data);
    }
    if (e.data.operacao === "PERFORMANCE") {
      handlePerformanceResult(e.data);
    }
  }, false);

  // Envia a primeira mensagem para o worker para que ele possa carregar e inicializar o módulo WebAssembly.
  worker.postMessage({ operacao: "INICIALIZAR" });
}

/**
 * Retorna um worker disponível do pool de workers de forma aleatória.
 * @returns {Worker} Uma instância de um Web Worker.
 */
function getAvailableWorker() {
  return workersLista[Math.floor(Math.random() * workersLista.length)];
}

/**
 * Inicia o teste de derivação de chave.
 * Pega os valores da interface, codifica-os para Uint8Array e os envia para um worker.
 */
function testKeyDerivation() {
  const password = document.getElementById('password').value;
  const salt = document.getElementById('salt').value;
  
  if (workersLista.length === 0) {
    showResult('key-result', 'Workers não inicializados.', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({
    operacao: "KEY_DERIVATION",
    password: new TextEncoder().encode(password),
    salt: new TextEncoder().encode(salt)
  });
}

/**
 * Inicia o teste de criptografia.
 * Pega o texto plano da interface, codifica-o para Uint8Array e o envia para um worker.
 */
function testEncryption() {
  const plaintext = document.getElementById('plaintext').value;
  
  if (workersLista.length === 0) {
    showResult('encryption-result', 'Workers não inicializados.', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({
    operacao: "ENCRYPTION",
    plaintext: new TextEncoder().encode(plaintext)
  });
}

/**
 * Inicia o teste de HMAC.
 * Pega a chave e a mensagem da interface, codifica-as para Uint8Array e as envia para um worker.
 */
function testHMAC() {
  const key = document.getElementById('hmac-key').value;
  const message = document.getElementById('hmac-message').value;
  
  if (workersLista.length === 0) {
    showResult('hmac-result', 'Workers não inicializados.', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({
    operacao: "HMAC",
    key: new TextEncoder().encode(key),
    message: new TextEncoder().encode(message)
  });
}

/**
 * Inicia o teste de performance.
 * Envia uma mensagem para um worker para iniciar o teste.
 */
function testPerformance() {
  if (workersLista.length === 0) {
    showResult('performance-result', 'Workers não inicializados.', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({ operacao: "PERFORMANCE" });
}

/**
 * Manipula e exibe o resultado da derivação de chave.
 * @param {object} data - O objeto de dados recebido do worker.
 */
function handleKeyDerivationResult(data) {
  if (data.success) {
    const hexKey = Array.from(data.key).map(b => b.toString(16).padStart(2, '0')).join('');
    showResult('key-result', `Chave derivada: <div class="hex-output">${hexKey}</div>`, true);
  } else {
    showResult('key-result', `Erro: ${data.error}`, false);
  }
}

/**
 * Manipula e exibe o resultado da criptografia.
 * @param {object} data - O objeto de dados recebido do worker.
 */
function handleEncryptionResult(data) {
  if (data.success) {
    const hexCiphertext = Array.from(data.ciphertext).map(b => b.toString(16).padStart(2, '0')).join('');
    showResult('encryption-result', 
      `Texto original: ${new TextDecoder().decode(data.originalText)}<br>
       Texto criptografado: <div class="hex-output">${hexCiphertext}</div>
       Texto descriptografado: ${data.decryptedText}<br>
       Sucesso: ${new TextDecoder().decode(data.originalText) === data.decryptedText}`,
       true
    );
  } else {
    showResult('encryption-result', `Erro: ${data.error}`, false);
  }
}

/**
 * Manipula e exibe o resultado do HMAC.
 * @param {object} data - O objeto de dados recebido do worker.
 */
function handleHMACResult(data) {
  if (data.success) {
    const hexHmac = Array.from(data.hmac).map(b => b.toString(16).padStart(2, '0')).join('');
    showResult('hmac-result', `HMAC: <div class="hex-output">${hexHmac}</div>`, true);
  } else {
    showResult('hmac-result', `Erro: ${data.error}`, false);
  }
}

/**
 * Manipula e exibe o resultado do teste de performance.
 * @param {object} data - O objeto de dados recebido do worker.
 */
function handlePerformanceResult(data) {
  if (data.success) {
    showResult('performance-result', 
      `Operações realizadas: ${data.operations}<br>
       Tempo total: ${data.totalTime}ms<br>
       Operações por segundo: ${data.opsPerSecond}`, true);
  } else {
    showResult('performance-result', `Erro: ${data.error}`, false);
  }
}

/**
 * Exibe uma mensagem de resultado na interface do usuário.
 * @param {string} elementId - O ID do elemento HTML onde o resultado será exibido.
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} success - Indica se a operação foi bem-sucedida para aplicar a classe CSS correta.
 */
function showResult(elementId, message, success) {
  const element = document.getElementById(elementId);
  element.innerHTML = message;
  element.className = `test-result ${success ? 'success' : 'error'}`;
}
