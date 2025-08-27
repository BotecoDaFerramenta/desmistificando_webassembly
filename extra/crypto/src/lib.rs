use aes_gcm::aead::generic_array::GenericArray;
use aes_gcm::{
    aead::{Aead, OsRng, Payload},
    Aes256Gcm, KeyInit,
};
use argon2::{self, password_hash::SaltString, Algorithm, Argon2, Params, PasswordHasher, Version};
use hmac::{Hmac, Mac};
use sha2::Sha256;

#[no_mangle]
pub extern "C" fn derive_key(
    password_ptr: *const u8,
    password_len: usize,
    salt_ptr: *const u8,
    salt_len: usize,
    time_cost: u32,
    memory_cost: u32,
    parallelism: u32,
    out_ptr: *mut u8,
) -> i32 {
    if password_ptr.is_null() || salt_ptr.is_null() || out_ptr.is_null() {
        return 1;
    }
    if password_len == 0 || salt_len < 8 || time_cost < 1 || memory_cost < 1024 || parallelism < 1 {
        return 2;
    }
    let password = unsafe { std::slice::from_raw_parts(password_ptr, password_len) };
    let salt = unsafe { std::slice::from_raw_parts(salt_ptr, salt_len) };
    let mut out = unsafe { std::slice::from_raw_parts_mut(out_ptr, 32) };
    let params = match Params::new(memory_cost, time_cost, parallelism, Some(32)) {
        Ok(p) => p,
        Err(_) => return 3,
    };
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    match argon2.hash_password_into(password, salt, &mut out) {
        Ok(_) => 0,
        Err(_) => 4,
    }
}

#[no_mangle]
pub extern "C" fn aes_gcm_encrypt(
    key_ptr: *const u8,
    nonce_ptr: *const u8,
    plaintext_ptr: *const u8,
    plaintext_len: usize,
    aad_ptr: *const u8,
    aad_len: usize,
    out_ptr: *mut u8,
    out_len: usize,
) -> i32 {
    if key_ptr.is_null() || nonce_ptr.is_null() || plaintext_ptr.is_null() || out_ptr.is_null() {
        return 1;
    }
    if plaintext_len == 0 || out_len < plaintext_len + 16 {
        return 2;
    }
    let key = unsafe { std::slice::from_raw_parts(key_ptr, 32) };
    let nonce = unsafe { std::slice::from_raw_parts(nonce_ptr, 12) };
    let plaintext = unsafe { std::slice::from_raw_parts(plaintext_ptr, plaintext_len) };
    let aad = if aad_len > 0 && !aad_ptr.is_null() {
        unsafe { std::slice::from_raw_parts(aad_ptr, aad_len) }
    } else {
        &[]
    };
    let mut out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
    if key.len() != 32 || nonce.len() != 12 {
        return 3;
    }
    let cipher = match Aes256Gcm::new_from_slice(key) {
        Ok(c) => c,
        Err(_) => return 4,
    };
    match cipher.encrypt(
        GenericArray::from_slice(nonce),
        Payload {
            msg: plaintext,
            aad,
        },
    ) {
        Ok(ciphertext) => {
            if ciphertext.len() != plaintext_len + 16 || out_len < ciphertext.len() {
                return 5;
            }
            out[..ciphertext.len()].copy_from_slice(&ciphertext);
            0
        }
        Err(_) => 6,
    }
}

#[no_mangle]
pub extern "C" fn aes_gcm_decrypt(
    key_ptr: *const u8,
    nonce_ptr: *const u8,
    ciphertext_ptr: *const u8,
    ciphertext_len: usize,
    aad_ptr: *const u8,
    aad_len: usize,
    out_ptr: *mut u8,
    out_len: usize,
) -> i32 {
    if key_ptr.is_null() || nonce_ptr.is_null() || ciphertext_ptr.is_null() || out_ptr.is_null() {
        return 1;
    }
    if ciphertext_len < 16 || out_len < ciphertext_len - 16 {
        return 2;
    }
    let key = unsafe { std::slice::from_raw_parts(key_ptr, 32) };
    let nonce = unsafe { std::slice::from_raw_parts(nonce_ptr, 12) };
    let ciphertext = unsafe { std::slice::from_raw_parts(ciphertext_ptr, ciphertext_len) };
    let aad = if aad_len > 0 && !aad_ptr.is_null() {
        unsafe { std::slice::from_raw_parts(aad_ptr, aad_len) }
    } else {
        &[]
    };
    let mut out = unsafe { std::slice::from_raw_parts_mut(out_ptr, out_len) };
    if key.len() != 32 || nonce.len() != 12 {
        return 3;
    }
    let cipher = match Aes256Gcm::new_from_slice(key) {
        Ok(c) => c,
        Err(_) => return 4,
    };
    match cipher.decrypt(
        GenericArray::from_slice(nonce),
        Payload {
            msg: ciphertext,
            aad,
        },
    ) {
        Ok(plaintext) => {
            if plaintext.len() != ciphertext_len - 16 || out_len < plaintext.len() {
                return 5;
            }
            out[..plaintext.len()].copy_from_slice(&plaintext);
            0
        }
        Err(_) => 6,
    }
}

#[no_mangle]
pub extern "C" fn hmac_sha256(
    key_ptr: *const u8,
    key_len: usize,
    message_ptr: *const u8,
    message_len: usize,
    out_ptr: *mut u8,
) -> i32 {
    if key_ptr.is_null() || message_ptr.is_null() || out_ptr.is_null() {
        return 1;
    }
    if key_len == 0 {
        return 2;
    }
    let key = unsafe { std::slice::from_raw_parts(key_ptr, key_len) };
    let message = unsafe { std::slice::from_raw_parts(message_ptr, message_len) };
    let mut out = unsafe { std::slice::from_raw_parts_mut(out_ptr, 32) };
    let mut mac = match <Hmac<Sha256> as KeyInit>::new_from_slice(key) {
        Ok(m) => m,
        Err(_) => return 3,
    };
    mac.update(message);
    let result = mac.finalize().into_bytes();
    out.copy_from_slice(&result);
    0
}

#[cfg(test)]
mod tests {
    use super::*;
    use getrandom::getrandom;

    #[test]
    fn test_derive_key_valid() {
        let password = b"password";
        let salt = b"12345678salt";
        let mut out = [0u8; 32];
        let code = derive_key(
            password.as_ptr(),
            password.len(),
            salt.as_ptr(),
            salt.len(),
            3,
            65536,
            4,
            out.as_mut_ptr(),
        );
        assert_eq!(code, 0);
    }

    #[test]
    fn test_derive_key_invalid() {
        let password = b"";
        let salt = b"1234567";
        let mut out = [0u8; 32];
        assert_ne!(
            derive_key(
                password.as_ptr(),
                password.len(),
                salt.as_ptr(),
                salt.len(),
                3,
                65536,
                4,
                out.as_mut_ptr()
            ),
            0
        );
    }

    #[test]
    fn test_aes_gcm_encrypt_decrypt() {
        let key = [0x11u8; 32];
        let nonce = [0x22u8; 12];
        let plaintext = b"hello world!";
        let aad = b"testaad";
        let mut ciphertext = [0u8; 12 + 16];
        let code = aes_gcm_encrypt(
            key.as_ptr(),
            nonce.as_ptr(),
            plaintext.as_ptr(),
            plaintext.len(),
            aad.as_ptr(),
            aad.len(),
            ciphertext.as_mut_ptr(),
            ciphertext.len(),
        );
        assert_eq!(code, 0);
        let mut decrypted = [0u8; 12];
        let code2 = aes_gcm_decrypt(
            key.as_ptr(),
            nonce.as_ptr(),
            ciphertext.as_ptr(),
            ciphertext.len(),
            aad.as_ptr(),
            aad.len(),
            decrypted.as_mut_ptr(),
            decrypted.len(),
        );
        assert_eq!(code2, 0);
        assert_eq!(&decrypted[..], plaintext);
    }

    #[test]
    fn test_aes_gcm_encrypt_invalid() {
        let key = [0x11u8; 32];
        let nonce = [0x22u8; 12];
        let plaintext = b"fail";
        let aad = b"";
        let mut ciphertext = [0u8; 4 + 15]; // Too small buffer
        let code = aes_gcm_encrypt(
            key.as_ptr(),
            nonce.as_ptr(),
            plaintext.as_ptr(),
            plaintext.len(),
            aad.as_ptr(),
            aad.len(),
            ciphertext.as_mut_ptr(),
            ciphertext.len(),
        );
        assert_ne!(code, 0);
    }

    #[test]
    fn test_aes_gcm_decrypt_invalid() {
        let key = [0x11u8; 32];
        let nonce = [0x22u8; 12];
        let ciphertext = [0u8; 15];
        let aad = b"";
        let mut decrypted = [0u8; 0];
        let code = aes_gcm_decrypt(
            key.as_ptr(),
            nonce.as_ptr(),
            ciphertext.as_ptr(),
            ciphertext.len(),
            aad.as_ptr(),
            aad.len(),
            decrypted.as_mut_ptr(),
            decrypted.len(),
        );
        assert_ne!(code, 0);
    }

    #[test]
    fn test_hmac_sha256() {
        let key = b"supersecretkey";
        let message = b"message to sign";
        let mut out = [0u8; 32];
        let code = hmac_sha256(
            key.as_ptr(),
            key.len(),
            message.as_ptr(),
            message.len(),
            out.as_mut_ptr(),
        );
        assert_eq!(code, 0);
    }

    #[test]
    fn test_hmac_sha256_invalid() {
        let key = b"";
        let message = b"msg";
        let mut out = [0u8; 32];
        let code = hmac_sha256(
            key.as_ptr(),
            key.len(),
            message.as_ptr(),
            message.len(),
            out.as_mut_ptr(),
        );
        assert_ne!(code, 0);
    }
}
