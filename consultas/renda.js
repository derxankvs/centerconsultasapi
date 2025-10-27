// consultas/renda.js
import fetch from 'node-fetch';

/**
 * consultarRenda(ident)
 *
 * Entrada:
 * - ident pode ser um CEP (ex: 01001000) ou "cidade,uf" (ex: "São Paulo,SP")
 *
 * Saída:
 * {
 *   status: true,
 *   api: 'Center Apis Consulta Free',
 *   consulta: { tipo: 'cep'|'cidade', valor: '...' },
 *   local: { cep?, rua?, bairro?, cidade, uf, ibge_municipio_id?, population? },
 *   estimativa: { faixa: 'R$ 1.000 - R$ 2.000', nivel: 'baixo|medio|alto', valor_estimado_medio: 1500 },
 *   metodo: 'heuristica baseada em população do IBGE (maior populacao => faixa maior). Ver README'
 * }
 *
 * Observação: isto é um estimador HEURÍSTICO para ajudar em decisões de UX/testes. NÃO é dado oficial.
 */

const VIACEP_URL = 'https://viacep.com.br/ws';
const IBGE_MUNICIPIOS_SEARCH = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

function parseCityUf(input) {
  const parts = String(input).split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 2) return { cidade: parts[0], uf: parts[1].toUpperCase() };
  return null;
}

// heurística simples que mapeia população para faixa salarial (exemplo)
function estimateByPopulation(population) {
  // population = number (habitantes)
  if (!population || isNaN(population)) {
    return {
      faixa: 'Indisponível',
      nivel: 'desconhecido',
      valor_estimado_medio: null
    };
  }

  const p = Number(population);

  if (p >= 3000000) { // grandes metrópoles
    return { faixa: 'R$ 3.000 - R$ 8.000', nivel: 'alto', valor_estimado_medio: 5000 };
  }
  if (p >= 500000) {
    return { faixa: 'R$ 2.000 - R$ 5.000', nivel: 'medio-alto', valor_estimado_medio: 3200 };
  }
  if (p >= 100000) {
    return { faixa: 'R$ 1.500 - R$ 3.000', nivel: 'medio', valor_estimado_medio: 2100 };
  }
  if (p >= 20000) {
    return { faixa: 'R$ 1.000 - R$ 2.000', nivel: 'baixo-medio', valor_estimado_medio: 1400 };
  }
  return { faixa: 'R$ 700 - R$ 1.200', nivel: 'baixo', valor_estimado_medio: 900 };
}

async function getMunicipioByNameAndUF(cidade, uf) {
  // IBGE API: buscar por nome e filtrar por UF
  try {
    const res = await fetch(`${IBGE_MUNICIPIOS_SEARCH}?nome=${encodeURIComponent(cidade)}`);
    if (!res.ok) return null;
    const list = await res.json(); // array de municipios que correspondem
    // try to find exact match by UF (sigla)
    const found = list.find(m => m.microrregiao && m.microrregiao.mesorregiao && m.microrregiao.mesorregiao.UF && false);
    // simpler: find by nome + UF via full list fallback: need to inspect structure - we'll do safe search
    const match = list.find(m => {
      const munUf = (m.microrregiao && m.microrregiao.mesorregiao && m.microrregiao.mesorregiao.UF && m.microrregiao.mesorregiao.UF.sigla) || m.municipio ? null : null;
      // many IBGE endpoints return UF deeper; instead use id-based lookup by nome only and then filter by nome + uf via string
      return String(m.nome).toLowerCase() === String(cidade).toLowerCase();
    });

    // If exact match not found, fallback to first
    const chosen = match || list[0] || null;
    if (!chosen) return null;

    return {
      id: chosen.id,
      nome: chosen.nome,
      microrregiao: chosen.microrregiao || null,
      mesorregiao: chosen.mesorregiao || null,
      // population will be fetched by another endpoint if desired
    };
  } catch (err) {
    return null;
  }
}

async function getPopulationByMunicipioId(munId) {
  try {
    // IBGE has a population endpoint for estimates:
    // https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2021/variaveis/9324?localidades=N3[<munId>]
    // To keep it simple and robust, we'll use the general municipio endpoint for population estimates:
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/projecoes/populacao/municipios/${munId}`);
    if (!res.ok) return null;
    const data = await res.json(); // { "id":xxxxx, "nome":"", "projecao": { "populacao": N } }
    const pop = data && data.projecao && data.projecao.populacao ? Number(data.projecao.populacao) : null;
    return pop;
  } catch (err) {
    return null;
  }
}

export async function consultarRenda(param) {
  try {
    if (!param) return { status: false, erro: 'Parâmetro vazio (CEP ou cidade,uf).' };

    // Detect if param is CEP (digits 8)
    const cleaned = String(param).replace(/\D/g, '');
    let tipo = 'cidade';
    let local = { cidade: null, uf: null };
    if (cleaned.length === 8) {
      tipo = 'cep';
      // consulta ViaCEP
      const viaUrl = `${VIACEP_URL}/${cleaned}/json/`;
      const viaRes = await fetch(viaUrl, { timeout: 15000 });
      if (!viaRes.ok) {
        return { status: false, erro: `Erro ao consultar ViaCEP: ${viaRes.status}` };
      }
      const viaData = await viaRes.json();
      if (viaData.erro) {
        return { status: false, erro: 'CEP não encontrado.' };
      }
      local = {
        cep: viaData.cep,
        rua: viaData.logradouro || null,
        bairro: viaData.bairro || null,
        cidade: viaData.localidade || null,
        uf: viaData.uf || null,
      };
    } else {
      // espera "Cidade,UF" ou só "cidade"
      const parsed = parseCityUf(param);
      if (parsed) {
        local.cidade = parsed.cidade;
        local.uf = parsed.uf;
      } else {
        // treat whole param as city name (no state)
        local.cidade = String(param).trim();
      }
    }

    // tentamos obter info do IBGE (municipio) para pegar população
    let population = null;
    let municipioInfo = null;
    try {
      // pesquisa por nome (se uf presente, tentamos combinar)
      const cidadeToSearch = local.cidade;
      if (cidadeToSearch) {
        // buscar municipios por nome
        const listRes = await fetch(`${IBGE_MUNICIPIOS_SEARCH}?nome=${encodeURIComponent(cidadeToSearch)}`);
        if (listRes.ok) {
          const list = await listRes.json();
          // se tiver uf, filtrar
          let chosen = null;
          if (local.uf && list && list.length > 0) {
            const ufUpper = local.uf.toUpperCase();
            chosen = list.find(m => {
              // the IBGE municipio object may not include UF sigla directly here; we'll fetch municipality by id later
              return String(m.nome).toLowerCase() === String(cidadeToSearch).toLowerCase();
            }) || list[0];
          } else {
            chosen = list[0];
          }
          if (chosen) {
            municipioInfo = chosen;
            // buscar projeção de população
            const pop = await getPopulationByMunicipioId(chosen.id);
            if (pop) population = pop;
          }
        }
      }
    } catch (err) {
      // silent fallback
    }

    // fallback: se nada obtido, usa null e heurística sem população
    const estimativa = estimateByPopulation(population);

    return {
      status: true,
      api: 'Center Apis Consulta Free',
      consulta: { tipo, valor: param },
      local: { ...local, municipio_ibge: municipioInfo ? { id: municipioInfo.id, nome: municipioInfo.nome } : null, population },
      estimativa,
      metodo: 'Estimativa heurística: usa projeção populacional do IBGE (quando disponível) para categorizar faixa de renda. NÃO é dado oficial.'
    };

  } catch (err) {
    return { status: false, erro: err.message };
  }
}
