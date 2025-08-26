extern "C" {
    #[link_name = "console_log"]
    fn log(x: f32) -> f32;
}

#[unsafe(no_mangle)]
pub extern "C" fn soma_ate_n(n: f32) -> f32 {
    unsafe {
        log(n);
    }
    (n * (n + 1.)) / 2.
}
