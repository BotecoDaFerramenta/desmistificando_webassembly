.PHONY: all build clean run test

all: build

# Build the WebAssembly package
build:
	@echo "Building WebAssembly package..."
	wasm-pack build --target web
	@echo "Moving package to exemplo directory..."
	rm -rf exemplo/pkg
	mv pkg exemplo/

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf exemplo/pkg
	cargo clean

# Run a simple web server
run: build
	@echo "Starting web server on port 8000..."
	@echo "Access the application at http://localhost:8000"
	python3 -m http.server --directory exemplo 8000

# Run tests
test:
	@echo "Running tests..."
	cargo test
