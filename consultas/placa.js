// consultas/placa.js
import fetch from 'node-fetch';

/**
 * Consulta de placa via API DirectD
 * Endpoint: https://apiv3.directd.com.br/api/ConsultaVeicular
 * Exemplo: /placa/ABC1234/json
 */

export async function consultarPlaca(placa) {
  if (!placa) {
    return { status: 'erro', erro: 'Placa não informada.' };
  }

  const token = process.env.DIRECTD_TOKEN || '4B23EADC-3D9F-4910-B657-0E663020D044';
  const placaLimpa = String(placa).replace(/\W/g, '').toUpperCase();

  const url = `https://apiv3.directd.com.br/api/ConsultaVeicular?PLACA=${encodeURIComponent(placaLimpa)}&TOKEN=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) {
      const text = await res.text().catch(() => null);
      return {
        status: 'erro',
        api: 'Center Apis Consulta Free',
        fonte: 'Center Apis Banco de Dados',
        erro: `Erro na API externa: ${res.status} ${res.statusText}`,
        detalhe: text
      };
    }

    const raw = await res.json();

    // Mapeamento dos campos retornados
    const dados = {
      placa: raw.Placa || placaLimpa,
      marca: raw.Marca || raw.Make || raw.Brand || null,
      modelo: raw.Modelo || raw.Model || null,
      ano_modelo: raw.AnoModelo || raw.YearModel || null,
      ano_fabricacao: raw.AnoFabricacao || raw.YearManufacture || null,
      cor: raw.Cor || raw.Color || null,
      chassi: raw.Chassi || raw.VIN || null,
      renavam: raw.Renavam || raw.RENAVAM || null,
      situacao: raw.Situacao || raw.Status || null,
      cidade: raw.Municipio || raw.City || null,
      uf: raw.UF || raw.State || null,
      observacoes: raw.Observacoes || raw.Notes || null
    };

    return {
      status: 'sucesso',
      api: 'Center Apis Consulta Free',
      fonte: 'Center Apis Banco de Dados',
      dados
    };
  } catch (err) {
    return {
      status: 'erro',
      api: 'Center Apis Consulta Free',
      fonte: 'Center Apis Banco de Dados',
      erro: err.message
    };
  }
}
