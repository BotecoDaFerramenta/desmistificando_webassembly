// Para compilar execute o comando:
// rustc excecao.rs --target wasm32-unknown-unknown --crate-type=cdylib
extern "C" {
    #[link_name = "lanca_excecao"]
    fn lanca_excecao_js();
}
#[no_mangle]
pub extern "C" fn excecao() {
    unsafe {
        lanca_excecao_js();
    }
}
