// consultas/motor.js
import fetch from 'node-fetch';

/**
 * consultarMotor(numerodomotor)
 * Consulta endpoint Serpro (Denatran) por número de motor.
 * URL: https://wsdenatran.estaleiro.serpro.gov.br/v1/veiculos/motor/{numerodomotor}
 *
 * Retorno padrão:
 *  { status: true, dados: {...} }
 *  ou
 *  { status: false, erro: 'mensagem' }
 *
 * Configure token em process.env.SERPRO_TOKEN se necessário.
 */

export async function consultarMotor(numerodomotor) {
  try {
    if (!numerodomotor) return { status: false, erro: 'Número do motor não informado.' };

    const motorClean = String(numerodomotor).trim().replace(/\s+/g, '');
    if (motorClean.length < 4) {
      return { status: false, erro: 'Número do motor inválido (muito curto).' };
    }

    const token = process.env.SERPRO_TOKEN || null;
    const url = `https://wsdenatran.estaleiro.serpro.gov.br/v1/veiculos/motor/${encodeURIComponent(motorClean)}`;

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
