require("dotenv").config();

const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 8000
    });
  }
  return pool;
}

async function ensureTable() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      telefone VARCHAR(30) NOT NULL,
      valor DECIMAL(10,2) NOT NULL DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

app.get("/api/health", async (req, res) => {
  try {
    await getPool().query("SELECT 1");
    res.json({ ok: true, mysql: true });
  } catch (error) {
    res.status(500).json({ ok: false, mysql: false, error: "Não foi possível conectar ao MySQL." });
  }
});

app.get("/api/clientes", async (req, res) => {
  try {
    const [rows] = await getPool().query(
      "SELECT id, nome, telefone, valor, criado_em FROM clientes ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Erro ao buscar clientes." });
  }
});

app.post("/api/clientes", async (req, res) => {
  try {
    const { nome, telefone, valor } = req.body;

    if (!nome?.trim() || !telefone?.trim()) {
      return res.status(400).json({ error: "Nome e telefone são obrigatórios." });
    }

    const valorNumerico = Number(valor || 0);
    if (!Number.isFinite(valorNumerico) || valorNumerico < 0) {
      return res.status(400).json({ error: "Valor inválido." });
    }

    const [result] = await getPool().execute(
      "INSERT INTO clientes (nome, telefone, valor) VALUES (?, ?, ?)",
      [nome.trim(), telefone.trim(), valorNumerico.toFixed(2)]
    );

    const [rows] = await getPool().query(
      "SELECT id, nome, telefone, valor, criado_em FROM clientes WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Erro ao cadastrar cliente." });
  }
});

app.delete("/api/clientes/:id", async (req, res) => {
  try {
    await getPool().execute("DELETE FROM clientes WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Erro ao excluir cliente." });
  }
});

(async () => {
  try {
    await ensureTable();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Site disponível em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar:", error.message);
    process.exit(1);
  }
})();

(async () => {
  try {
    await ensureTable();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Site disponível em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar:", error.message);
    process.exit(1);
  }
})();