const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'IMG-Logos');
const jsonPath = path.join(logosDir, 'logos.json');

const validExtensions = ['.webp', '.svg', '.png', '.jpg', '.jpeg'];

fs.readdir(logosDir, (err, files) => {
    if (err) {
        console.error('Error al leer el directorio IMG-Logos:', err);
        return;
    }

    // Filtrar archivos y priorizar WebP sobre PNG/JPG para evitar duplicados
    const filesByName = new Map();
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (!validExtensions.includes(ext)) return;
        const nameWithoutExt = path.basename(file, ext);
        if (!filesByName.has(nameWithoutExt)) {
            filesByName.set(nameWithoutExt, file);
        } else {
            const existingExt = path.extname(filesByName.get(nameWithoutExt)).toLowerCase();
            if (ext === '.webp' && existingExt !== '.webp') {
                filesByName.set(nameWithoutExt, file);
            }
        }
    });

    const imageFiles = Array.from(filesByName.values())
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    fs.writeFile(jsonPath, JSON.stringify(imageFiles, null, 2), err => {
        if (err) {
            console.error('Error al actualizar logos.json:', err);
        } else {
            console.log(`\x1b[32m[Logos Auto-Sync]\x1b[0m ✅ logos.json actualizado exitosamente con ${imageFiles.length} imágenes optimizadas:`);
            console.log(imageFiles);
        }
    });
});
