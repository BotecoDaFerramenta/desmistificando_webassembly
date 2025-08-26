WebAssembly.instantiateStreaming(fetch("runtime.wasm")).then(({ instance }) => {
  // Retorna 255
  console.log(instance.exports.funcao_com_erro_em_execucao(0));
  // Retornará um "RuntimeError" pois os
  // possíveis valores de u8 vão de 0 até 255
  console.log(instance.exports.funcao_com_erro_em_execucao(1));
});
