// Array Buffer de 256 bytes
const bufferMemoria = new ArrayBuffer(256);
console.log("--- ArrayBuffer ---");
console.log(
  "Tamanho do buffer em bytes (bufferMemoria.byteLength):",
  bufferMemoria.byteLength
);

// Exemplo de visualização inteira
console.log("\n--- Views (Uint8Array) sobre o mesmo buffer ---");
const visualizacaoInteira = new Uint8Array(bufferMemoria);
console.log(
  "\nVisualização do buffer inteiro (new Uint8Array(bufferMemoria)):"
);
console.log(
  "Tamanho da view em bytes (visualizacaoInteira.byteLength):",
  visualizacaoInteira.byteLength
);
console.log(
  "Quantidade de elementos (visualizacaoInteira.length):",
  visualizacaoInteira.length
);
console.log(
  "Offset em bytes (visualizacaoInteira.byteOffset):",
  visualizacaoInteira.byteOffset
);

// Outros exemplos de visualizações que especificam o
// deslocamento inicial e o número de elementos
const visPrimeiraMetade = new Uint8Array(bufferMemoria, 0, 128);
console.log(
  "\nVisualização da primeira metade (new Uint8Array(bufferMemoria, 0, 128)):"
);
console.log(
  "Tamanho da view em bytes (visPrimeiraMetade.byteLength):",
  visPrimeiraMetade.byteLength
);
console.log(
  "Quantidade de elementos (visPrimeiraMetade.length):",
  visPrimeiraMetade.length
);
console.log(
  "Offset em bytes (visPrimeiraMetade.byteOffset):",
  visPrimeiraMetade.byteOffset
);

const visTerceiroQuarto = new Uint8Array(bufferMemoria, 128, 64);
console.log(
  "\nVisualização do terceiro quarto (new Uint8Array(bufferMemoria, 128, 64)):"
);
console.log(
  "Tamanho da view em bytes (visTerceiroQuarto.byteLength):",
  visTerceiroQuarto.byteLength
);
console.log(
  "Quantidade de elementos (visTerceiroQuarto.length):",
  visTerceiroQuarto.length
);
console.log(
  "Offset em bytes (visTerceiroQuarto.byteOffset):",
  visTerceiroQuarto.byteOffset
);

const visResto = new Uint8Array(bufferMemoria, 192);
console.log("\nVisualização do restante (new Uint8Array(bufferMemoria, 192)):");
console.log(
  "Tamanho da view em bytes (visResto.byteLength):",
  visResto.byteLength
);
console.log("Quantidade de elementos (visResto.length):", visResto.length);
console.log("Offset em bytes (visResto.byteOffset):", visResto.byteOffset);

console.log("\n\n--- Matrizes Tipadas (TypedArrays) ---");
console.log(
  "Cada uma com 64 elementos, mas com bytes por elemento diferentes."
);

// Matrizes tipadas de números flutuantes
const f64 = new Float64Array(64);
console.log("\nFloat64Array(64): (64 * 8 bytes = 512 bytes)");
console.log("Tamanho em bytes (f64.byteLength):", f64.byteLength);
console.log("Quantidade de elementos (f64.length):", f64.length);

const f32 = new Float32Array(64);
console.log("\nFloat32Array(64): (64 * 4 bytes = 256 bytes)");
console.log("Tamanho em bytes (f32.byteLength):", f32.byteLength);
console.log("Quantidade de elementos (f32.length):", f32.length);

// Matrizes tipadas de números inteiros
const u32 = new Uint32Array(64);
console.log("\nUint32Array(64): (64 * 4 bytes = 256 bytes)");
console.log("Tamanho em bytes (u32.byteLength):", u32.byteLength);
console.log("Quantidade de elementos (u32.length):", u32.length);

const u16 = new Uint16Array(64);
console.log("\nUint16Array(64): (64 * 2 bytes = 128 bytes)");
console.log("Tamanho em bytes (u16.byteLength):", u16.byteLength);
console.log("Quantidade de elementos (u16.length):", u16.length);

const u8 = new Uint8Array(64);
console.log("\nUint8Array(64): (64 * 1 byte = 64 bytes)");
console.log("Tamanho em bytes (u8.byteLength):", u8.byteLength);
console.log("Quantidade de elementos (u8.length):", u8.length);

const pixels = new Uint8ClampedArray(64);
console.log("\nUint8ClampedArray(64): (64 * 1 byte = 64 bytes)");
console.log("Tamanho em bytes (pixels.byteLength):", pixels.byteLength);
console.log("Quantidade de elementos (pixels.length):", pixels.length);

// Matrizes tipadas de números inteiros assinalados
const i32 = new Int32Array(64);
console.log("\nInt32Array(64): (64 * 4 bytes = 256 bytes)");
console.log("Tamanho em bytes (i32.byteLength):", i32.byteLength);
console.log("Quantidade de elementos (i32.length):", i32.length);

const i16 = new Int16Array(64);
console.log("\nInt16Array(64): (64 * 2 bytes = 128 bytes)");
console.log("Tamanho em bytes (i16.byteLength):", i16.byteLength);
console.log("Quantidade de elementos (i16.length):", i16.length);

const i8 = new Int8Array(64);
console.log("\nInt8Array(64): (64 * 1 byte = 64 bytes)");
console.log("Tamanho em bytes (i8.byteLength):", i8.byteLength);
console.log("Quantidade de elementos (i8.length):", i8.length);
