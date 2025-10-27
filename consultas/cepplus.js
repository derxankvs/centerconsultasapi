// consultas/cepplus.js
import fetch from 'node-fetch';

/**
 * consultarCepPlus(cep)
 *
 * Fluxo:
 *  - consulta ViaCEP (https://viacep.com.br/ws/{cep}/json/)
 *  - com cidade + logradouro tenta geocodificar via Nominatim (OpenStreetMap) para obter lat/lon
 *  - retorna JSON unificado com fields: cep, logradouro, bairro, localidade, uf, ddd (quando disponível),
 *    lat, lon, map_url (link google maps), observacoes
 *
 * Rota sugerida: /cepplus/:cep/json
 *
 * Observação: Nominatim tem política de uso (rate limit). Em produção use um serviço de geocoding com quota.
 */

const VIACEP_URL = 'https://viacep.com.br/ws';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function consultarCepPlus(cep) {
  try {
    if (!cep) return { status: false, erro: 'CEP não informado.' };
    const cleaned = String(cep).replace(/\D/g, '');
    if (cleaned.length !== 8) return { status: false, erro: 'CEP inválido (deve ter 8 dígitos).' };

    // ViaCEP
    const viaRes = await fetch(`${VIACEP_URL}/${cleaned}/json/`, { timeout: 15000 });
    if (!viaRes.ok) return { status: false, erro: `Erro ViaCEP: ${viaRes.status}` };
    const viaData = await viaRes.json();
    if (viaData.erro) return { status: false, erro: 'CEP não encontrado.' };

    const result = {
      status: true,
      api: 'Center Apis Consulta Free',
      consulta: cleaned,
      dados: {
        cep: viaData.cep,
        logradouro: viaData.logradouro || null,
        complemento: viaData.complemento || null,
        bairro: viaData.bairro || null,
        localidade: viaData.localidade || null,
        uf: viaData.uf || null,
        ddd: viaData.ddd || null
      },
      observacoes: []
    };

    // tentar geocodificar com Nominatim usando logradouro + cidade + uf
    try {
      const queryParts = [];
      if (viaData.logradouro) queryParts.push(viaData.logradouro);
      if (viaData.bairro) queryParts.push(viaData.bairro);
      if (viaData.localidade) queryParts.push(viaData.localidade);
      if (viaData.uf) queryParts.push(viaData.uf);
      queryParts.push('Brasil');
      const q = queryParts.join(', ');

      const nomUrl = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(q)}`;
      const nomRes = await fetch(nomUrl, {
        headers: { 'User-Agent': 'CenterApis/1.0 (contact: your-email@example.com)' },
        timeout: 15000
      });
      if (nomRes.ok) {
        const nomJson = await nomRes.json();
        if (Array.isArray(nomJson) && nomJson.length > 0) {
          const place = nomJson[0];
          result.dados.lat = place.lat;
          result.dados.lon = place.lon;
          result.map_url = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=18/${place.lat}/${place.lon}`;
        } else {
          result.observacoes.push('Geocodificação: nenhum resultado no Nominatim.');
        }
      } else {
        result.observacoes.push(`Geocodificação: erro Nominatim ${nomRes.status}`);
      }
    } catch (errGeo) {
      result.observacoes.push('Geocodificação falhou: ' + errGeo.message);
    }

    return result;

  } catch (err) {
    return { status: false, erro: err.message };
  }
}
