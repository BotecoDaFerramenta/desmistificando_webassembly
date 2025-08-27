.PHONY: all build clean run test

all: build

# Build the WebAssembly package
build:
	@echo "Building WebAssembly package..."
	wasm-pack build --target web
	@echo "Moving package to crypto_web directory..."
	rm -rf crypto_web/pkg
	mv pkg crypto_web/

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf crypto_web/pkg
	cargo clean

# Run a simple web server
run: build
	@echo "Starting web server on port 8000..."
	@echo "Access the application at http://localhost:8000"
	python3 -m http.server --directory crypto_web 8000

# Run tests
test:
	@echo "Running tests..."
	cargo test
