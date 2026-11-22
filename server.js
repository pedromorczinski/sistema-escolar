
const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Meu Web Service está funcionando!");
});

app.get("/api/usuarios", (req, res) => {
    res.json([
        { id: 1, nome: "João" },
        { id: 2, nome: "Maria" }
    ]);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
