// consultas/placa.js
import sinesp from 'sinesp-api';

export async function consultarPlaca(placa) {
  try {
    const resultado = await sinesp.search(placa);
    return { status: true, dados: resultado };
  } catch (erro) {
    return { status: false, erro: erro.message };
  }
}
