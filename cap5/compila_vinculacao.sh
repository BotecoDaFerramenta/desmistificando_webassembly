#!/bin/bash

rustc vinculacao.rs --target wasm32-unknown-unknown --crate-type=cdylib
