 const express = require("express");
const cors = require("cors");
const pool = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "Web Service do Sistema Escolar funcionando!"
    });
});

// Criar tabela caso ainda não exista
async function prepararBanco() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS alunos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(150) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            idade INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Cadastrar aluno
app.post("/api/alunos", async (req, res) => {
    try {
        const { nome, email, idade } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email são obrigatórios."
            });
        }

        const resultado = await pool.query(
            `INSERT INTO alunos (nome, email, idade)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nome, email, idade ?? null]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        if (erro.code === "23505") {
            return res.status(409).json({
                erro: "Este email já está cadastrado."
            });
        }

        res.status(500).json({
            erro: "Erro ao cadastrar aluno."
        });
    }
});

// Consultar todos os alunos
app.get("/api/alunos", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM alunos ORDER BY id"
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar alunos."
        });
    }
});

// Consultar um aluno pelo ID
app.get("/api/alunos/:id", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM alunos WHERE id = $1",
            [req.params.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Aluno não encontrado."
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao consultar aluno."
        });
    }
});

// Atualizar aluno
app.put("/api/alunos/:id", async (req, res) => {
    try {
        const { nome, email, idade } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email são obrigatórios."
            });
        }

        const resultado = await pool.query(
            `UPDATE alunos
             SET nome = $1, email = $2, idade = $3
             WHERE id = $4
             RETURNING *`,
            [nome, email, idade ?? null, req.params.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Aluno não encontrado."
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao atualizar aluno."
        });
    }
});

// Excluir aluno
app.delete("/api/alunos/:id", async (req, res) => {
    try {
        const resultado = await pool.query(
            "DELETE FROM alunos WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Aluno não encontrado."
            });
        }

        res.json({
            mensagem: "Aluno excluído com sucesso."
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao excluir aluno."
        });
    }
});

const PORT = process.env.PORT || 3000;

prepararBanco()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((erro) => {
        console.error("Erro ao iniciar o banco:", erro);
        process.exit(1);
    });