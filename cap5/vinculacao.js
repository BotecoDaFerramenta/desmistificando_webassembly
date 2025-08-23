// Define as importações
const importacoes = {
  // O nome padrão é "env"
  env: {
    console_log: (n) => console.log(n),
    alert: (n) => window.alert(n),
  },
};
fetch("./vinculacao.wasm")
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.compile(bytes))
  // Configura as importações na instância
  .then((mod) => WebAssembly.instantiate(mod, importacoes))
  .then(({ exports: { executar } }) => {
    // Executa a função "executar"
    executar();
  });
