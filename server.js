const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la raíz
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Ruta para obtener imágenes (opcional, para cargar dinámicamente)
app.get("/images", (req, res) => {
    const fs = require("fs");
    const imagesPath = path.join(__dirname, "images");
    fs.readdir(imagesPath, (err, files) => {
        if (err) {
            return res.status(500).send("Error leyendo la carpeta de imágenes");
        }
        res.json(files);
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});