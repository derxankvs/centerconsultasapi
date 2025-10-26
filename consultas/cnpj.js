// consultas/cnpj.js
import fetch from 'node-fetch';

export async function consultarCNPJ(cnpj) {
  try {
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
    const data = await response.json();

    if (data.status === 'ERROR') {
      return { status: false, erro: data.message || 'Erro na consulta do CNPJ' };
    }

    return { status: true, dados: data };
  } catch (erro) {
    return { status: false, erro: erro.message };
  }
}
