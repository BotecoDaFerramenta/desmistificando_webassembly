# Nome do arquivo wasm que será gerado
WASM_OUTPUT = livro.wasm

# Arquivo fonte Rust
RUST_SRC = livro.rs

# Arquivo JS principal
JS_MAIN = main.js

# Compila o código Rust para WebAssembly
build:
	rustc $(RUST_SRC) --target wasm32-unknown-unknown --crate-type=cdylib -o $(WASM_OUTPUT) 2> compilacao.log

# Roda o JS com Node (certifique-se de ter o Node.js instalado)
run: build
	pnpx serve .

# Limpa arquivos gerados
clean:
	rm -f $(WASM_OUTPUT)

