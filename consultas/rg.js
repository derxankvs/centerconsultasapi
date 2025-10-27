// consultas/rg.js
import fetch from 'node-fetch';

/**
 * consultarRG(rg)
 *
 * Modo seguro: retorna JSON de recusa.
 * Modo autorizado: faz requisição para RapidAPI (consulta-rg) se ALLOW_PRIVATE_INTEGRATION=yes e CONSENT_TEXT preenchido.
 *
 * Provider (RapidAPI) esperado:
 *  https://consulta-rg.p.rapidapi.com/apis/astrahvhdeus/Consultas%20Privadas/HTML/{rg}.php
 *
 * Para usar provider 'rg_gav', defina:
 *   process.env.ALLOW_PRIVATE_INTEGRATION = 'yes'
 *   process.env.CONSENT_TEXT = '...'
 *   process.env.RAPIDAPI_KEY / process.env.RAPIDAPI_HOST
 */

const REFUSE_JSON = {
  api: "Center Apis Consulta Free",
  telegram: "https://t.me/centerconsultaapis7 - consulte tudo aqui grátis",
  erro: "Error 403 não criamos esse tipo de consulte aguarde a próxima atualização do site em 2026/05/25",
  diretor: "derxankvs - github"
};

export async function consultarRG(rg) {
  if (!rg) return { status: false, erro: 'RG vazio.' };

  const allow = String(process.env.ALLOW_PRIVATE_INTEGRATION || '').toLowerCase() === 'yes';
  const consent = (process.env.CONSENT_TEXT || '').trim();

  if (!allow || !consent) return REFUSE_JSON;

  // Provider URL (RapidAPI)
  const enc = encodeURIComponent(rg);
  const url = `https://consulta-rg.p.rapidapi.com/apis/astrahvhdeus/Consultas%20Privadas/HTML/${enc}.php`;

  if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
    return { status: false, erro: 'RAPIDAPI_KEY ou RAPIDAPI_HOST não configurados.' };
  }

  try {
    console.log('CONSENT:', consent);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'Accept': 'text/html'
      },
      timeout: 20000
    });

    const text = await res.text();
    return { status: true, fonte: 'consulta-rg.p.rapidapi.com', raw: text };
  } catch (err) {
    return { status: false, erro: err.message };
  }
}
