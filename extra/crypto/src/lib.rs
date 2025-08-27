// Importa as dependências necessárias.
use wasm_bindgen::prelude::*;
use aes_gcm::aead::{Aead, KeyInit, Payload, generic_array::GenericArray};
use aes_gcm::Aes256Gcm;
use argon2::{self, Algorithm, Argon2, Params, Version};
use hmac::{Hmac, Mac};
use sha2::Sha256;

// Importa o módulo de utilitários.
mod utils;

/// Inicializa o panic hook para que os erros de pânico do Rust sejam enviados para o console do navegador.
/// Esta função deve ser chamada uma vez ao inicializar o módulo WebAssembly.
#[wasm_bindgen]
pub fn init_panic_hook() {
    utils::set_panic_hook();
}

/// Deriva uma chave de 32 bytes a partir de uma senha e um sal usando o Argon2id.
///
/// # Argumentos
///
/// * `password` - A senha como um slice de bytes.
/// * `salt` - O sal como um slice de bytes. Deve ter no mínimo 8 bytes.
/// * `time_cost` - O número de iterações a serem usadas pelo Argon2.
/// * `memory_cost` - A quantidade de memória (em KiB) a ser usada pelo Argon2.
/// * `parallelism` - O grau de paralelismo a ser usado pelo Argon2.
///
/// # Retorna
///
/// Um `Result` contendo um `Vec<u8>` com a chave de 32 bytes em caso de sucesso, ou um `JsValue` com uma mensagem de erro em caso de falha.
#[wasm_bindgen]
pub fn derive_key(
    password: &[u8],
    salt: &[u8],
    time_cost: u32,
    memory_cost: u32,
    parallelism: u32,
) -> Result<Vec<u8>, JsValue> {
    if password.is_empty() {
        return Err(JsValue::from_str("Password cannot be empty."));
    }
    if salt.len() < 8 {
        return Err(JsValue::from_str("Salt must be at least 8 bytes."));
    }

    let params = Params::new(memory_cost, time_cost, parallelism, Some(32))
        .map_err(|e| JsValue::from_str(&format!("Failed to create Argon2 params: {}", e)))?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);

    let mut out = vec![0u8; 32];
    argon2
        .hash_password_into(password, salt, &mut out)
        .map_err(|e| JsValue::from_str(&format!("Failed to derive key: {}", e)))?;

    Ok(out)
}

/// Criptografa dados usando AES-256-GCM.
///
/// # Argumentos
///
/// * `key` - A chave de 32 bytes.
/// * `nonce` - O nonce de 12 bytes. Nunca deve ser reutilizado com a mesma chave.
/// * `plaintext` - Os dados a serem criptografados.
/// * `aad` - Dados adicionais autenticados (opcional).
///
/// # Retorna
///
/// Um `Result` contendo um `Vec<u8>` com o texto cifrado (incluindo a tag de autenticação) em caso de sucesso, ou um `JsValue` com uma mensagem de erro em caso de falha.
#[wasm_bindgen]
pub fn aes_gcm_encrypt(
    key: &[u8],
    nonce: &[u8],
    plaintext: &[u8],
    aad: Option<Vec<u8>>,
) -> Result<Vec<u8>, JsValue> {
    if key.len() != 32 {
        return Err(JsValue::from_str("Key must be 32 bytes."));
    }
    if nonce.len() != 12 {
        return Err(JsValue::from_str("Nonce must be 12 bytes."));
    }

    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| JsValue::from_str(&format!("Failed to create cipher: {}", e)))?;
    let nonce_arr = GenericArray::from_slice(nonce);

    let payload = Payload {
        msg: plaintext,
        aad: aad.as_deref().unwrap_or(&[]),
    };

    cipher
        .encrypt(nonce_arr, payload)
        .map_err(|e| JsValue::from_str(&format!("Encryption failed: {}", e)))
}

/// Descriptografa dados usando AES-256-GCM.
///
/// # Argumentos
///
/// * `key` - A chave de 32 bytes.
/// * `nonce` - O nonce de 12 bytes.
/// * `ciphertext` - Os dados a serem descriptografados (incluindo a tag de autenticação).
/// * `aad` - Dados adicionais autenticados (opcional).
///
/// # Retorna
///
/// Um `Result` contendo um `Vec<u8>` com o texto plano em caso de sucesso, ou um `JsValue` com uma mensagem de erro em caso de falha (incluindo falha na autenticação).
#[wasm_bindgen]
pub fn aes_gcm_decrypt(
    key: &[u8],
    nonce: &[u8],
    ciphertext: &[u8],
    aad: Option<Vec<u8>>,
) -> Result<Vec<u8>, JsValue> {
    if key.len() != 32 {
        return Err(JsValue::from_str("Key must be 32 bytes."));
    }
    if nonce.len() != 12 {
        return Err(JsValue::from_str("Nonce must be 12 bytes."));
    }

    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| JsValue::from_str(&format!("Failed to create cipher: {}", e)))?;
    let nonce_arr = GenericArray::from_slice(nonce);

    let payload = Payload {
        msg: ciphertext,
        aad: aad.as_deref().unwrap_or(&[]),
    };

    cipher
        .decrypt(nonce_arr, payload)
        .map_err(|e| JsValue::from_str(&format!("Decryption failed: {}", e)))
}

/// Calcula um digest HMAC-SHA256.
///
/// # Argumentos
///
/// * `key` - A chave para o HMAC.
/// * `message` - A mensagem a ser autenticada.
///
/// # Retorna
///
/// Um `Result` contendo um `Vec<u8>` com o digest de 32 bytes em caso de sucesso, ou um `JsValue` com uma mensagem de erro em caso de falha.
#[wasm_bindgen]
pub fn hmac_sha256(key: &[u8], message: &[u8]) -> Result<Vec<u8>, JsValue> {
    if key.is_empty() {
        return Err(JsValue::from_str("Key cannot be empty."));
    }

    let mut mac = <Hmac<Sha256> as KeyInit>::new_from_slice(key)
        .map_err(|e| JsValue::from_str(&format!("Failed to create HMAC: {}", e)))?;
    mac.update(message);

    Ok(mac.finalize().into_bytes().to_vec())
}