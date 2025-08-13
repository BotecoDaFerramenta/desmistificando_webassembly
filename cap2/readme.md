# capitulo 2

## Notas:

### *2.2 Fundamentos Basicos*

**Modulo:**

Unidade de implantação, carregamento e compilação.
Representa um código binário do WebAssembly que foi compilado,
tornando-se um executável.

Não possuem nenhum estado e, por esse motivo, assim como um Blob 
(objeto provido pelo JavaScript semelhante a um arquivo de dados
brutos imutáveis), pode ser lido como texto ou dados binários.

---

**Memoria:**

A memória é representada como uma matriz contígua e
mutável de bytes não interpretados e pode crescer dinamicamente.

Uma memória criada pelo JavaScript ou pelo código
WebAssembly é acessível e mutável por ambos. Os bytes da
memória podem ser alterados pelo módulo, por meio de instruções
de memória ou no tempo de execução do programa que estiver
executando WASM (depende da configuração do módulo). A API
do WebAssembly no JavaScript representa seu tipo por um
ArrayBuffer.

Os índices de uma matriz de memória linear podem ser
considerados endereços de memória, e as instruções que precisam
acessar um local de memória recebem um deslocamento relativo
ao início da memória.

Um módulo não pode acessar a memória de outro módulo, a memória
do tempo de execução ou a memória do sistema operacional subjacente,
a menos que tenha acesso explicitamente.

---

**Tabela:**

É uma matriz de referências tipadas redimensionáveis que não
podem ser armazenadas como bytes brutos na memória (por
motivos de segurança e portabilidade).

As referências da tabela podem ser funções externas ou
internas com diferentes tipos de assinatura. Assim como a memória,
a tabela pode ser criada pelo JavaScript e pelo WebAssembly, além
de poder ser também acessada e mutável por ambos.

---

**Global:**

É um objeto que representa uma instância de variável global,
acessível pelo JavaScript e por uma ou mais instâncias de um
módulo. Cada global armazena um único valor do tipo global
fornecido. A variável global pode especificar ou não se um global é
imutável ou mutável. Os globais são referenciados por meio de
índices globais, começando sempre com o menor índice disponível
possível.

---

**Instancia:**

É uma instância executável do módulo. O processo de
instanciamento verifica se o módulo é válido e se as importações
fornecidas correspondem aos tipos declarados e, caso contrário,
pode falhar com um erro.

O instanciamento também pode resultar em um erro
personalizado do WASM, conhecido como armadilha, quando
tentar inicializar uma tabela ou memória de um segmento ativo ou
na execução da função de início. Cabe ao incorporador,
responsável pela configuração e instalação do módulo, definir
como essas condições serão reportadas.

Na API do JavaScript para lidar com WASM, o processo de
instanciamento pode receber opcionalmente como argumento um
objeto com estado. O estado do objeto pode incluir uma
propriedade de memória, uma tabela e um conjunto de valores
importados.

Assim que a instância é criada, assumindo que o módulo
instanciado seja executável sem erros, o objeto que representa a
instância será similar a um módulo JavaScript (ES2015) que foi
carregado em um determinado escopo. O valor da instância possui
todas as funções exportadas do WebAssembly.

---

### *2.4 Tipos de Valores de Dados*

[Você pode ver a lista completa dos valores do WebAssembly na sua especificação em inglês](https://webassembly.github.io/spec/core/syntax/values.html)

Os possíveis tipos de valores do WebAssembly são validados
no processo de validação, instanciamento e, possivelmente, na
execução. Os programas WebAssembly operam em valores
numéricos primitivos e são classificados em: Bytes, vetores, nomes,
números inteiros, números de ponto flutuante.

O WebAssembly suporta basicamente apenas quatro tipos de
dados numéricos:
    Números inteiros de 32 bits ( i32 );
    Números inteiros de 64 bits ( i64 );
    Números de ponto flutuante (floats) de 32 bits ( f32 );
    Números de ponto flutuante (floats) de 64 bits ( f64 ).

Apesar de possuir diversos tipos de valores de dados, apenas
números inteiros e números flutuantes podem ser computados em
uma variável, e isso basicamente limita o uso de outros tipos. Por
esse motivo, é comum ouvir que o WebAssembly apenas suporta
quatro tipos de valores ( i32 , i64 , f32 e f64 ).
Em virtude de termos apenas quatro tipos de valores que
podem ser computados sem limitações na máquina virtual do
WASM, alguns conceitos da Ciência da Computação (por
exemplo, codificação de dados) se tornam necessários para
qualquer aplicação.
Isso significa que diferentes tipos dados precisam ter o
tratamento customizado. Por exemplo, uma simples função escrita
em Rust que retorna um tipo String quando compilada para
WebAssembly teria que possuir o tratamento da codificação de
valores corretamente se desejar ler ou manipular no lado do
WebAssembly.

```rust
fn minha_linda_funcao() -> String {
    String::from("O valor desta String precisa ser codificado...")
}
```

---

### *2.5 Compilacao para Codigo Binario*

Existem alguns destinos de compilação que você pode
especificar para o compilador Rust (conhecido como rustc )
compilar para WASM.

- wasm32-unknown-unknows: Destino de compilação
nível 2: esse destino está focado na produção de arquivos
binários *.wasm . No entanto, a biblioteca padrão do Rust
é ignorada. Em razão de a definição do destino conter a
especificação "unknown" (desconhecido, em inglês), isso
reforça que o libstd (biblioteca padrão) não pode assumir
nada. Embora os binários provavelmente funcionem por
tempo indeterminado, funcionalidades comuns como
println! ou panic! não vão funcionar. Esse destino de
compilação foi introduzido oficialmente no Rust em
dezembro de 2017.

*Setup Rust*

```bash
rustup target add wasm32-unknown-unknown
rustup target add wasm32-wasi
cargo install wasm-pack
```

*Build web*

```bash
wasm-pack build --target web
```

---

