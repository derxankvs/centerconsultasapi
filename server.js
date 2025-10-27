// server.js
import express from 'express';
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
import fetch from 'node-fetch';
const app = express();
const PORT = process.env.PORT || 3000;

// middleware (opcional, útil para receber JSON em POSTs futuros)
app.use(express.json());

// -----------------------------
// Rotas existentes
// -----------------------------

// ☎️ Consulta de DDD
app.get('/ddd/:ddd/json', async (req, res) => {
  const { ddd } = req.params;

  try {
    const url = `https://brasilapi.com.br/api/ddd/v1/${ddd}`;
    const response = await fetch(url);
    const data = await response.json();

    // Retorna os dados da consulta
    res.json({
      status: "success",
      tipo: "DDD",
      consulta: ddd,
      dados: data
    });
  } catch (error) {
    console.error("Erro ao consultar DDD:", error);
    res.status(500).json({
      status: "error",
      message: "Erro interno ao consultar DDD."
    });
  }
});

// rota esperada: /card/{credit|debit}/gen/{n}
app.get('/card/:tipo/gen/:n', async (req, res) => {
  const { tipo, n } = req.params; // tipo pode ser 'credit' ou 'debit'
  const resultado = await gerarCartoes(tipo, n);
  res.json(resultado);
});

// rota de validação (sem imports no topo, apenas colar dentro do server.js)
app.get('/valid/:number/json', async (req, res) => {
  const { number } = req.params;
  const result = await validarCartao(number);
  res.json(result);
});

// 📍 Consulta de IP
app.get('/ip/:ip/json', async (req, res) => {
  const { ip } = req.params;
  const consulta = await consultarIP(ip);
  res.json(consulta);
});

// 👨‍💼 Consulta de CPF
app.get('/cpf/:cpf/json', async (req, res) => {
  const { cpf } = req.params;
  const consulta = await consultarCPF(cpf);
  res.json(consulta);
});

app.get('/cpf3/:cpf/json', async (req, res) => {
  const { cpf } = req.params;
  const consulta = await consultarCPF3(cpf);
  res.json(consulta);
});

// /renda/:param/json  -> param = cep (01001000) ou "cidade,uf"
app.get('/renda/:param/json', async (req, res) => {
  const { param } = req.params;
  const resultado = await consultarRenda(param);
  res.json(resultado);
});

// /cepplus/:cep/json
app.get('/cepplus/:cep/json', async (req, res) => {
  const { cep } = req.params;
  const resultado = await consultarCepPlus(cep);
  res.json(resultado);
});

// 🚗 Consulta de placa
app.get('/placa/:placa/json', async (req, res) => {
  const { placa } = req.params;
  const consulta = await consultarPlaca(placa);
  res.json(consulta);
});

// 🏢 Consulta de CNPJ
app.get('/cnpj/:cnpj/json', async (req, res) => {
  const { cnpj } = req.params;
  const consulta = await consultarCNPJ(cnpj);
  res.json(consulta);
});

// 🏠 Consulta de CEP
app.get('/cep/:cep/json', async (req, res) => {
  const { cep } = req.params;
  const consulta = await consultarCEP(cep);
  res.json(consulta);
});

// -----------------------------
// Novas rotas solicitadas
// -----------------------------

// /nome/:nome/json
app.get('/nome/:nome/json', async (req, res) => {
  const { nome } = req.params;
  const consulta = await consultarNome(nome);
  res.json(consulta);
});

// /email/:email/json
app.get('/email/:email/json', async (req, res) => {
  const { email } = req.params;
  const consulta = await consultarEmail(email);
  res.json(consulta);
});

// /mae/:ident/json
app.get('/mae/:ident/json', async (req, res) => {
  const { ident } = req.params;
  const consulta = await consultarMae(ident);
  res.json(consulta);
});

// 🔢 Consulta de Score (CPF ou CNPJ)
app.get('/score/:ident/json', async (req, res) => {
  const { ident } = req.params;
  const TOKEN = "4B23EADC-3D9F-4910-B657-0E663020D044";

  try {
    let url;

    // Detecta automaticamente se é CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (ident.length === 11) {
      url = `https://apiv3.directd.com.br/api/Score?CPF=${ident}&TOKEN=${TOKEN}`;
    } else if (ident.length === 14) {
      url = `https://apiv3.directd.com.br/api/Score?CNPJ=${ident}&TOKEN=${TOKEN}`;
    } else {
      return res.status(400).json({
        status: "error",
        message: "Identificador inválido. Use CPF (11 dígitos) ou CNPJ (14 dígitos)."
      });
    }

    // Faz a requisição
    const response = await fetch(url);
    const data = await response.json();

    res.json({
      status: "success",
      tipo: ident.length === 11 ? "CPF" : "CNPJ",
      consulta: ident,
      dados: data
    });

  } catch (error) {
    console.error("Erro ao consultar Score:", error);
    res.status(500).json({
      status: "error",
      message: "Erro interno ao consultar Score."
    });
  }
});

// /chassi/:chassi/json
app.get('/chassi/:chassi/json', async (req, res) => {
  const { chassi } = req.params;
  const consulta = await consultarChassi(chassi);
  res.json(consulta);
});

// /motor/:motor/json
app.get('/motor/:motor/json', async (req, res) => {
  const { motor } = req.params;
  const consulta = await consultarMotor(motor);
  res.json(consulta);
});
 
// /renavam/:renavam/json
app.get('/renavam/:renavam/json', async (req, res) => {
  const { renavam } = req.params;
  const consulta = await consultarRenavam(renavam);
  res.json(consulta);
});

// /rg/:rg/json
app.get('/rg/:rg/json', async (req, res) => {
  const { rg } = req.params;
  const consulta = await consultarRG(rg);
  res.json(consulta);
});

// /telefone/:telefone/json
app.get('/telefone/:telefone/json', async (req, res) => {
  const { telefone } = req.params;
  const consulta = await consultarTelefone(telefone);
  res.json(consulta);
});

// -----------------------------
// Página inicial / documentação simples
// -----------------------------
app.get('/', (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Center Consultas API 🔍</title>
    <meta charset="UTF-8">
    <style>
      body {
        background-color: #0d1117;
        color: #e6edf3;
        font-family: 'Segoe UI', Arial, sans-serif;
        margin: 0;
        padding: 40px;
      }
      h1, h2 {
        color: #00ff99;
        text-align: center;
      }
      p {
        text-align: center;
        color: #aaa;
      }
      ul {
        list-style: none;
        padding: 0;
        max-width: 600px;
        margin: 40px auto;
      }
      li {
        background: #161b22;
        padding: 12px 18px;
        margin: 6px 0;
        border-radius: 10px;
        transition: 0.3s;
      }
      li:hover {
        background: #00ff9966;
        transform: translateX(4px);
      }
      a {
        color: #00ff99;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      footer {
        text-align: center;
        color: #555;
        margin-top: 40px;
        font-size: 14px;
      }
      .highlight {
        color: #ff3366;
      }
    </style>
  </head>
  <body>
    <h1>🧠 Center Consultas API</h1>
    <h2>🔍 Rotas Disponíveis</h2>
    <p>Use o formato <code>/{valor}/json</code> para consultar</p>

    <ul>
      <li>🌐 <a href="/ip/8.8.8.8/json">/ip/{ip}/json</a></li>
      <li>🧾 <a href="/cpf/00000000000/json"> /cpf3/{cpf}/json ou /cpf/{cpf}/json</a></li>
      <li>🚗 <a href="/placa/ABC1234/json">/placa/{placa}/json</a></li>
      <li>🏢 <a href="/cnpj/00000000000191/json">/cnpj/{cnpj}/json</a></li>
      <li>📍 <a href="/cep/01001000/json">/cep/{cep}/json</a></li>
      <li>👤 <a href="/nome/kaio/json">/nome/{nome}/json</a></li>
      <li>📧 <a href="/email/teste@gmail.com/json">/email/{email}/json</a></li>
      <li>📞 <a href="/telefone/5599999999999/json">/telefone/{telefone}/json</a></li>
      <li>🪪 <a href="/rg/12345678/json">/rg/{rg}/json</a></li>
      <li>⚙️ <a href="/motor/12345/json">/motor/{motor}/json</a></li>
      <li>🚘 <a href="/renavam/123456789/json">/renavam/{renavam}/json</a></li>
      <li>💳 <a href="/card/credit/gen/10">/card/{credit|debit}/gen/{n}</a></li>
      <li>💰 <a href="/renda/12345678900/json">/renda/{ident}/json</a></li>
      <li>📊 <a href="/score/12345678900/json">/score/{ident}/json</a></li>
      <li>🏠 <a href="/cepplus/01001000/json">/cepplus/{cep}/json</a></li>
      <li>🏍️ <a href="/chassi/{chassi}/json">/chassi/numerodochassi/json</a></li>
      <li>💳 <a href="/valid/{number}/json">/valid/numerodocartao/json</a></li>
    </ul>

    <footer>
      ⚙️ API desenvolvida por <span class="highlight">@kaio.kvs</span> • <b>Center Consultas</b>  
    </footer>
  </body>
  </html>
  `);
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
