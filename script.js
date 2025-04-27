let selectedEmojis = []; // Emojis seleccionados por el usuario

// Lista de carpetas que contienen los emojis
const emojiFolders = [
    "grupo_1",
    "grupo_2",
    "grupo_3",
    "grupo_4",
    "grupo_5",
    "grupo_6"
];

// Variable global para almacenar todos los emojis disponibles
let allEmojis = [];

// Obtener archivos de imágenes desde cada grupo
Promise.all(
    emojiFolders.map(folder =>
        fetch(`/${folder}`)
            .then(response => response.json())
            .then(imageFiles => {
                // Agregar emojis de esta carpeta al listado global
                allEmojis = allEmojis.concat(
                    imageFiles.map(file => ({ folder, file }))
                );
            })
            .catch(err => console.error(`Error obteniendo imágenes de ${folder}:`, err))
    )
).then(() => {
    // Una vez que todos los emojis se han cargado, renderízalos
    renderEmojis(allEmojis);
});

// Renderizar emojis en el contenedor
function renderEmojis(emojis) {
    const emojiContainer = document.getElementById("emoji-container");
    emojiContainer.innerHTML = ""; // Limpia los emojis previos
    emojis.forEach(emoji => {
        const emojiDiv = document.createElement("div");
        emojiDiv.classList.add("emoji");
        emojiDiv.innerHTML = `<img src="${emoji.folder}/${emoji.file}" alt="emoji" />`;
        emojiDiv.addEventListener("click", () => toggleEmojiSelection(emoji, emojiDiv));
        emojiContainer.appendChild(emojiDiv);
    });
}

// Alternar la selección de un emoji
function toggleEmojiSelection(emoji, element) {
    const index = selectedEmojis.findIndex(
        e => e.folder === emoji.folder && e.file === emoji.file
    );
    if (index === -1) {
        selectedEmojis.push(emoji);
        element.classList.add("selected");
    } else {
        selectedEmojis.splice(index, 1);
        element.classList.remove("selected");
    }
    updateSelectionBar();
}

// Actualizar la barra de selección
function updateSelectionBar() {
    const selectionCount = document.getElementById("selection-count");
    const selectedEmojisContainer = document.getElementById("selected-emojis");
    selectionCount.innerText = `${selectedEmojis.length} EMOJIS`;
    selectedEmojisContainer.innerHTML = selectedEmojis
        .map(e => `<img src="${e.folder}/${e.file}" alt="emoji" />`)
        .join("");
}

// Manejar la funcionalidad de búsqueda
document.getElementById("search-bar").addEventListener("input", event => {
    const searchText = event.target.value.toLowerCase(); // Obtener el texto de búsqueda
    const filteredEmojis = allEmojis.filter(emoji =>
        emoji.file.toLowerCase().includes(searchText)
    );
    renderEmojis(filteredEmojis); // Renderizar los emojis filtrados
});

// Mostrar el panel de descarga
document.getElementById("download-button").addEventListener("click", () => {
    const downloadPanel = document.getElementById("download-panel");
    const downloadList = document.getElementById("download-list");
    document.body.classList.add("blur"); // Desenfocar la parte principal
    downloadPanel.classList.add("open"); // Abrir el panel
    downloadList.innerHTML = selectedEmojis
        .map(
            e => `
            <li>
                <img src="${e.folder}/${e.file}" alt="emoji" />
                <span>${e.file}</span>
                <button onclick="downloadEmoji('${e.folder}', '${e.file}')">Download</button>
            </li>
        `
        )
        .join("");
});

// Cerrar el panel
document.getElementById("close-panel").addEventListener("click", () => {
    document.body.classList.remove("blur");
    document.getElementById("download-panel").classList.remove("open");
});

// Descargar un emoji individual
function downloadEmoji(folder, file) {
    const a = document.createElement("a");
    a.href = `${folder}/${file}`;
    a.download = file;
    a.click();
}

// Descargar todos los emojis como .zip
document.getElementById("download-all").addEventListener("click", () => {
    if (selectedEmojis.length === 0) {
        alert("No hay emojis seleccionados para descargar.");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder("TusEmojisBoness"); // Carpeta dentro del archivo .zip

    // Agregar cada emoji al archivo .zip
    const emojiPromises = selectedEmojis.map(emoji => {
        return fetch(`${emoji.folder}/${emoji.file}`)
            .then(response => response.blob())
            .then(blob => {
                folder.file(emoji.file, blob);
            });
    });

    Promise.all(emojiPromises).then(() => {
        zip.generateAsync({ type: "blob" }).then(content => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(content);
            a.download = "TusEmojisBoness.zip"; // Archivo descargable
            a.click();
        });
    });
});

// Limpiar todos los emojis seleccionados
document.getElementById("clear-all").addEventListener("click", () => {
    selectedEmojis = []; // Vaciar la lista de emojis seleccionados
    updateSelectionBar(); // Actualizar la barra de selección
    document.getElementById("download-list").innerHTML = ""; // Limpiar la lista del panel

    // Quitar la clase "selected" de todos los emojis en la lista principal
    document.querySelectorAll(".emoji.selected").forEach(emoji => {
        emoji.classList.remove("selected");
    });
});