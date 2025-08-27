const workersLista = [];
const processadores = window.navigator.hardwareConcurrency;

console.log(`processadores: ${processadores}`);

// Initialize workers
for (let i = 0; i < processadores; i++) {
  let worker = new Worker("./worker.js", { type: "module" });
  
  worker.addEventListener("message", (e) => {
    if (e.data.operacao === "INICIALIZAR") {
      if (e.data.success) {
        workersLista.push(worker);
        console.log(`Worker ${i} inicializado`);
      } else {
        console.error(`Worker ${i} failed to initialize:`, e.data.error);
      }
    }
    
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

  worker.postMessage({ operacao: "INICIALIZAR" });
}

function getAvailableWorker() {
  return workersLista[Math.floor(Math.random() * workersLista.length)];
}

function testKeyDerivation() {
  const password = document.getElementById('password').value;
  const salt = document.getElementById('salt').value;
  
  console.log(`Testando derivação de chave com password: ${password}, salt: ${salt}`);
  
  if (workersLista.length === 0) {
    showResult('key-result', 'Workers não inicializados', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({
    operacao: "KEY_DERIVATION",
    password: new TextEncoder().encode(password),
    salt: new TextEncoder().encode(salt)
  });
}

function testEncryption() {
  const plaintext = document.getElementById('plaintext').value;
  
  console.log(`Testando criptografia com texto: ${plaintext}`);
  
  if (workersLista.length === 0) {
    showResult('encryption-result', 'Workers não inicializados', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({
    operacao: "ENCRYPTION",
    plaintext: new TextEncoder().encode(plaintext)
  });
}

function testHMAC() {
  const key = document.getElementById('hmac-key').value;
  const message = document.getElementById('hmac-message').value;
  
  console.log(`Testando HMAC com chave: ${key}, mensagem: ${message}`);
  
  if (workersLista.length === 0) {
    showResult('hmac-result', 'Workers não inicializados', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({
    operacao: "HMAC",
    key: new TextEncoder().encode(key),
    message: new TextEncoder().encode(message)
  });
}

function testPerformance() {
  console.log('Iniciando teste de performance');
  
  if (workersLista.length === 0) {
    showResult('performance-result', 'Workers não inicializados', false);
    return;
  }
  
  const worker = getAvailableWorker();
  worker.postMessage({
    operacao: "PERFORMANCE"
  });
}

function handleKeyDerivationResult(data) {
  console.log('Resultado da derivação de chave:', data);
  
  if (data.success) {
    const hexKey = Array.from(data.key).map(b => b.toString(16).padStart(2, '0')).join('');
    showResult('key-result', `Chave derivada: <div class="hex-output">${hexKey}</div>`, true);
  } else {
    showResult('key-result', `Erro: ${data.error}`, false);
  }
}

function handleEncryptionResult(data) {
  console.log('Resultado da criptografia:', data);
  
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

function handleHMACResult(data) {
  console.log('Resultado do HMAC:', data);
  
  if (data.success) {
    const hexHmac = Array.from(data.hmac).map(b => b.toString(16).padStart(2, '0')).join('');
    showResult('hmac-result', `HMAC: <div class="hex-output">${hexHmac}</div>`, true);
  } else {
    showResult('hmac-result', `Erro: ${data.error}`, false);
  }
}

function handlePerformanceResult(data) {
  console.log('Resultado do teste de performance:', data);
  
  if (data.success) {
    showResult('performance-result', 
      `Operações realizadas: ${data.operations}<br>
       Tempo total: ${data.totalTime}ms<br>
       Operações por segundo: ${data.opsPerSecond}`, true);
  } else {
    showResult('performance-result', `Erro: ${data.error}`, false);
  }
}

function showResult(elementId, message, success) {
  const element = document.getElementById(elementId);
  element.innerHTML = message;
  element.className = `test-result ${success ? 'success' : 'error'}`;
}