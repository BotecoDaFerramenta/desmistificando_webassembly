/**
 * @file Este script é um Web Worker que carrega e executa um módulo WebAssembly (WASM)
 * gerado a partir de código Rust. Ele lida com operações criptográficas em uma thread separada
 * para não bloquear a thread principal da interface do usuário.
 */

// Importa as funções do módulo WASM gerado pelo wasm-bindgen.
// O `init` é uma função especial que carrega e inicializa o módulo WASM.
import init, {
  init_panic_hook,
  derive_key,
  aes_gcm_encrypt,
  aes_gcm_decrypt,
  hmac_sha256,
} from "./pkg/rust_encryption_lib.js";

/**
 * Adiciona um event listener para receber mensagens da thread principal.
 * A estrutura da mensagem esperada é um objeto com uma propriedade `operacao` que define a ação a ser executada.
 */
addEventListener("message", async (e) => {
  // A primeira operação deve ser "INICIALIZAR" para carregar o módulo WASM.
  if (e.data.operacao === "INICIALIZAR") {
    try {
      // Carrega e inicializa o módulo WASM.
      await init();
      // Inicializa o panic hook para que os erros de pânico do Rust sejam logados no console.
      init_panic_hook();
      // Envia uma mensagem de sucesso de volta para a thread principal.
      postMessage({ operacao: "INICIALIZAR", success: true });
    } catch (error) {
      // Em caso de erro na inicialização, envia uma mensagem de erro de volta.
      postMessage({
        operacao: "INICIALIZAR",
        success: false,
        error: error.toString(),
      });
    }
  } else if (e.data.operacao === "KEY_DERIVATION") {
    try {
      // Chama a função `derive_key` do WASM com os parâmetros recebidos.
      const key = derive_key(
        e.data.password, // A senha como Uint8Array
        e.data.salt,     // O sal como Uint8Array
        3,               // time_cost
        65536,           // memory_cost (64 MiB)
        4                // parallelism
      );
      // Envia a chave derivada de volta para a thread principal.
      postMessage({ operacao: "KEY_DERIVATION", success: true, key });
    } catch (error) {
      // Em caso de erro, envia a mensagem de erro de volta.
      postMessage({
        operacao: "KEY_DERIVATION",
        success: false,
        error: error.toString(),
      });
    }
  } else if (e.data.operacao === "ENCRYPTION") {
    try {
      // Chaves e nonces pré-definidos para o exemplo de criptografia.
      const key = new Uint8Array(32).fill(0x42);
      const nonce = new Uint8Array(12).fill(0x33);
      
      // Criptografa o texto plano recebido.
      const ciphertext = aes_gcm_encrypt(
        key,
        nonce,
        e.data.plaintext, // O texto plano como Uint8Array
        null              // Sem dados adicionais autenticados (AAD)
      );
      
      // Descriptografa o texto cifrado para verificar a correção.
      const decrypted = aes_gcm_decrypt(key, nonce, ciphertext, null);
      
      // Envia os resultados de volta para a thread principal.
      postMessage({
        operacao: "ENCRYPTION",
        success: true,
        originalText: e.data.plaintext,
        ciphertext,
        decryptedText: new TextDecoder().decode(decrypted),
      });
    } catch (error) {
      postMessage({
        operacao: "ENCRYPTION",
        success: false,
        error: error.toString(),
      });
    }
  } else if (e.data.operacao === "HMAC") {
    try {
      // Calcula o HMAC-SHA256 da mensagem com a chave recebida.
      const hmac = hmac_sha256(e.data.key, e.data.message);
      // Envia o digest HMAC de volta.
      postMessage({ operacao: "HMAC", success: true, hmac });
    } catch (error) {
      postMessage({ operacao: "HMAC", success: false, error: error.toString() });
    }
  } else if (e.data.operacao === "PERFORMANCE") {
    try {
      const start = performance.now();
      const operations = 100;
      const key = new TextEncoder().encode("testkey");
      
      // Executa a operação de HMAC várias vezes para medir a performance.
      for (let i = 0; i < operations; i++) {
        hmac_sha256(key, new TextEncoder().encode(`message${i}`));
      }
      
      const end = performance.now();
      const totalTime = end - start;
      const opsPerSecond = Math.round((operations / totalTime) * 1000);

      // Envia os resultados do teste de performance de volta.
      postMessage({
        operacao: "PERFORMANCE",
        success: true,
        operations,
        totalTime: Math.round(totalTime),
        opsPerSecond,
      });
    } catch (error) {
      postMessage({
        operacao: "PERFORMANCE",
        success: false,
        error: error.toString(),
      });
    }
  }
});