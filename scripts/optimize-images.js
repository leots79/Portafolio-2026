const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directorio raíz del proyecto
const rootDir = path.join(__dirname, '..');

// Lista específica de imágenes actualmente en uso en index.html
const targetImages = [
    // Logos
    { file: 'IMG-Logos/Arenea.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/ColegioAmericano.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/Conetl.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/Dentai.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/Enlace.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/O-Mega.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/Papelerama.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/ToroLogistics.png', maxWidth: 200, quality: 85, isLogo: true },
    { file: 'IMG-Logos/Vitofarma.png', maxWidth: 200, quality: 85, isLogo: true },

    // Perfil y Proyectos
    { file: 'IMG-Proyectos/IdentidadVisual/Perfil.jpeg', maxWidth: 800, quality: 82 },
    { file: 'IMG-Proyectos/Proyectossss/Conetl.jpg', maxWidth: 1200, quality: 80 },
    { file: 'IMG-Proyectos/Estrategia/00-Estrategia-Templete.jpg', maxWidth: 1200, quality: 80 },
    { file: 'IMG-Proyectos/Proyectossss/SOEN/Soen-Concierto (2 of 25).jpg', maxWidth: 1200, quality: 80 },
    { file: 'IMG-Proyectos/Arenea.jpg', maxWidth: 1200, quality: 80 },
    { file: 'IMG-Proyectos/ColegioAmericano.jpg', maxWidth: 1200, quality: 80 },
    { file: 'IMG-Proyectos/Proyectossss/Conciertos.jpg', maxWidth: 1200, quality: 80 },

    // Iconos de software
    { file: 'iconos/PremierePro.png', maxWidth: 128, quality: 90 },
    { file: 'iconos/DavinciResolve.png', maxWidth: 128, quality: 90 },

    // Posters de videos (Reels)
    { file: 'Videos/web/posters/01-DiaCivico-Misiones.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/01-NeonFest.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/01-Vertical-Videos.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/02-Action.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/02-FiestaMx.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/03-Saludo_4.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/04-ActoAbridor.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/10-12-Cristobal.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/AUDIO-AE-READY-Propuesta_caribeextraordinario_template-VERTICAL.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/Premiados_Arte_Logos.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/Reel-Inicio.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/Reel-Semana_01_Jrz.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/Reel-Semana_02_Jrz.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/Tilox_v001.jpg', maxWidth: 540, quality: 80 },
    { file: 'Videos/web/posters/Ubicacion.jpg', maxWidth: 540, quality: 80 }
];

async function optimize() {
    console.log('🚀 Iniciando optimización de imágenes con Sharp...\n');

    let totalOriginalBytes = 0;
    let totalOptimizedBytes = 0;

    for (const item of targetImages) {
        const inputPath = path.join(rootDir, item.file);

        if (!fs.existsSync(inputPath)) {
            console.warn(`⚠️ Archivo no encontrado: ${item.file}`);
            continue;
        }

        const originalStats = fs.statSync(inputPath);
        totalOriginalBytes += originalStats.size;

        // Nombre de salida .webp
        const ext = path.extname(inputPath);
        const outputPath = inputPath.replace(ext, '.webp');

        try {
            let pipeline = sharp(inputPath);
            const metadata = await pipeline.metadata();

            // Redimensionar solo si la imagen excede maxWidth
            if (metadata.width && metadata.width > item.maxWidth) {
                pipeline = pipeline.resize({
                    width: item.maxWidth,
                    withoutEnlargement: true
                });
            }

            // Convertir a WebP
            const buffer = await pipeline
                .webp({
                    quality: item.quality,
                    effort: 6
                })
                .toBuffer();

            // Guardar archivo optimizado
            fs.writeFileSync(outputPath, buffer);

            const optimizedStats = fs.statSync(outputPath);
            totalOptimizedBytes += optimizedStats.size;

            const reduction = (((originalStats.size - optimizedStats.size) / originalStats.size) * 100).toFixed(1);
            console.log(`✅ ${item.file}`);
            console.log(`   Original: ${(originalStats.size / 1024).toFixed(1)} KB ➜ WebP: ${(optimizedStats.size / 1024).toFixed(1)} KB (-${reduction}%)\n`);
        } catch (err) {
            console.error(`❌ Error al procesar ${item.file}:`, err.message);
        }
    }

    const totalReduction = (((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1);
    console.log('----------------------------------------------------');
    console.log(`🎉 Resumen Total:`);
    console.log(`   Peso Original:  ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Peso Optimizado: ${(totalOptimizedBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Ahorro Global:   -${totalReduction}%`);
    console.log('----------------------------------------------------\n');
}

optimize();
