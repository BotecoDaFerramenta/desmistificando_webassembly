#[unsafe(no_mangle)]
pub fn funcao_com_erro_em_execucao(numero: u8) -> u8 {
    numero + 255
}
