static DEZ: i32 = 10;
#[export_name = "retorna_dez"]
pub extern "C" fn retorna10() -> i32 {
    DEZ
}

#[no_mangle]
pub extern "C" fn quadrado(x: i32) -> i32 {
    x * x
}
