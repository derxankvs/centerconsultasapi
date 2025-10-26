// server.js
import express from 'express';
import { consultarPlaca } from './consultas/placa.js';
import { consultarCNPJ } from './consultas/cnpj.js';
import { consultarCEP } from './consultas/cep.js';
import { consultarCPF } from './consultas/cpf.js';
import { consultarIP } from './consultas/ip.js';

// novos imports
import { consultarEmail } from './consultas/email.js';
import { consultarMae } from './consultas/mae.js';
import { consultarNome } from './consultas/nome.js';
import { consultarRenda } from './consultas/renda.js';
import { consultarScore } from './consultas/score.js';
import { consultarChassi } from './consultas/chassi.js';
import { consultarMotor } from './consultas/motor.js';
import { consultarPIS } from './consultas/pis.js';
import { consultarRenavam } from './consultas/renavam.js';
import { consultarRG } from './consultas/rg.js';
import { consultarTelefone } from './consultas/telefone.js';

const app = express();
const PORT = process.env.PORT || 3000;

// middleware (opcional, útil para receber JSON em POSTs futuros)
app.use(express.json());

// -----------------------------
// Rotas existentes
// -----------------------------

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

// /renda/:ident/json
app.get('/renda/:ident/json', async (req, res) => {
  const { ident } = req.params;
  const consulta = await consultarRenda(ident);
  res.json(consulta);
});

// /score/:ident/json
app.get('/score/:ident/json', async (req, res) => {
  const { ident } = req.params;
  const consulta = await consultarScore(ident);
  res.json(consulta);
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

// /pis/:pis/json
app.get('/pis/:pis/json', async (req, res) => {
  const { pis } = req.params;
  const consulta = await consultarPIS(pis);
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
      <li>/placa/{placa}/json</li>
      <li>/cnpj/{cnpj}/json</li>
      <li>/cep/{cep}/json</li>
      <li>/nome/{nome}/json</li>
      <li>/email/{email}/json</li>
      <li>/mae/{ident}/json</li>
      <li>/renda/{ident}/json</li>
      <li>/score/{ident}/json</li>
      <li>/chassi/{chassi}/json</li>
      <li>/motor/{motor}/json</li>
      <li>/pis/{pis}/json</li>
      <li>/renavam/{renavam}/json</li>
      <li>/rg/{rg}/json</li>
      <li>/telefone/{telefone}/json</li>
    </ul>
    <p>Exemplo: <a href="/cep/01001000/json">/cep/01001000/json</a></p>
  `);
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
