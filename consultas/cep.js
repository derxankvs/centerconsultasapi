// consultas/cep.js
import fetch from 'node-fetch';

export async function consultarCEP(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return { status: false, erro: 'CEP inválido ou não encontrado' };
    }

    return { status: true, dados: data };
  } catch (erro) {
    return { status: false, erro: erro.message };
  }
}