// consultas/cpf3.js
import fetch from 'node-fetch';

/**
 * consultarCPF3(cpf)
 *
 * Fonte proposta:
 * http://dabsistemas.saude.gov.br/sistemas/sadab/js/buscar_cpf_dbpessoa.json.php?cpf={cpf}
 *
 * Modo seguro: retorna JSON de recusa.
 * Modo autorizado: se ALLOW_PRIVATE_INTEGRATION=yes e CONSENT_TEXT preenchido faz a requisição direta.
 *
 * Novamente: ative apenas se tiver autorização legal para processar esses dados.
 */

const REFUSE_JSON = {
  api: "Center Apis Consulta Free",
  telegram: "https://t.me/centerconsultaapis7 - consulte tudo aqui grátis",
  erro: "Error 403 não criamos esse tipo de consulte aguarde a próxima atualização do site em 2026/05/25",
  diretor: "derxankvs - github"
};

export async function consultarCPF3(cpf) {
  if (!cpf) return { status: false, erro: 'CPF vazio.' };

  const allow = String(process.env.ALLOW_PRIVATE_INTEGRATION || '').toLowerCase() === 'yes';
  const consent = (process.env.CONSENT_TEXT || '').trim();

  if (!allow || !consent) return REFUSE_JSON;

  const cpfClean = String(cpf).replace(/\D/g, '');
  const url = `http://dabsistemas.saude.gov.br/sistemas/sadab/js/buscar_cpf_dbpessoa.json.php?cpf=${encodeURIComponent(cpfClean)}`;

  try {
    console.log('CONSENT:', consent);
    const res = await fetch(url, { method: 'GET', timeout: 20000 });
    if (!res.ok) {
      const text = await res.text().catch(()=>null);
      return { status: false, erro: `Erro externo: ${res.status}`, detalhe: text };
    }
    const data = await res.json();
    return { status: true, fonte: 'Center Apis', dados: data };
  } catch (err) {
    return { status: false, erro: err.message };
  }
}
