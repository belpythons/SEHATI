/**
 * SEHATI (Sistem Edukasi Holistik dan Deteksi Stunting Terintegrasi)
 * Automated Mermaid Diagram Exporter (SVG & PNG)
 * 
 * Script ini membaca seluruh file `.mmd` dalam folder `diagrams/`
 * dan merendernya menjadi file vektor `.svg` dan raster `.png`
 * beresolusi tinggi menggunakan endpoint Kroki Mermaid POST.
 * 
 * Fitur:
 * - Dukungan Retry otomatis (3x) jika server sibuk / rate limited
 * - Parameter `--force` untuk menimpa semua file, atau lewati jika sudah ada
 * 
 * Penggunaan:
 *   node scripts/export-diagrams.js          # Ekspor yang belum ada / rusak
 *   node scripts/export-diagrams.js --force  # Paksa ekspor ulang semua
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DIAGRAMS_DIR = path.join(__dirname, '..', 'diagrams');
const FORCE_OVERWRITE = process.argv.includes('--force');

const DIAGRAM_FILES = [
  'erd.mmd',
  'system-architecture.mmd',
  'flowchart-activity.mmd',
  'deployment-infrastructure.mmd'
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function postDiagramOnce(format, code) {
  return new Promise((resolve, reject) => {
    const url = `https://kroki.io/mermaid/${format}`;
    const payload = Buffer.from(code, 'utf-8');

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': payload.length
      },
      timeout: 35000
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return reject(new Error(`Redirect ke ${res.headers.location}`));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${body.toString('utf-8').slice(0, 150)}`));
        }
        resolve(body);
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout 35s saat merender ${format}`));
    });

    req.write(payload);
    req.end();
  });
}

async function postDiagramWithRetry(format, code, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await postDiagramOnce(format, code);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await sleep(2000 * attempt);
    }
  }
}

async function exportDiagram(filename) {
  const baseName = filename.replace(/\.mmd$/, '');
  const mmdPath = path.join(DIAGRAMS_DIR, filename);

  if (!fs.existsSync(mmdPath)) {
    console.error(`❌ File ${filename} tidak ditemukan di direktori diagrams!`);
    return false;
  }

  const svgTarget = path.join(DIAGRAMS_DIR, `${baseName}.svg`);
  const pngTarget = path.join(DIAGRAMS_DIR, `${baseName}.png`);

  const hasSvg = fs.existsSync(svgTarget) && fs.statSync(svgTarget).size > 1000;
  const hasPng = fs.existsSync(pngTarget) && fs.statSync(pngTarget).size > 1000;

  if (!FORCE_OVERWRITE && hasSvg && hasPng) {
    const svgSize = (fs.statSync(svgTarget).size / 1024).toFixed(1);
    const pngSize = (fs.statSync(pngTarget).size / 1024).toFixed(1);
    console.log(`⏩ [TERSEDIA] ${filename} -> ${baseName}.svg (${svgSize} KB), ${baseName}.png (${pngSize} KB)`);
    return true;
  }

  const code = fs.readFileSync(mmdPath, 'utf-8');

  try {
    process.stdout.write(`⏳ Memproses ${filename}... `);

    // 1. Ekspor SVG
    const svgBuffer = await postDiagramWithRetry('svg', code);
    fs.writeFileSync(svgTarget, svgBuffer);

    // 2. Ekspor PNG
    const pngBuffer = await postDiagramWithRetry('png', code);
    fs.writeFileSync(pngTarget, pngBuffer);

    console.log(`✅ [OK] -> ${baseName}.svg (${(svgBuffer.length / 1024).toFixed(1)} KB), ${baseName}.png (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (err) {
    console.log(`❌ [GAGAL] Error saat mengekspor ${filename}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=====================================================================');
  console.log('🚀 SEHATI Diagram Exporter: Mengonversi Mermaid (.mmd) ke SVG & PNG');
  console.log('=====================================================================');
  console.log(`📁 Direktori Target: ${DIAGRAMS_DIR}`);
  console.log(`⚙️  Mode Force: ${FORCE_OVERWRITE ? 'AKTIF (Menimpa Semua)' : 'HEMAT (Lewati yang Valid)'}\n`);

  let successCount = 0;
  for (const file of DIAGRAM_FILES) {
    const success = await exportDiagram(file);
    if (success) successCount++;
  }

  console.log('\n=====================================================================');
  console.log(`🎉 Selesai: ${successCount} dari ${DIAGRAM_FILES.length} diagram siap digunakan!`);
  console.log('=====================================================================');
}

main().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
