#!/bin/bash

# Perceba que, em vez de criar um arquivo .wasm, foi criado um
# arquivo libnumeros.a (se você estiver no Windows, é provável
# que também seja criado adicionalmente um arquivo com a
# extensão .lib). Esse arquivo contém nossa biblioteca estática com
# seus respectivos símbolos.
# Você pode usar o comando nm no terminal para ver as
# definições dos símbolos criados em libnumeros.a . O comando
# nm , que vem do inglês "name mangling", é um comando Unix
# usado para listar a tabela de símbolos e seus atributos de um
# arquivo executável binário, incluindo bibliotecas, módulos de
# objetos compilados, arquivos de objetos compartilhados e
# executáveis autônomos.

rustc ./numeros.rs --target wasm32-unknown-unknown --crate-type=staticlib
