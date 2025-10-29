// server.js
import express from 'express';
import fetch from 'node-fetch';
// --- Importações das consultas ---
import { consultarPlaca } from './consultas/placa.js';
import { consultarCNPJ } from './consultas/cnpj.js';
import { consultarCEP } from './consultas/cep.js';
import { consultarCPF } from './consultas/cpf.js';
import { consultarCPF3 } from './consultas/cpf3.js';
import { consultarIP } from './consultas/ip.js';
import { consultarRenda } from './consultas/renda.js';
import { consultarCepPlus } from './consultas/cepplus.js';
import { consultarEmail } from './consultas/email.js';
import { consultarMae } from './consultas/mae.js';
import { consultarNome } from './consultas/nome.js';
import { consultarChassi } from './consultas/chassi.js';
import { consultarMotor } from './consultas/motor.js';
import { consultarRenavam } from './consultas/renavam.js';
import { consultarRG } from './consultas/rg.js';
import { consultarTelefone } from './consultas/telefone.js';
import { gerarCartoes } from './consultas/card.js';
import { validarCartao } from './consultas/valid.js';

// No início do arquivo principal da API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- Configuração principal ---
const app = express();
app.use(express.json());

// -----------------------------
// Rotas de consulta
// -----------------------------

// ☎️ DDD
app.get('/ddd/:ddd/json', async (req, res) => {
  try {
    const { ddd } = req.params;
    const response = await fetch(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
    const data = await response.json();
    res.json({ status: 'success', tipo: 'DDD', consulta: ddd, dados: data });
  } catch {
    res.status(500).json({ status: 'error', message: 'Erro ao consultar DDD.' });
  }
});

// 💳 Gerar e validar cartões
app.get('/card/:tipo/gen/:n', async (req, res) => {
  res.json(await gerarCartoes(req.params.tipo, req.params.n));
});

app.get('/valid/:number/json', async (req, res) => {
  res.json(await validarCartao(req.params.number));
});

// 🌐 IP
app.get('/ip/:ip/json', async (req, res) => res.json(await consultarIP(req.params.ip)));

// 👤 CPF
app.get('/cpf/:cpf/json', async (req, res) => res.json(await consultarCPF(req.params.cpf)));
app.get('/cpf3/:cpf/json', async (req, res) => res.json(await consultarCPF3(req.params.cpf)));

// 💰 Renda
app.get('/renda/:param/json', async (req, res) => res.json(await consultarRenda(req.params.param)));

// 📍 CEP e CEP Plus
app.get('/cep/:cep/json', async (req, res) => res.json(await consultarCEP(req.params.cep)));
app.get('/cepplus/:cep/json', async (req, res) => res.json(await consultarCepPlus(req.params.cep)));

// 🚗 Veículos
app.get('/placa/:placa/json', async (req, res) => res.json(await consultarPlaca(req.params.placa)));
app.get('/chassi/:chassi/json', async (req, res) => res.json(await consultarChassi(req.params.chassi)));
app.get('/motor/:motor/json', async (req, res) => res.json(await consultarMotor(req.params.motor)));
app.get('/renavam/:renavam/json', async (req, res) => res.json(await consultarRenavam(req.params.renavam)));

// 🧾 Identificadores
app.get('/cnpj/:cnpj/json', async (req, res) => res.json(await consultarCNPJ(req.params.cnpj)));
app.get('/rg/:rg/json', async (req, res) => res.json(await consultarRG(req.params.rg)));
app.get('/telefone/:telefone/json', async (req, res) => res.json(await consultarTelefone(req.params.telefone)));

// 📧 Nome, Email e Mãe
app.get('/nome/:nome/json', async (req, res) => res.json(await consultarNome(req.params.nome)));
app.get('/email/:email/json', async (req, res) => res.json(await consultarEmail(req.params.email)));
app.get('/mae/:ident/json', async (req, res) => res.json(await consultarMae(req.params.ident)));

// 📊 Score
app.get('/score/:ident/json', async (req, res) => {
  const { ident } = req.params;
  const TOKEN = '4B23EADC-3D9F-4910-B657-0E663020D044';
  try {
    const url = ident.length === 11
      ? `https://apiv3.directd.com.br/api/Score?CPF=${ident}&TOKEN=${TOKEN}`
      : ident.length === 14
        ? `https://apiv3.directd.com.br/api/Score?CNPJ=${ident}&TOKEN=${TOKEN}`
        : null;

    if (!url) return res.status(400).json({ status: 'error', message: 'Identificador inválido.' });

    const data = await (await fetch(url)).json();
    res.json({ status: 'success', tipo: ident.length === 11 ? 'CPF' : 'CNPJ', consulta: ident, dados: data });
  } catch {
    res.status(500).json({ status: 'error', message: 'Erro interno ao consultar Score.' });
  }
});

// -----------------------------
// Página inicial
// -----------------------------
app.get('/', (req, res) => {
  res.send(`
  <html>
  <head><meta charset="UTF-8"><title>Center Consultas API</title></head>
  <body style="background:#0d1117;color:#e6edf3;font-family:sans-serif;text-align:center;padding:40px;">
    <h1>🧠 Center Consultas API</h1>
    <h2 style="color:#00ff99;">Rotas Disponíveis</h2>
    <p>Use o formato <code>/{rota}/{valor}/json</code></p>
    <ul style="list-style:none;text-align:left;max-width:500px;margin:auto;">
      <li>🌐 /ip/8.8.8.8/json</li>
      <li>🧾 /cpf/00000000000/json</li>
      <li>🚗 /placa/ABC1234/json</li>
      <li>🏢 /cnpj/00000000000191/json</li>
      <li>📍 /cep/01001000/json</li>
      <li>📧 /email/teste@gmail.com/json</li>
      <li>💳 /card/credit/gen/10</li>
      <li>📊 /score/12345678900/json</li>
    </ul>
    <footer style="margin-top:40px;color:#777;">⚙️ Desenvolvido por <b>@kaio.kvs</b></footer>
  </body>
  </html>
  `);
});

// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
