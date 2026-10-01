const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'IMG-Logos');
const jsonPath = path.join(logosDir, 'logos.json');

const validExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

fs.readdir(logosDir, (err, files) => {
    if (err) {
        console.error('Error al leer el directorio IMG-Logos:', err);
        return;
    }

    const imageFiles = files
        .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    fs.writeFile(jsonPath, JSON.stringify(imageFiles, null, 2), err => {
        if (err) {
            console.error('Error al actualizar logos.json:', err);
        } else {
            console.log(`\x1b[32m[Logos Auto-Sync]\x1b[0m ✅ logos.json actualizado exitosamente con ${imageFiles.length} imágenes:`);
            console.log(imageFiles);
        }
    });
});
