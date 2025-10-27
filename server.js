// server.js
import express from 'express';
import { consultarPlaca } from './consultas/placa.js';
import { consultarCNPJ } from './consultas/cnpj.js';
import { consultarCEP } from './consultas/cep.js';
import { consultarCPF } from './consultas/cpf.js';
import { consultarIP } from './consultas/ip.js';
import { consultarCPF2 } from './consultas/cpf2.js';  
import { consultarCPF3 } from './consultas/cpf3.js';
import { consultarRenda } from './consultas/renda.js';
import { consultarCepPlus } from './consultas/cepplus.js';

// novos imports
import { consultarEmail } from './consultas/email.js';
import { consultarMae } from './consultas/mae.js';
import { consultarNome } from './consultas/nome.js';
import { consultarRenda } from './consultas/renda.js';
import { consultarScore } from './consultas/score.js';
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

// 👨‍💼 Consulta de CPF V2
app.get('/cpf2/:cpf/json', async (req, res) => {
  const { cpf2 } = req.params;
  const consulta = await consultarCPF(cpf);
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
    <h2>🔍 API de Consultas</h2>
    <p>Rotas disponíveis (use /{valor}/json):</p>
    <ul>
      <li>/ip/{ip}/json</li>
      <li>/cpf/{cpf}/json</li>
      <li>/cpf2/{cpf}/json</li>
      <li>/cpf3/{cpf}/json</li>
      <li>/placa/{placa}/json</li>
      <li>/cnpj/{cnpj}/json</li>
      <li>/cep/{cep}/json</li>
      <li>/nome/{nome}/json</li>
      <li>/email/{email}/json</li>
      <li>/score/{ident}/json</li>
      <li>/renda/{ident}/json</li>
      <li>/score/{ident}/json</li>
      <li>/chassi/{chassi}/json</li>
      <li>/motor/{motor}/json</li>
      <li>/renavam/{renavam}/json</li>
      <li>/rg/{rg}/json</li>
      <li>/telefone/{telefone}/json</li>
      <li>/card/{credit|debit}/gen/{n}</li>
      <li>/renda/{param}/json</li>
      <li>/valid/{number}/json</li>
      <li>/cepplus/{cep}/json</li>
      </ul>
    <p>Exemplo: <a href="/cep/01001000/json">/cep/01001000/json</a></p>
  `);
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
