#!/bin/bash

# No rustc , o parâmetro -L permite adicionar um diretório
# no caminho de pesquisa da biblioteca realizado pelo compilador.
# Você também pode especificar no mesmo parâmetro dentro do
# diretório se você quer apenas uma dependência, crate, recurso
# nativo, framework, ou "todos os tipos possíveis" (que é o padrão).
# O comando a seguir realiza a compilação para WebAssembly
# com o uso da biblioteca estática numeros usando o caminho ./ ,
# que reflete na raiz do diretório onde está o arquivo da nossa
# biblioteca estática:

rustc vinculacao.rs --target wasm32-unknown-unknown --crate-type=cdylib -L ./
