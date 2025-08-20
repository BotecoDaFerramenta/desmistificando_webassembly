// lib.rs

// É importante frisar que a função from_raw_parts_mut pode
// não funcionar com ponteiros nulos como zero. Ponteiros
// nulos são disponíveis para uso quando a compilação é para
// debug em vez de release , pois o nível de otimização
// debug fornece essa possibilidade. Para mais informações
// sobre ponteiros nulos, você pode ver a discussão sobre o
// assunto no próprio repositório da linguagem Rust:
// https://github.com/rust-lang/rust/issues/53871.
use core::slice::from_raw_parts_mut;
use std::alloc::{alloc, Layout};
use std::mem;

// Nessa função, estamos recebendo dois valores u8 e fazendo
// sua respectiva subtração. A função subtracao é suscetível a erros
// em tempo de execução, pelo fato de não ter nenhum tipo de
// controle a respeito do valor recebido pelo JavaScript, além de
// também ignorar resultados da subtração como sendo menor que o
// menor valor possível de um tipo u8 (acessível pela constante
// u8::MIN ) ou maior que o maior valor possível ( u8::MAX ). Neste
// capítulo, estamos considerando o melhor caso possível sempre e
// não vamos focar na parte de erros e solução de problemas, então
// não se prenda a resolver esse tipo de problema por ora.
//
// A função "subtraction" será nomeada como "subtraction"
// pois explicitamente evitamos o desmembramento usando
// a notação "no_mangle"
//
// Alternativamente, você também pode usar outra notação
// chamada export_name . Essa notação raramente é necessária, mas
// você pode exportar uma função com um nome diferente do nome
// interno do Rust.
// #[export_name = "outra_subtracao"]
//
// A maneira como os parâmetros da função (exemplo: um
// ponteiro para uma memória ou como um valor imediato) são
// passados de callee (chamadores de funções) para callee faz parte da
// definição da Application Binary Interface, ou ABI (veremos mais
// sobre ABI no próximo capítulo). O rustc usa o ABI do Rust por
// padrão, que não é estável. Para estabilizar essa situação, podemos
// definir explicitamente qual ABI queremos que o rustc use para
// uma função. Isso é feito usando a palavra-chave extern .
//

#[unsafe(no_mangle)]
extern "C" fn criar_memoria_inicial() {
    let fatia: &mut [u8];

    unsafe {
        fatia = from_raw_parts_mut::<u8>(5 as *mut u8, 10);
    }

    fatia[0] = 85;
}

#[unsafe(no_mangle)]
pub fn subtracao(numero_a: u8, numero_b: u8) -> u8 {
    numero_a - numero_b
}

#[unsafe(no_mangle)]
extern "C" fn ponteiro_usando_box() -> *const [u8; 4] {
    Box::into_raw(Box::new([8, 5, 8, 5]))
}

#[unsafe(no_mangle)]
extern "C" fn ponteiro() -> *const u8 {
    [8, 5, 8, 5].as_ptr()
}

#[unsafe(no_mangle)]
fn sem_ponteiro() -> [u8; 4] {
    [8, 5, 8, 5]
}

#[unsafe(no_mangle)]
extern "C" fn malloc(comprimento: usize) -> *mut u8 {
    let alinhamento = mem::align_of::<usize>();
    if let Ok(layout) = Layout::from_size_align(comprimento, alinhamento) {
        unsafe {
            if layout.size() > 0 {
                let ponteiro = alloc(layout);
                if !ponteiro.is_null() {
                    return ponteiro;
                }
            } else {
                return alinhamento as *mut u8;
            }
        }
    }
    std::process::abort()
}

#[unsafe(no_mangle)]
extern "C" fn acumular(ponteiro: *mut u8, comprimento: usize) -> i32 {
    let fatia = unsafe { from_raw_parts_mut(ponteiro as *mut u8, comprimento) };
    let mut soma = 0;
    for i in 0..comprimento {
        soma = soma + fatia[i];
    }
    soma as i32
}

#[unsafe(no_mangle)]
extern "C" fn filtro_preto_e_branco(ponteiro: *mut u8, comprimento: usize) {
    let pixels = unsafe { from_raw_parts_mut(ponteiro as *mut u8, comprimento) };
    let mut i = 0;
    loop {
        if i >= comprimento - 1 {
            break;
        }
        let filtro = (pixels[i] / 3) + (pixels[i + 1] / 3) + (pixels[i + 2] / 3);
        pixels[i] = filtro;
        pixels[i + 1] = filtro;
        pixels[i + 2] = filtro;
        i += 4;
    }
}

#[unsafe(no_mangle)]
extern "C" fn filtro_vermelho(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        // 0
        pixels[i + 1] = pixels[i + 1] / 2;
        pixels[i + 2] = pixels[i + 2] / 2;
        // 3
        // 4
        pixels[i + 5] = pixels[i + 5] / 2;
        pixels[i + 6] = pixels[i + 6] / 2;
        // 7
        i += 8;
    }
}

#[unsafe(no_mangle)]
extern "C" fn filtro_verde(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        // 1
        pixels[i + 2] = pixels[i + 2] / 2;
        // 3
        pixels[i + 4] = pixels[i + 4] / 2;
        // 5
        pixels[i + 6] = pixels[i + 6] / 2;
        // 7
        i += 8;
    }
}

#[unsafe(no_mangle)]
extern "C" fn filtro_azul(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        pixels[i + 1] = pixels[i + 1] / 2;
        // 2
        // 3
        pixels[i + 4] = pixels[i + 4] / 2;
        pixels[i + 5] = pixels[i + 5] / 2;
        // 6
        // 7
        i += 8;
    }
}

#[unsafe(no_mangle)]
extern "C" fn filtro_super_azul(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = 0;
        pixels[i + 1] = 0;
        // 2
        // 3
        pixels[i + 4] = 0;
        pixels[i + 5] = 0;
        // 6
        // 7
        i += 8;
    }
}

#[unsafe(no_mangle)]
extern "C" fn filtro_inversao(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    for i in (0..len - 1).step_by(4) {
        pixels[i] = 255 - pixels[i];
        pixels[i + 1] = 255 - pixels[i + 1];
        pixels[i + 2] = 255 - pixels[i + 2];
    }
}

#[unsafe(no_mangle)]
extern "C" fn filtro_sepia(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };

    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        let r = pixels[i] as f32;
        let g = pixels[i + 1] as f32;
        let b = pixels[i + 2] as f32;

        pixels[i] = ((r * 0.393) + (g * 0.769) + (b * 0.189)) as u8;
        pixels[i + 1] = ((r * 0.349) + (g * 0.686) + (b * 0.168)) as u8;
        pixels[i + 2] = ((r * 0.272) + (g * 0.534) + (b * 0.131)) as u8;

        i += 4;
    }
}

#[unsafe(no_mangle)]
extern "C" fn novo_filtro_sepia(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    for i in (0..len - 1).step_by(4) {
        let r = pixels[i] as f32;
        let g = pixels[i + 1] as f32;
        let b = pixels[i + 2] as f32;

        let media = 0.3 * r + 0.59 * g + 0.11 * b;
        let novo_azul = if media + 100.0 < 255.0 {
            media as u8 + 100
        } else {
            255
        };
        let novo_verde = if media + 50.0 < 255.0 {
            media as u8 + 50
        } else {
            255
        };

        pixels[i] = novo_azul;
        pixels[i + 1] = novo_verde;
        pixels[i + 2] = media as u8;
    }
}

#[unsafe(no_mangle)]
extern "C" fn filtro_opacidade(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    let alfa = 10;
    loop {
        if i >= len - 1 {
            break;
        }

        let valor_atual = pixels[i + 3];
        if valor_atual >= alfa {
            pixels[i + 3] = valor_atual - alfa;
        } else {
            pixels[i + 3] = 0;
        };

        i += 4;
    }
}
