// Este código JavaScript demonstra como carregar um módulo WebAssembly (compilado a partir de Rust)
// e interagir com as funções exportadas (`salvar_livro_na_memoria`, `tamanho_livro`, `liberar_memoria`).
//
// O objetivo é ler da memória WASM o trecho do livro "Vidas Secas" que foi gravado pelo Rust.
//
// IMPORTANTE: no modelo de memória WASM, a instância exporta um objeto `memory` (WebAssembly.Memory)
// que representa a memória linear acessível de dentro e fora do módulo.
//
// Assim, quando Rust aloca bytes para o livro, precisamos pegar um ponteiro (endereço inicial) + tamanho,
// e a partir disso conseguimos criar um `Uint8Array` que lê os bytes da memória WASM.

async function main() {
  // Carrega o módulo WASM gerado pelo Rust
  // `fetch("livro.wasm")` baixa o arquivo .wasm
  // `WebAssembly.instantiateStreaming` compila e instancia o módulo de forma eficiente
  const response = await fetch("livro.wasm");
  const { instance } = await WebAssembly.instantiateStreaming(response);

  // Extraímos as funções exportadas do módulo WASM
  const { salvar_livro_na_memoria, tamanho_livro, liberar_memoria, memory } =
    instance.exports;

  // Chamamos a função Rust que retorna um ponteiro para a memória com o livro
  const ptr = salvar_livro_na_memoria();
  // Descobrimos o tamanho do conteúdo (quantos bytes foram gravados)
  const len = tamanho_livro();

  // Criamos uma view (Uint8Array) da memória do WASM, a partir do ponteiro retornado
  // - memory.buffer: é um ArrayBuffer que representa toda a memória linear do módulo
  // - ptr: posição inicial em bytes
  // - len: quantidade de bytes que queremos ler
  const bytes = new Uint8Array(memory.buffer, ptr, len);

  // Convertemos os bytes para string usando TextDecoder
  const text = new TextDecoder("utf-8").decode(bytes);
  const conteudo = document.querySelector("#conteudo");
  conteudo.textContent = text;

  // (Opcional) Liberamos a memória que foi alocada no lado Rust
  // Isso é importante em cenários reais, para evitar vazamentos de memória.
  liberar_memoria(ptr, len);
}

// Executamos a função principal
main().catch(console.error);
