extern "C" {
    #[link_name = "console_log"]
    fn log(x: i32) -> i32;

    #[link_name = "alert"]
    fn alert(x: i32) -> i32;
}

#[link(name = "numeros", kind = "static")]
extern "C" {
    fn retorna_dez() -> i32;
    fn quadrado(x: i32) -> i32;
}

#[no_mangle]
pub fn executar() {
    let dez = unsafe { retorna_dez() };
    unsafe { log(dez) };
    unsafe { log(20) };
    unsafe { log(87654321) };
    unsafe {
        alert(85);
    }
}
