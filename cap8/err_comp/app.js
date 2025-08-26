fetch("arquivo-invalido.wasm")
  .then((response) => response.arrayBuffer())
  .then(function (bytes) {
    // Se "valido" for verdadeiro, o conteúdo do arquivo está correto;
    const valido = WebAssembly.validate(bytes);
    // Printa no console se é válido ou não
    console.log(
      `Os _bytes_ são ${valido ? "válidos" : "inválidos"} para compilar em um módulo WASM`
    );
    // Tenta compilar os bytes, porém retorna um CompileError
    WebAssembly.compile(bytes);
  });
