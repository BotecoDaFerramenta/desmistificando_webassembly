.PHONY: test build-wasm build-native clean help

# Default target
help:
	@echo "Available targets:"
	@echo "  test        - Run tests on native target"
	@echo "  build-wasm  - Build WebAssembly library"
	@echo "  build-native- Build native library"
	@echo "  clean       - Clean build artifacts"

# Run tests on native target
test:
	cargo test --target x86_64-unknown-linux-gnu

# Build WebAssembly library
build-wasm:
	cargo build --target wasm32-unknown-unknown --release
	cp ./target/wasm32-unknown-unknown/release/rust_encryption_lib.wasm ./crypto_web

run: build-wasm
	cargo server --path ./crypto_web

# Build native library
build-native:
	cargo build --target x86_64-unknown-linux-gnu --release

# Clean build artifacts
clean:
	cargo clean