const buffer = new ArrayBuffer(27);
const view = new DataView(buffer);

// cabecalho = 2
view.setUint8(0, 2);
// comprimento = 3
view.setUint16(1, 3);

// Preenche a matriz
view.setFloat32(3, 1.100000023841858);
view.setFloat32(7, 2.200000047683716);
view.setFloat32(11, 3.299999952316284);
view.setFloat32(15, 4.400000095367432);
view.setFloat32(19, 5.5);
view.setFloat32(23, 6.599999904632568);

const meuArrayBuffer = buffer;

const dataView = new DataView(meuArrayBuffer);
console.log({ dataView });
// Primeiro byte do ArrayBuffer
const cabecalho = dataView.getUint8(0);
console.log({ cabecalho });
// 8 bits = 1 byte, então apontamos para o segundo byte
// Unit16 são 2 bytes, então a próxima endereço disponível é "3"
const comprimento = dataView.getUint16(1);
console.log({ comprimento });
// Cria a visualização de dados de números flutuantes de 32 bits
// Com o tamanho baseado no valor do cabeçalho e comprimento
const matrizTipada = new Float32Array(comprimento * cabecalho);
console.log({ matrizTipada });
// Cria a matriz tipada movendo de 4 em 4 bytes
for (let i = 0, endereco = 3; i < matrizTipada.length; i++, endereco += 4) {
  matrizTipada[i] = dataView.getFloat32(endereco);
  console.log(`matrizTipada[${i}] = ${matrizTipada[i]}`);
}

//ordenacao big e little endian
const valorComLittleEndian = dataview.getUint32(0, true);
const valorComBigEndian = dataview.getUint32(4, false);

function ordenacaoLittleEndian() {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
}
console.log(ordenacaoLittleEndian());
