// score.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// TOKEN da API DirectD
const TOKEN = "4B23EADC-3D9F-4910-B657-0E663020D044";

/**
 * Rota: /score/cpf={cpf}/json
 * Exemplo: /score/cpf=12345678900/json
 */
router.get("/cpf=:cpf/json", async (req, res) => {
  try {
    const { cpf } = req.params;

    const url = `https://apiv3.directd.com.br/api/Score?CPF=${cpf}&TOKEN=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json({
      status: "success",
      tipo: "CPF",
      consulta: cpf,
      dados: data,
    });
  } catch (error) {
    console.error("Erro ao consultar Score por CPF:", error);
    res.status(500).json({
      status: "error",
      message: "Erro ao consultar Score por CPF",
    });
  }
});

/**
 * Rota: /score/cnpj={cnpj}/json
 * Exemplo: /score/cnpj=12345678000199/json
 */
router.get("/cnpj=:cnpj/json", async (req, res) => {
  try {
    const { cnpj } = req.params;

    const url = `https://apiv3.directd.com.br/api/Score?CNPJ=${cnpj}&TOKEN=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json({
      status: "success",
      tipo: "CNPJ",
      consulta: cnpj,
      dados: data,
    });
  } catch (error) {
    console.error("Erro ao consultar Score por CNPJ:", error);
    res.status(500).json({
      status: "error",
      message: "Erro ao consultar Score por CNPJ",
    });
  }
});

export default router;