# Projeto de Criptografia com Rust e WebAssembly

Este projeto demonstra como criar uma biblioteca de criptografia em Rust, compilá-la para WebAssembly (WASM) e usá-la em uma aplicação web. A comunicação entre o JavaScript e o WebAssembly é gerenciada pelo `wasm-bindgen`, que permite uma interoperação idiomática e de alto nível.

## Funcionalidades

A biblioteca de criptografia implementa as seguintes operações:

-   **Derivação de Chave:** Usa o Argon2id para derivar uma chave segura a partir de uma senha e um sal.
-   **Criptografia AES-GCM:** Criptografa e descriptografa dados usando o algoritmo AES-256-GCM, que é um padrão moderno para criptografia autenticada.
-   **HMAC-SHA256:** Calcula um código de autenticação de mensagem (MAC) usando HMAC com a função de hash SHA-256.

## Tecnologias Utilizadas

-   **Rust:** A biblioteca de criptografia é escrita em Rust, uma linguagem de programação de sistemas que é segura e performática.
-   **WebAssembly (WASM):** O código Rust é compilado para WebAssembly, um formato de código binário portável que pode ser executado em navegadores web.
-   **`wasm-bindgen`:** Uma ferramenta para facilitar a interoperação de alto nível entre o WebAssembly e o JavaScript.
-   **Crates de Criptografia:** São utilizadas crates auditadas e puramente em Rust do [RustCrypto](https://github.com/RustCrypto):
    -   `argon2`
    -   `aes-gcm`
    -   `hmac`
    -   `sha2`
-   **Web Workers:** A aplicação web utiliza Web Workers para executar as operações criptográficas em uma thread separada, evitando o bloqueio da interface do usuário.

## Estrutura do Projeto

```
.
├── crypto_web/         # Contém a aplicação web (HTML, JS, CSS)
│   ├── app.js          # Lógica principal da aplicação e comunicação com o worker
│   ├── index.html      # A página web
│   ├── worker.js       # O worker que carrega e executa o módulo WASM
│   └── pkg/            # O pacote WASM gerado pelo wasm-pack
├── src/
│   ├── lib.rs          # O código fonte da biblioteca de criptografia em Rust
│   └── utils.rs        # Funções utilitárias (ex: panic hook)
├── Cargo.toml          # O manifesto do projeto Rust com as dependências
├── Makefile            # Comandos para construir e executar o projeto
└── README.md           # Este arquivo
```

## Começando

Siga as instruções abaixo para construir e executar o projeto localmente.

### Pré-requisitos

-   **Rust:** Instale o Rust a partir do site oficial: [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
-   **`wasm-pack`:** Instale o `wasm-pack`, a ferramenta para construir projetos WebAssembly com Rust:
    ```bash
    cargo install wasm-pack
    ```

### Construindo o Projeto

Para construir o projeto, execute o seguinte comando:

```bash
make build
```

Este comando irá compilar o código Rust para WebAssembly, gerar o pacote JavaScript correspondente usando `wasm-pack`, e mover o pacote para o diretório `crypto_web/`.

### Executando a Aplicação

Para executar a aplicação web, use o seguinte comando:

```bash
make run
```

Este comando irá iniciar um servidor web simples na porta 8000. Você pode acessar a aplicação em [http://localhost:8000](http://localhost:8000).

## Utilização

A aplicação web fornece uma interface simples para testar as funcionalidades da biblioteca de criptografia:

1.  **Derivação de Chave:** Insira uma senha e um sal para derivar uma chave de 32 bytes.
2.  **Criptografia:** Insira um texto para ser criptografado e descriptografado com uma chave e nonce pré-definidos.
3.  **HMAC:** Insira uma chave e uma mensagem para gerar um código de autenticação HMAC-SHA256.
4.  **Teste de Performance:** Execute um teste de performance simples para medir o número de operações HMAC por segundo.

Os resultados de cada operação são exibidos na página.
