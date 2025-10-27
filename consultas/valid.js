// consultas/valid.js
// Validador local: Luhn + BIN detection + MII (Major Industry Identifier) + masked PAN

// mapa BIN -> brand (simplificado, usa prefixos)
const brandBins = [
  { brand: "American Express", prefixes: ["34","37"], lengths: [15] },
  { brand: "Diners Club", prefixes: ["300","301","302","303","304","305","36","54"], lengths: [14,16] },
  { brand: "Discover", prefixes: ["6011","644","645","646","647","648","649","65"], lengths: [16] },
  { brand: "InstaPayment", prefixes: ["637","638","639"], lengths: [16] },
  { brand: "JCB", prefixes: ["3528","3529","3530","3589"], lengths: [16] },
  { brand: "Maestro", prefixes: ["5018","5020","5038","5893","6304","6759","6761","6762","6763"], lengths: [16,17,18,19] },
  { brand: "MasterCard", prefixes: ["51","52","53","54","55"], lengths: [16] },
  { brand: "Visa", prefixes: ["4"], lengths: [13,16] },
  { brand: "Visa Electron", prefixes: ["4026","417500","4508","4844","4913","4917"], lengths: [16] }
];

// Luhn check
function luhnCheck(number) {
  if (!/^\d+$/.test(number)) return false;
  const digits = number.split('').map(d => parseInt(d, 10));
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let val = digits[i];
    if (double) {
      val = val * 2;
      if (val > 9) val -= 9;
    }
    sum += val;
    double = !double;
  }
  return sum % 10 === 0;
}

function detectBrand(number) {
  for (const entry of brandBins) {
    for (const p of entry.prefixes) {
      if (number.startsWith(p)) {
        if (entry.lengths.includes(number.length) || entry.lengths.some(l => typeof l === "number")) {
          return entry.brand;
        }
      }
    }
  }
  return null;
}

// MII: primeiro dígito
function getMII(number) {
  const map = {
    0: "ISO/TC 68 and other future industry assignments",
    1: "Airlines",
    2: "Airlines and other future industry assignments",
    3: "Travel and entertainment",
    4: "Banking and financial",
    5: "Banking and financial",
    6: "Merchandising and banking/financial",
    7: "Petroleum",
    8: "Healthcare, telecommunications",
    9: "National assignment"
  };
  const d = number[0];
  return map[parseInt(d, 10)] || null;
}

function maskPAN(number) {
  if (number.length <= 4) return number;
  return number.slice(0, 6) + number.slice(6, -4).replace(/\d/g, "*") + number.slice(-4);
}

// função de validação exportada
export async function validarCartao(number) {
  const clean = String(number).replace(/\D/g, '');
  if (!clean) {
    return {
      valid: false,
      message: "Número inválido (sem dígitos).",
    };
  }

  const luhn = luhnCheck(clean);
  const brand = detectBrand(clean) || "N/A";
  const mii = getMII(clean) || "N/A";
  const bin = clean.slice(0, 6) || "N/A";
  const pan = clean.length >= 6 ? maskPAN(clean) : "N/A";
  const checksum = clean.slice(-1);

  if (!luhn) {
    return {
      success: false,
      "Your Card Number Is Invalid": true,
      "Luhn Algorithm Check": "Failed",
      "MII (Major Industry Identifier)": mii,
      "Bank Name": "N/A",
      "Bank Country": "N/A",
      "BIN/IIN (Bank/Issuer Identification Number)": bin,
      "PAN (Primary Account Number)": pan,
      "Network/Brand": brand,
      "Checksum": checksum
    };
  }

  // se passou Luhn, retornamos dados técnicos (NÃO bancários reais)
  return {
    success: true,
    "Your Card Number Is Invalid": false,
    "Luhn Algorithm Check": "Passed",
    "MII (Major Industry Identifier)": mii,
    "Bank Name": "N/A (use provedor BIN real para nome do banco)",
    "Bank Country": "N/A",
    "BIN/IIN (Bank/Issuer Identification Number)": bin,
    "PAN (Primary Account Number)": pan,
    "Network/Brand": brand,
    "Checksum": checksum
  };
}
