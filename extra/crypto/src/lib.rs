use aes_gcm::aead::{generic_array::GenericArray, Aead, KeyInit, Payload};
use aes_gcm::Aes256Gcm;
use argon2::{self, Algorithm, Argon2, Params, Version};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use wasm_bindgen::prelude::*;

mod utils;

#[wasm_bindgen]
pub fn init_panic_hook() {
    utils::set_panic_hook();
}

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
