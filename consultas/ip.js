// consultas/ip.js
import fetch from 'node-fetch';

/**
 * Validação simples de IPv4 / IPv6.
 * Aceita também hostnames (sem validação profunda).
 */
function isValidIPorHost(value) {
  if (!value) return false;
  const ip = String(value).trim();

  // IPv4
  const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
  // IPv6 (simplified)
  const ipv6 = /^([0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}$/i;
  // Hostname (basic)
  const hostname = /^[a-z0-9.-]+$/i;

  return ipv4.test(ip) || ipv6.test(ip) || hostname.test(ip);
}

export async function consultarIP(ip) {
  try {
    if (!isValidIPorHost(ip)) {
      return { status: false, erro: 'IP/host inválido.' };
    }

    // ip-api aceita tanto IPs quanto hostnames
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,lat,lon,isp,query,timezone,as,zip`;

    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) {
      return { status: false, erro: `Erro na API externa: ${res.status} ${res.statusText}` };
    }

    const data = await res.json();

    if (data.status !== 'success') {
      return { status: false, erro: data.message || 'Consulta IP retornou erro', raw: data };
    }

    // Retornamos apenas os campos úteis (mantendo estrutura consistente)
    const resultado = {
      query: data.query,
      country: data.country,
      region: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      as: data.as
    };

    return { status: true, dados: resultado };
  } catch (err) {
    return { status: false, erro: err.message };
  }
}