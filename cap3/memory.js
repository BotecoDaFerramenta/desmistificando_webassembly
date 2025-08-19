const memoria = new WebAssembly.Memory({
  initial: 1,
  maximum: 100,
});
console.log(memoria.buffer); // ArrayBuffer { byteLength: 65536 }

const memoria_compartilhada = new WebAssembly.Memory({
  initial: 1,
  maximum: 100,
  shared: true,
});
console.log(memoria_compartilhada.buffer); // SharedArrayBuffer { byteLength: 65536 }
