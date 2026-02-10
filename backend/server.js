import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
app.use(helmet());
app.use(morgan("dev"));

// liberar o site chamar a API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function normalizePlate(v = "") {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}
function isValidPlate(p) {
  const antiga = /^[A-Z]{3}[0-9]{4}$/;
  const mercosul = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;
  return antiga.test(p) || mercosul.test(p);
}

// DEMO (simulado)
function mockResponse(placa) {
  return {
    placa,
    veiculo: { marca: "FIAT", modelo: "MOBI LIKE", ano: 2022, uf: "CE" },
    situacao: "OK (DEMO)",
    restricoes: [
      { tipo: "Administrativa", status: "Nenhuma (DEMO)" },
      { tipo: "Judicial", status: "Nenhuma (DEMO)" },
      { tipo: "Roubo/Furto", status: "Não consta (DEMO)" },
      { tipo: "Gravame/Alienação", status: "Não consta (DEMO)" }
    ],
    multas: {
      total: 2,
      valor_total: 487.32,
      itens: [
        { data: "2025-08-10", descricao: "Excesso de velocidade", valor: 293.47, status: "Em aberto" },
        { data: "2025-11-22", descricao: "Estacionamento proibido", valor: 193.85, status: "Paga" }
      ]
    },
    fonte: "Simulado — para real precisa API autorizada"
  };
}

app.get("/api/consulta", (req, res) => {
  const placa = normalizePlate(req.query.placa || "");
  if (!isValidPlate(placa)) return res.status(400).json({ error: "Placa inválida" });
  return res.json(mockResponse(placa));
});

app.get("/", (req, res) => {
  res.type("text").send("Backend OK. Use /api/consulta?placa=ABC1D23");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API rodando na porta", PORT));

