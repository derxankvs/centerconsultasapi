// consultas/nome.js
import fetch from 'node-fetch';

/**
 * consultarNome(nome)
 *
 * Modo seguro (padrão): retorna JSON fixo de recusa para consultas privadas.
 * Modo autorizado: se process.env.ALLOW_PRIVATE_INTEGRATION === 'yes' e
 * process.env.CONSENT_TEXT estiver definido, faz a requisição ao provedor escolhido.
 *
 * Provedores suportados (defina NOME_PROVIDER):
 *  - kiny  -> http://ifind.chapada.com.br:7777/?token=...&nome={nome}
 *  - gav   -> https://consulta-nome1.p.rapidapi.com/.../{nome}.php
 *  - nome_123 -> http://ghostcenter.xyz/api/nome/{nome}
 *
 * USO RECOMENDADO: mantenha inativo (modo seguro). Ative apenas se tiver autorização legal.
 */

const REFUSE_JSON = {
  api: "Center Apis Consulta Free",
  telegram: "https://t.me/centerconsultaapis7 - consulte tudo aqui grátis",
  erro: "Error 403 não criamos esse tipo de consulte aguarde a próxima atualização do site em 2026/05/25",
  diretor: "derxankvs - github"
};

function providerUrlForNome(provider, nome) {
  const enc = encodeURIComponent(nome);
  if (provider === 'kiny') return `http://ifind.chapada.com.br:7777/?token=20491c06-5675-4e06-b2ae-4e3fcda2abdd&nome=${enc}`;
  if (provider === 'gav') return `https://consulta-nome1.p.rapidapi.com/apis/astrahvhdeus/Consultas%20Privadas/HTML/${enc}.php`;
  if (provider === 'nome_123') return `http://ghostcenter.xyz/api/nome/${enc}`;
  return null;
}

export async function consultarNome(nome) {
  if (!nome) return { status: false, erro: 'Nome vazio.' };

  const allow = String(process.env.ALLOW_PRIVATE_INTEGRATION || '').toLowerCase() === 'yes';
  const consent = (process.env.CONSENT_TEXT || '').trim();
  const provider = process.env.NOME_PROVIDER || ''; // 'kiny'|'gav'|'nome_123'

  if (!allow || !consent || !provider) {
    // modo padrão: recusa segura
    return REFUSE_JSON;
  }

  const url = providerUrlForNome(provider, nome);
  if (!url) return { status: false, erro: 'Provider NOME_PROVIDER inválido.' };

  try {
    const headers = {};
    // se usar RapidAPI (gav), talvez precise destes headers — o usuário deve configurar RAPIDAPI_HOST/KEY
    if (provider === 'gav') {
      if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
        return { status: false, erro: 'RAPIDAPI_KEY ou RAPIDAPI_HOST não configurados para provider gav.' };
      }
      headers['x-rapidapi-key'] = process.env.RAPIDAPI_KEY;
      headers['x-rapidapi-host'] = process.env.RAPIDAPI_HOST;
    }

    // log de consentimento (local) — não envie esse log para terceiros sem necessidade
    console.log('CONSENT:', consent);

    const res = await fetch(url, { method: 'GET', headers, timeout: 20000 });
    const text = await res.text();
    // retornamos o texto cru (padrão) — o ideal é transformar em JSON se a resposta for JSON/HTML parseado
    return { status: true, fonte: provider, raw: text };
  } catch (err) {
    return { status: false, erro: err.message };
  }
}
