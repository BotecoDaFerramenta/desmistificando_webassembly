use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::thread;
fn main() {
    let mut atomico = AtomicUsize::new(5);
    assert_eq!(*atomico.get_mut(), 5);
    *atomico.get_mut() = 8;
    assert_eq!(atomico.load(Ordering::SeqCst), 8);
    // Compartilha o atômico mutável
    let valor: Arc<AtomicUsize> = Arc::new(atomico);
    // Vai mostrar valores começando de 8 em diferentes threads
    // Os valores mudam a cada execução
    for _ in 0..10 {
        let val = Arc::clone(&valor);
        thread::spawn(move || {
            // Incrementa o valor e retorna o valor anterior.
            let v = val.fetch_add(1, Ordering::SeqCst);
            println!("{v:?}");
        });
    }
}
