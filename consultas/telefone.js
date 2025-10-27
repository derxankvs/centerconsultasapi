// consultas/telefone.js
import fetch from 'node-fetch';

/**
 * consultarTelefone(numero)
 * Usa: https://api.apilayer.com/number_verification/validate?number={numero}
 * Cabeçalho: apikey: <sua_chave>
 *
 * Retorno padronizado:
 * { status: 'success'|'error', api: 'APILayer Number Verification', consulta: numero, dados: {...} }
 */

const API_KEY_NUMBER = "6c3fNTQ9fZkbUOpMoJUDBsdNTAG3viok"; // chave embutida conforme solicitado

export async function consultarTelefone(numero) {
  try {
    if (!numero || typeof numero !== 'string') {
      return { status: 'error', erro: 'Número inválido ou não informado.' };
    }

    // permitir tanto com +como sem +, remover espaços
    const cleaned = numero.trim();

    const url = `https://api.apilayer.com/number_verification/validate?number=${encodeURIComponent(cleaned)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': API_KEY_NUMBER,
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    const text = await res.text().catch(()=>null);
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = { raw: text }; }

    if (!res.ok) {
      return {
        status: 'error',
        api: 'Center Apis',
        consulta: numero,
        erro: `Erro na API externa: ${res.status} ${res.statusText}`,
        detalhe: data
      };
    }

    // retorno típico inclui: valid, local_format, international_format, country_code, country_name, location, carrier, line_type
    return {
      status: 'success',
      api: 'Center Apis',
      consulta: numero,
      dados: data
    };
  } catch (err) {
    return {
      status: 'error',
      api: 'Center Apis',
      consulta: numero,
      erro: err.message
    };
  }
}
