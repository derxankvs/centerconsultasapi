// consultas/cpf2.js
import fetch from "node-fetch";

export async function consultarCPF2(cpf) {
  try {
    const token = "4B23EADC-3D9F-4910-B657-0E663020D044"; // coloque seu token real da DirectD aqui
    const url = `https://apiv3.directd.com.br/api/RegistrationDataBrazil?CPF=${cpf}&TOKEN=${token}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return {
        status: "erro",
        message: "Falha ao conectar à API externa.",
      };
    }

    const data = await response.json();

    // Se a API não retornar dados válidos
    if (!data || Object.keys(data).length === 0) {
      return {
        status: "erro",
        message: "Nenhum dado encontrado para este CPF.",
      };
    }

    // 🔍 Formatar resposta limpa
    const resultado = {
      status: "sucesso",
      api: "Center Apis Consulta Free",
      fonte: "DirectD API",
      informacoes_cadastrais: {
        nome: data.Name || null,
        sobrenome: data.Surname || null,
        nascimento: data["Date of Birth"] || null,
        genero: data.Gender || null,
        idade: data.Age || null,
        cpf: data.CPF || cpf,
        mae: data["Name of Mother"] || null,
      },
      contato: {
        telefones: data.Phones || [],
        enderecos: data.Addresses || [],
        emails: data.Emails || [],
      },
      financeiro: {
        faixa_salarial: data["Salary Range"] || null,
      },
      creditos: {
        criador: "derxankvs",
        github: "https://github.com/derxankvs",
        telegram: "https://t.me/centerconsultaapis7",
      },
    };

    return resultado;
  } catch (error) {
    console.error("Erro ao consultar CPF2:", error);
    return {
      status: "erro",
      message: "Erro interno no servidor.",
    };
  }
}