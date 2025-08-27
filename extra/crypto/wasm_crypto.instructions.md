# Instructions for LLM Agent: Creating a Rust Encryption Library for WASM with wasm-bindgen

You are an expert Rust developer tasked with creating a secure, WASM-compatible Rust library for cryptographic operations. This library will handle key derivation using Argon2, AES-GCM encryption/decryption, and HMAC-SHA256 signing. It is intended for use in a Web Worker in a browser environment via WebAssembly (WASM), integrated with JavaScript using `wasm-bindgen` for high-level, idiomatic interoperability.

Your goal is to generate the complete Rust code for this library, including setup, dependencies, and implementation. Follow these instructions precisely.

## Step 1: Project Setup

- Create a new Rust library crate named `rust-encryption-lib`.
- Navigate into the crate directory.
- Update `Cargo.toml` with the following dependencies:

  ```toml
  [package]
  name = "rust-encryption-lib"
  version = "0.1.0"
  edition = "2021"

  [lib]
  crate-type = ["cdylib", "rlib"]

  [dependencies]
  wasm-bindgen = "0.2.92"
  argon2 = "0.5.3"
  aes-gcm = "0.10.3"
  hmac = "0.12.1"
  sha2 = "0.10.8"
  getrandom = { version = "0.2.15", features = ["js"] }
  console_error_panic_hook = { version = "0.1.7", optional = true }

  [features]
  default = ["console_error_panic_hook"]
  ```

- The `console_error_panic_hook` crate is useful for debugging, as it forwards Rust panics to the browser's developer console.

## Step 2: General Guidelines for Writing the Library

- Place all code in `src/lib.rs`.
- Use the `#[wasm_bindgen]` attribute to expose Rust functions to JavaScript.
- Use idiomatic Rust types like `&[u8]` for binary data and `Result<T, JsValue>` for error handling. `wasm-bindgen` will automatically handle the conversion between Rust and JavaScript types.
- Avoid `unsafe` code. The use of `wasm-bindgen` and slices (`&[u8]`) eliminates the need for manual pointer manipulation.
- All public functions should return a `Result<Vec<u8>, JsValue>` or `Result<String, JsValue>` to handle potential errors gracefully. Errors will be thrown as JavaScript exceptions.
- Include a utility function to set up the `console_error_panic_hook` for easier debugging.

## Step 3: Strict Recommendations for Writing Rust Library Methods

Implement the following methods in `src/lib.rs`. Each must be public and annotated with `#[wasm_bindgen]`.

1.  **utils**:
    -   Create a `utils.rs` file inside `src` folder with the following content:
    ```rust
    pub fn set_panic_hook() {
        // When the `console_error_panic_hook` feature is enabled, we can call the
        // `set_panic_hook` function at least once during initialization, and then
        // we will get better error messages if our code ever panics.
        //
        // For more details see
        // https://github.com/rustwasm/console_error_panic_hook#readme
        #[cfg(feature = "console_error_panic_hook")]
        console_error_panic_hook::set_once();
    }
    ```

2.  **derive_key**:
    -   Signature: `pub fn derive_key(password: &[u8], salt: &[u8], time_cost: u32, memory_cost: u32, parallelism: u32) -> Result<Vec<u8>, JsValue>`
    -   Purpose: Derives a 32-byte key using Argon2id.
    -   Returns a `Vec<u8>` with the derived key on success, or a `JsValue` with an error message on failure.

3.  **aes_gcm_encrypt**:
    -   Signature: `pub fn aes_gcm_encrypt(key: &[u8], nonce: &[u8], plaintext: &[u8], aad: Option<Vec<u8>>) -> Result<Vec<u8>, JsValue>`
    -   Purpose: Encrypts data with AES-256-GCM.
    -   The `aad` parameter is optional.
    -   Returns a `Vec<u8>` with the ciphertext (including the authentication tag) on success.

4.  **aes_gcm_decrypt**:
    -   Signature: `pub fn aes_gcm_decrypt(key: &[u8], nonce: &[u8], ciphertext: &[u8], aad: Option<Vec<u8>>) -> Result<Vec<u8>, JsValue>`
    -   Purpose: Decrypts data with AES-256-GCM.
    -   Returns a `Vec<u8>` with the plaintext on success.

5.  **hmac_sha256**:
    -   Signature: `pub fn hmac_sha256(key: &[u8], message: &[u8]) -> Result<Vec<u8>, JsValue>`
    -   Purpose: Computes an HMAC-SHA256 digest.
    -   Returns a `Vec<u8>` with the 32-byte digest on success.

## Step 4: Build and Output

-   The modern and recommended way to build `wasm-bindgen` projects is with `wasm-pack`.
-   Install `wasm-pack` if you don't have it: `cargo install wasm-pack`.
-   Build the project with the following command:
    ```bash
    wasm-pack build --target web
    ```
-   This command will compile the Rust code to WebAssembly and generate a JavaScript package in a `pkg` directory. This package contains the `.wasm` file, a JavaScript wrapper, a TypeScript declaration file, and a `package.json`.

## Step 5: JavaScript Usage

-   The generated JavaScript module in the `pkg` directory can be used like any other JavaScript module.
-   In your `worker.js`, you can import and initialize the module like this:

    ```javascript
    import init, { derive_key, aes_gcm_encrypt, aes_gcm_decrypt, hmac_sha256 } from './pkg/rust_encryption_lib.js';

    async function main() {
      await init();

      // Now you can call the exported Rust functions.
      const password = new TextEncoder().encode("password");
      const salt = new TextEncoder().encode("somesalt");
      const key = derive_key(password, salt, 3, 65536, 4);
      console.log("Derived key:", key);
    }

    main();
    ```