// consultas/renavam.js
import fetch from 'node-fetch';

/**
 * consultarRenavam(renavam)
 * Consulta endpoint Serpro (Denatran) por RENAVAM.
 * URL: https://wsdenatran.estaleiro.serpro.gov.br/v1/veiculos/renavam/{renavam}
 *
 * Retorno padrão:
 *  { status: true, dados: {...} }
 *  ou
 *  { status: false, erro: 'mensagem' }
 *
 * Configure token em process.env.SERPRO_TOKEN se necessário.
 */

export async function consultarRenavam(renavam) {
  try {
    if (!renavam) return { status: false, erro: 'RENAVAM não informado.' };

    const renavamClean = String(renavam).replace(/\D/g, '');
    if (renavamClean.length < 6) {
      return { status: false, erro: 'RENAVAM inválido (parece muito curto).' };
    }

    const token = process.env.SERPRO_TOKEN || null;
    const url = `https://wsdenatran.estaleiro.serpro.gov.br/v1/veiculos/renavam/${encodeURIComponent(renavamClean)}`;

    const headers = {
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { method: 'GET', headers, timeout: 15000 });

    if (!res.ok) {
      const text = await res.text().catch(()=>null);
      return {
        status: false,
        erro: `Erro na API Serpro: ${res.status} ${res.statusText}`,
        detalhe: text
      };
    }

    const data = await res.json();

    // Se API retornar objeto de erro, normalize
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return { status: false, erro: 'Resposta vazia da API Serpro.' };
    }

    return {
      status: true,
      dados: data
    };
  } catch (err) {
    return { status: false, erro: err.message };
  }
}
