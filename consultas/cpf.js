// consultas/cpf.js
import fetch from 'node-fetch';

/**
 * Validação simples de formato de CPF (apenas dígitos, 11 chars).
 * Você pode substituir por validação completa (algoritmo dos dígitos verificadores).
 */
function normalizeCPF(cpf) {
  return String(cpf).replace(/\D/g, '');
}

export async function consultarCPF(cpf) {
  const cpfLimpo = normalizeCPF(cpf);

  if (cpfLimpo.length !== 11) {
    return { status: false, erro: 'CPF inválido (formato).' };
  }

  const API_KEY = "f502c262a57ccf4241412c9c52f1408249d7f470b6eb229c03a17614fbae28bf";
  if (!API_KEY) {
    return { status: false, erro: 'Chave da API não configurada (CPFHUB_KEY).' };
  }

  try {
    const res = await fetch(`https://api.cpfhub.io/cpf/${cpfLimpo}`, {
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      },
      timeout: 15000 // opcional: timeout
    });

    // se status diferente de 200, repassa a mensagem
    if (!res.ok) {
      const text = await res.text().catch(()=>null);
      return { status: false, erro: `Erro na API externa: ${res.status} ${res.statusText}`, detalhe: text };
    }

    const data = await res.json();

    // Ex.: a API pode retornar um campo .success ou .error — adaptar conforme o retorno real
    if (data.error || data.status === 'ERROR' || data.success === false) {
      return { status: false, erro: data.message || 'Consulta retornou erro', raw: data };
    }

    // Retorne somente o necessário ou todo o objeto (cuidado com dados sensíveis)
    return { status: true, dados: data };
  } catch (err) {
    return { status: false, erro: err.message };
  }
}