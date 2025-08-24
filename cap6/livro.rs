// Estamos criando uma biblioteca Rust que será compilada para WebAssembly (WASM)
// O comando de compilação é:
// rustc livro.rs --target wasm32-unknown-unknown --crate-type=cdylib
//
// O objetivo é expor funções que permitam ao ambiente externo (por exemplo, JavaScript)
// acessar o conteúdo do livro "Vidas Secas", copiando-o para a memória do WASM.
//
// Importante: no ambiente WASM, não podemos simplesmente usar ponteiros nulos ou slices falsos.
// Precisamos alocar memória de forma explícita e segura para então compartilhar com o host.

use std::alloc::{alloc, Layout};
use std::ptr;

/// Função que retorna uma String com o texto do livro.
/// Neste caso, um trecho de "Vidas Secas" de Graciliano Ramos.
fn meu_livro() -> String {
    String::from("Na planície avermelhada os juazeiros alargavam duas manchas verdes. Os infelizes tinham caminhado o dia inteiro, estavam cansados e famintos. Ordinariamente andavam pouco, mas como haviam repousado bastante na areia do rio seco, a viagem progredira bem três léguas. Fazia horas que procuravam uma sombra. A folhagem dos juazeiros apareceu longe, através dos galhos pelados da catinga rala. Arrastaram-se para lá, devagar, sinha Vitória com o filho mais novo escanchado no quarto e o baú de folha na cabeça, Fabiano sombrio, cambaio, o aió a tiracolo, a cuia pendurada numa correia presa ao cinturão, a espingarda de pederneira no ombro. O menino mais velho e a cachorra Baleia iam atrás.")
}

/// Função exportada (com #[no_mangle]) que aloca memória dentro do WASM
/// e copia o conteúdo do livro para essa memória.
///
/// Retorna um ponteiro (*mut u8) que aponta para o início do buffer.
/// Esse ponteiro será lido pelo host (ex: JavaScript) através da memória do WASM.
///
/// OBS: O host precisa saber o tamanho do buffer para não ler bytes a mais.
/// Por isso criamos também a função `tamanho_livro`.
#[no_mangle]
pub extern "C" fn salvar_livro_na_memoria() -> *mut u8 {
    // Obtemos o conteúdo do livro em String
    let livro = meu_livro();
    // Convertemos a String em slice de bytes
    let bytes = livro.as_bytes();
    // Guardamos o tamanho dos bytes para alocação
    let len = bytes.len();

    // Criamos um layout de memória (informando quantidade de bytes a alocar)
    let layout = Layout::array::<u8>(len).unwrap();
    // Fazemos a alocação dentro da memória linear do WASM
    let ptr = unsafe { alloc(layout) };

    // Verificação de segurança: se a alocação falhar, retornamos ponteiro nulo
    if ptr.is_null() {
        return ptr::null_mut();
    }

    // Copiamos o conteúdo do livro para a região de memória recém-alocada
    unsafe {
        ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, len);
    }

    // Retornamos o ponteiro para que o host consiga acessar os dados
    ptr
}

/// Função exportada que retorna o tamanho (em bytes) do conteúdo do livro.
/// O host deve chamar essa função junto com `salvar_livro_na_memoria`
/// para saber exatamente quantos bytes ler a partir do ponteiro retornado.
#[no_mangle]
pub extern "C" fn tamanho_livro() -> usize {
    meu_livro().len()
}

/// (Opcional para estudos) Função que poderia liberar a memória.
/// No ambiente WASM simples geralmente deixamos a memória "vazar" sem problemas.
/// Porém, em um projeto real, seria recomendado expor uma função como esta
/// para que o host consiga liberar a memória manualmente.
#[no_mangle]
pub extern "C" fn liberar_memoria(ptr: *mut u8, len: usize) {
    unsafe {
        let layout = Layout::array::<u8>(len).unwrap();
        std::alloc::dealloc(ptr, layout);
    }
}
