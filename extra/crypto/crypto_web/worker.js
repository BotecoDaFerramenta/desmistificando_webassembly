import init, {
  init_panic_hook,
  derive_key,
  aes_gcm_encrypt,
  aes_gcm_decrypt,
  hmac_sha256,
} from "./pkg/rust_encryption_lib.js";

addEventListener("message", async (e) => {
  if (e.data.operacao === "INICIALIZAR") {
    try {
      await init();
      init_panic_hook();
      postMessage({ operacao: "INICIALIZAR", success: true });
    } catch (error) {
      postMessage({
        operacao: "INICIALIZAR",
        success: false,
        error: error.toString(),
      });
    }
  } else if (e.data.operacao === "KEY_DERIVATION") {
    try {
      const key = derive_key(
        e.data.password,
        e.data.salt,
        3,
        65536,
        4
      );
      postMessage({ operacao: "KEY_DERIVATION", success: true, key });
    } catch (error) {
      postMessage({
        operacao: "KEY_DERIVATION",
        success: false,
        error: error.toString(),
      });
    }
  } else if (e.data.operacao === "ENCRYPTION") {
    try {
      const key = new Uint8Array(32).fill(0x42);
      const nonce = new Uint8Array(12).fill(0x33);
      const ciphertext = aes_gcm_encrypt(
        key,
        nonce,
        e.data.plaintext,
        null
      );
      const decrypted = aes_gcm_decrypt(key, nonce, ciphertext, null);
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
      const hmac = hmac_sha256(e.data.key, e.data.message);
      postMessage({ operacao: "HMAC", success: true, hmac });
    } catch (error) {
      postMessage({ operacao: "HMAC", success: false, error: error.toString() });
    }
  } else if (e.data.operacao === "PERFORMANCE") {
    try {
      const start = performance.now();
      const operations = 100;
      const key = new TextEncoder().encode("testkey");
      for (let i = 0; i < operations; i++) {
        hmac_sha256(key, new TextEncoder().encode(`message${i}`));
      }
      const end = performance.now();
      const totalTime = end - start;
      const opsPerSecond = Math.round((operations / totalTime) * 1000);

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
