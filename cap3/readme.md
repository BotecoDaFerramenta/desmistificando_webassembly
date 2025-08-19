# Capitulo 3

## Notas:

### _3.1 Typed Arrays_

![mozilla typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)

---

### _3.2 DataView_

Permite controlar a ordenação de bytes (endianness) usando
verdadeiro ou falso nos métodos do DataView . A ordenação
de bytes é baseada em ordem de grandeza e a ordem mais
comum de bytes é conhecida como little endian, que armazena
bytes na ordem do menor primeiro. A outra ordenação existente,
conhecida como big endian, é justamente o oposto: armazena os
bytes na ordenação maior primeiro.

A fim de exemplificar as duas ordenações, se desejássemos
salvar o valor numérico 305419896 de 4 bytes na memória, a
forma como a plataforma lida com a organização de bytes faria a
diferença na ordem de bytes salvos. A conversão do valor
305419896 para um hexadecimal obtém 0x12345678 .
Note que, para cada 2 caracteres do formato hexadecimal,
temos o equivalente a 1 byte; logo, se o valor numérico
305419896 representado de forma hexadecimal ( 0x12345678 )
fosse salvo na memória usando little endian, teríamos a seguinte
ordem:
Em hexadecimal: 78 56 34 12 ;
Em bytes: 0x78 0x56 0x34 0x12 .
Com a ordenação big endian, obteríamos a seguinte ordem:
Em hexadecimal: 12 34 56 78 ;
Em bytes: 0x12 0x34 0x56 0x78 .

---

### _3.3 WebAssembly no Javascript_

O JavaScript provê uma API para lidar com WebAssembly no
navegador para realizar operações de carregamento, compilação e
instanciamento. Futuramente, o WebAssembly poderá ser
carregado igual a módulos ES6, simplesmente adicionando o tipo
module na tag script do HTML (exemplo:<script type="module"/>),
entretanto ainda não é uma realidade.

As funções disponíveis podem ser acessadas pelo uso do
window.WebAssembly.

---

### _3.4 Criando e Gerenciando Memoria_

A memória no WebAssembly é criada a partir da classe
Memory e seu retorno é um objeto que contém um método e uma
propriedade, que pode ser um
ArrayBuffer
ou
SharedArrayBuffer (é basicamente um ArrayBuffer , mas que
pode criar visualizações com memória compartilhada) que contém
os bytes brutos da memória acessada por uma instância
WebAssembly.
Toda vez que você executa o construtor da classe Memory ,
cria-se um objeto de memória que possui apenas o método grow
("crescer", em inglês) e a propriedade buffer , que contém um
ArrayBuffer ou SharedArrayBuffer .
