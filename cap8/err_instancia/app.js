const configuracao = {
  env: {
    //console_log: (n) => {
    // a linha abaixo causa erro de link
    //  app.js:13 Uncaught (in promise) LinkError:
    //    WebAssembly.instantiate(): Import #0 "env"
    //    "console_log": function import requires a callable
    log: (n) => {
      console.log("-> enviado: ", n);
    },
  },
};
fetch("soma_ate_n.wasm")
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.compile(bytes))
  .then((mod) => WebAssembly.instantiate(mod, configuracao))
  .then((mod) => {
    const { soma_ate_n } = mod.exports;
    console.log("<- recebido: ", soma_ate_n(1)); // 1
    console.log("<- recebido: ", soma_ate_n(2)); // 3
    console.log("<- recebido: ", soma_ate_n(3)); // 6
  });
