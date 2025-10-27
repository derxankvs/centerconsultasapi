// consultas/email.js
import fetch from 'node-fetch';

/**
 * consultarEmail(email)
 * Usa: https://api.apilayer.com/email_verification/{email}
 * Cabeçalho: apikey: <sua_chave>
 *
 * Retorno padronizado:
 * { status: 'success'|'error', api: 'APILayer Email Verification', consulta: email, dados: {...} }
 */

const API_KEY_EMAIL = "6c3fNTQ9fZkbUOpMoJUDBsdNTAG3viok"; // chave embutida conforme solicitado

export async function consultarEmail(email) {
  try {
    if (!email || typeof email !== 'string') {
      return { status: 'error', erro: 'Email inválido ou não informado.' };
    }

    const encoded = encodeURIComponent(email.trim());
    const url = `https://api.apilayer.com/email_verification/${encoded}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': API_KEY_EMAIL,
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    // tenta parsear resposta
    const text = await res.text().catch(()=>null);
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = { raw: text }; }

    if (!res.ok) {
      return {
        status: 'error',
        api: 'Center Apis',
        consulta: email,
        erro: `Erro na API externa: ${res.status} ${res.statusText}`,
        detalhe: data
      };
    }

    // resposta esperada: objeto com vários campos (format_valid, smtp_check, did_you_mean, score, etc.)
    return {
      status: 'success',
      api: 'Center Apis',
      consulta: email,
      dados: data
    };
  } catch (err) {
    return {
      status: 'error',
      api: 'Center Apis',
      consulta: email,
      erro: err.message
    };
  }
}
