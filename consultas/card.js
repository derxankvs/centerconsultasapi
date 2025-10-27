// consultas/card.js
// Gerador de cartões de TESTE apenas (não use para transações reais).
// Rota esperada: /card/{credit|debit}/gen/{n}  (n entre 1 e 20)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Luhn: calcula o dígito verificador para prefixo (todos os dígitos menos o último)
function computeLuhnCheckDigit(numberWithoutCheck) {
  const digits = numberWithoutCheck.split('').map(d => parseInt(d, 10));
  // aplicar algoritmo Luhn (diretamente)
  let sum = 0;
  let double = true; // because we'll process from right to left and need to double every second digit
  for (let i = digits.length - 1; i >= 0; i--) {
    let val = digits[i];
    if (double) {
      val = val * 2;
      if (val > 9) val = val - 9;
    }
    sum += val;
    double = !double;
  }
  const mod = sum % 10;
  const check = (10 - mod) % 10;
  return String(check);
}

// cria número completo a partir de um prefixo e tamanho desejado (incluindo dígito check)
function buildCardNumber(prefix, length) {
  const needed = length - prefix.length - 1; // -1 para o dígito Luhn final
  let body = prefix;
  for (let i = 0; i < needed; i++) {
    body += String(randomInt(0, 9));
  }
  const check = computeLuhnCheckDigit(body);
  return body + check;
}

// nomes aleatórios simples (sem depender de libs externas)
const firstNames = ["Gabriela","Lucas","Mariana","Pedro","Laura","João","Ana","Rafael","Beatriz","Mateus","Ella","Liam","Olivia","Noah","Emma"];
const lastNames = ["Silva","Souza","Oliveira","Pereira","Santos","Gomez","Ferreira","Costa","Ribeiro","Martins","Murphy","Johnson","Brown","Miller"];

// Mapas simplificados de BINs/prefixos por bandeira (apenas para geração de teste)
const brandBins = {
  "American Express": { prefixes: ["34","37"], lengths: [15] },
  "Diners Club": { prefixes: ["300","301","302","303","304","305","36","54"], lengths: [14,16] },
  "Discover": { prefixes: ["6011","644","645","646","647","648","649","65"], lengths: [16] },
  "InstaPayment": { prefixes: ["637","638","639"], lengths: [16] },
  "JCB": { prefixes: ["3528","3529","3530","3589"], lengths: [16] },
  "Maestro": { prefixes: ["5018","5020","5038","5893","6304","6759","6761","6762","6763"], lengths: [16,17,18,19] },
  "MasterCard": { prefixes: ["51","52","53","54","55"], lengths: [16] },
  "Visa": { prefixes: ["4"], lengths: [13,16] },
  "Visa Electron": { prefixes: ["4026","417500","4508","4844","4913","4917"], lengths: [16] }
};

// lista de todas as bandeiras para escolher aleatoriamente
const brandsList = Object.keys(brandBins);

// gera um nome aleatório plausível
function genName() {
  const f = firstNames[randomInt(0, firstNames.length - 1)];
  const l = lastNames[randomInt(0, lastNames.length - 1)];
  return `${f} ${l}`;
}

// formata expiry MM/YY com ano >= 28 (i.e., 2028+ -> '28' representa 2028)
function genExpiry() {
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const year = String(randomInt(28, 40)); // 28..40 -> 2028..2040
  return `${month}/${year}`;
}

// gera CVV (3 ou 4 dígitos)
function genCVV(brand) {
  if (brand === "American Express") {
    return String(randomInt(1000, 9999)); // Amex usa 4 dígitos
  }
  return String(randomInt(100, 999));
}

// escolhe uma bandeira "realista" baseada em prefixos
function chooseBrandRandom() {
  return brandsList[randomInt(0, brandsList.length - 1)];
}

// gera um cartão de teste
function generateCard(type /* "credit"|"debit" — aqui só informativo */, forcedBrand = null) {
  const brand = forcedBrand || chooseBrandRandom();
  const info = brandBins[brand];
  // escolher prefixo e comprimento
  const prefix = info.prefixes[randomInt(0, info.prefixes.length - 1)];
  const length = info.lengths[randomInt(0, info.lengths.length - 1)];
  const number = buildCardNumber(prefix, length);
  return {
    type: brand,
    name: genName(),
    number,
    cvv: genCVV(brand),
    expiry: genExpiry(),
    Autor: "derxan.kvs",
    GitHub: "https://github.com/derxan.kvs",
    API: "Center Apis",
    test: true
  };
}

// função exportada para uso em rota
export async function gerarCartoes(tipo /* credit|debit */, total = 1) {
  const n = Math.max(1, Math.min(20, parseInt(total, 10) || 1));
  const results = [];
  for (let i = 0; i < n; i++) {
    results.push(generateCard(tipo));
  }
  return {
    status: "success",
    total: results.length,
    dados: results
  };
}
