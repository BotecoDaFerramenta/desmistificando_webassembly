build:
	rustc runtime.rs --target wasm32-unknown-unknown --crate-type=cdylib

run: build
	cargo server --open
