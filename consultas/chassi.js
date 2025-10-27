// consultas/chassi.js
import fetch from 'node-fetch';

/**
 * 🔍 Consulta de chassi via API DirectD
 * Endpoint: https://apiv3.directd.com.br/api/ConsultaVeicular?CHASSI={chassi}&TOKEN={token}
 * Exemplo de uso: /chassi/9BWZZZ377VT004251/json
 */

export async function consultarChassi(chassi) {
  if (!chassi) {
    return { status: 'erro', erro: 'Chassi não informado.' };
  }

  const token = process.env.DIRECTD_TOKEN || '4B23EADC-3D9F-4910-B657-0E663020D044';
  const chassiLimpo = String(chassi).replace(/\W/g, '').toUpperCase();

  // ✅ URL correta: parâmetro CHASSI primeiro, TOKEN depois
  const url = `https://apiv3.directd.com.br/api/ConsultaVeicular?CHASSI=${encodeURIComponent(chassiLimpo)}&TOKEN=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, { timeout: 15000 });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      return {
        status: 'erro',
        api: 'Center Apis Consulta Free',
        fonte: 'Center Apis',
        erro: `Erro na API externa: ${res.status} ${res.statusText}`,
        detalhe: text
      };
    }

    const raw = await res.json();

    // 🧾 Mapeamento dos dados retornados pela API
    const dados = {
      chassi: raw.Chassi || chassiLimpo,
      placa: raw.Placa || null,
      marca: raw.Marca || raw.Make || raw.Brand || null,
      modelo: raw.Modelo || raw.Model || null,
      ano_modelo: raw.AnoModelo || raw.YearModel || null,
      ano_fabricacao: raw.AnoFabricacao || raw.YearManufacture || null,
      cor: raw.Cor || raw.Color || null,
      renavam: raw.Renavam || raw.RENAVAM || null,
      situacao: raw.Situacao || raw.Status || null,
      cidade: raw.Municipio || raw.City || null,
      uf: raw.UF || raw.State || null,
      observacoes: raw.Observacoes || raw.Notes || null
    };

    return {
      status: 'sucesso',
      api: 'Center Apis Consulta Free',
      fonte: 'Center Apis',
      dados
    };
  } catch (err) {
    return {
      status: 'erro',
      api: 'Center Apis Consulta Free',
      fonte: 'Center Apis',
      erro: err.message
    };
  }
}