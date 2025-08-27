let wasmModule;
let memory;

addEventListener("message", async (e) => {
  if (e.data.operacao === "INICIALIZAR") {
    try {
      const result = await WebAssembly.instantiateStreaming(
        fetch("./rust_encryption_lib.wasm")
      );
      wasmModule = result.instance;
      memory = wasmModule.exports.memory;
      
      postMessage({ operacao: "INICIALIZAR", success: true });
    } catch (error) {
      postMessage({ operacao: "INICIALIZAR", success: false, error: error.message });
    }
  }
  
  if (e.data.operacao === "KEY_DERIVATION") {
    try {
      const result = deriveKey(e.data.password, e.data.salt);
      postMessage({ 
        operacao: "KEY_DERIVATION", 
        success: result.success,
        key: result.key,
        error: result.error
      });
    } catch (error) {
      postMessage({ 
        operacao: "KEY_DERIVATION", 
        success: false, 
        error: error.message 
      });
    }
  }
  
  if (e.data.operacao === "ENCRYPTION") {
    try {
      const result = encryptDecrypt(e.data.plaintext);
      postMessage({ 
        operacao: "ENCRYPTION", 
        success: result.success,
        originalText: result.originalText,
        ciphertext: result.ciphertext,
        decryptedText: result.decryptedText,
        error: result.error
      });
    } catch (error) {
      postMessage({ 
        operacao: "ENCRYPTION", 
        success: false, 
        error: error.message 
      });
    }
  }
  
  if (e.data.operacao === "HMAC") {
    try {
      const result = generateHMAC(e.data.key, e.data.message);
      postMessage({ 
        operacao: "HMAC", 
        success: result.success,
        hmac: result.hmac,
        error: result.error
      });
    } catch (error) {
      postMessage({ 
        operacao: "HMAC", 
        success: false, 
        error: error.message 
      });
    }
  }
  
  if (e.data.operacao === "PERFORMANCE") {
    try {
      const result = performanceTest();
      postMessage({ 
        operacao: "PERFORMANCE", 
        success: result.success,
        operations: result.operations,
        totalTime: result.totalTime,
        opsPerSecond: result.opsPerSecond,
        error: result.error
      });
    } catch (error) {
      postMessage({ 
        operacao: "PERFORMANCE", 
        success: false, 
        error: error.message 
      });
    }
  }
}, false);

function deriveKey(password, salt) {
  const passwordBytes = new TextEncoder().encode(password);
  const saltBytes = new TextEncoder().encode(salt + "12345678"); // Ensure min 8 bytes
  
  const passwordPtr = allocateMemory(passwordBytes.length);
  const saltPtr = allocateMemory(saltBytes.length);
  const keyPtr = allocateMemory(32);
  
  writeToMemory(passwordPtr, passwordBytes);
  writeToMemory(saltPtr, saltBytes);
  
  const result = wasmModule.exports.derive_key(
    passwordPtr, passwordBytes.length,
    saltPtr, saltBytes.length,
    3, 65536, 4, keyPtr
  );
  
  if (result === 0) {
    const key = readFromMemory(keyPtr, 32);
    return { success: true, key };
  } else {
    return { success: false, error: `Key derivation failed with code: ${result}` };
  }
}

function encryptDecrypt(plaintext) {
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const key = new Uint8Array(32).fill(0x42);
  const nonce = new Uint8Array(12).fill(0x33);
  
  const keyPtr = allocateMemory(32);
  const noncePtr = allocateMemory(12);
  const plaintextPtr = allocateMemory(plaintextBytes.length);
  const ciphertextPtr = allocateMemory(plaintextBytes.length + 16);
  const decryptedPtr = allocateMemory(plaintextBytes.length);
  
  writeToMemory(keyPtr, key);
  writeToMemory(noncePtr, nonce);
  writeToMemory(plaintextPtr, plaintextBytes);
  
  // Encrypt
  const encryptResult = wasmModule.exports.aes_gcm_encrypt(
    keyPtr, noncePtr, plaintextPtr, plaintextBytes.length,
    0, 0, ciphertextPtr, plaintextBytes.length + 16
  );
  
  if (encryptResult !== 0) {
    return { success: false, error: `Encryption failed with code: ${encryptResult}` };
  }
  
  const ciphertext = readFromMemory(ciphertextPtr, plaintextBytes.length + 16);
  
  // Decrypt
  const decryptResult = wasmModule.exports.aes_gcm_decrypt(
    keyPtr, noncePtr, ciphertextPtr, plaintextBytes.length + 16,
    0, 0, decryptedPtr, plaintextBytes.length
  );
  
  if (decryptResult !== 0) {
    return { success: false, error: `Decryption failed with code: ${decryptResult}` };
  }
  
  const decryptedBytes = readFromMemory(decryptedPtr, plaintextBytes.length);
  const decryptedText = new TextDecoder().decode(decryptedBytes);
  
  return { 
    success: true, 
    originalText: plaintext,
    ciphertext,
    decryptedText 
  };
}

function generateHMAC(key, message) {
  const keyBytes = new TextEncoder().encode(key);
  const messageBytes = new TextEncoder().encode(message);
  
  const keyPtr = allocateMemory(keyBytes.length);
  const messagePtr = allocateMemory(messageBytes.length);
  const hmacPtr = allocateMemory(32);
  
  writeToMemory(keyPtr, keyBytes);
  writeToMemory(messagePtr, messageBytes);
  
  const result = wasmModule.exports.hmac_sha256(
    keyPtr, keyBytes.length,
    messagePtr, messageBytes.length,
    hmacPtr
  );
  
  if (result === 0) {
    const hmac = readFromMemory(hmacPtr, 32);
    return { success: true, hmac };
  } else {
    return { success: false, error: `HMAC generation failed with code: ${result}` };
  }
}

function performanceTest() {
  const start = performance.now();
  const operations = 100;
  
  for (let i = 0; i < operations; i++) {
    generateHMAC("testkey", `message${i}`);
  }
  
  const end = performance.now();
  const totalTime = end - start;
  const opsPerSecond = Math.round((operations / totalTime) * 1000);
  
  return { 
    success: true, 
    operations, 
    totalTime: Math.round(totalTime), 
    opsPerSecond 
  };
}

function allocateMemory(size) {
  return wasmModule.exports.__wbindgen_malloc(size);
}

function writeToMemory(ptr, data) {
  const view = new Uint8Array(memory.buffer, ptr, data.length);
  view.set(data);
}

function readFromMemory(ptr, size) {
  return new Uint8Array(memory.buffer, ptr, size);
}