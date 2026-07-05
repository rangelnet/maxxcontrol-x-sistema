const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');
const pool = require('../config/database');

const BUCKET = 'painel-uploads';
const STORAGE_FOLDER = 'tv-categories';
const LOCAL_ICON_DIR = path.join(__dirname, '..', 'public', 'uploads', STORAGE_FOLDER);

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function isRemoteIcon(icon) {
  return /^https?:\/\//i.test(String(icon || '')) || /^data:/i.test(String(icon || ''));
}

function sanitizeStorageName(fileName) {
  return path.basename(String(fileName || '').trim()).replace(/\s+/g, '-');
}

async function uploadIcon(fileName) {
  const cleanName = sanitizeStorageName(fileName);
  const localPath = path.join(LOCAL_ICON_DIR, cleanName);

  if (!fs.existsSync(localPath)) {
    return { ok: false, reason: `Arquivo local não encontrado: ${cleanName}` };
  }

  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(cleanName).toLowerCase();
  const storagePath = `${STORAGE_FOLDER}/${cleanName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: MIME_TYPES[ext] || 'application/octet-stream',
      upsert: true,
    });

  if (error) {
    return { ok: false, reason: error.message || String(error) };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { ok: true, publicUrl: data.publicUrl };
}

async function main() {
  const result = await pool.query(`
    SELECT id, name, icon, icon_type
    FROM tv_categories
    WHERE icon_type = 'image'
      AND icon IS NOT NULL
      AND icon <> ''
    ORDER BY ordem ASC, id ASC
  `);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Encontradas ${result.rows.length} categorias com ícone de imagem.`);

  for (const category of result.rows) {
    if (isRemoteIcon(category.icon)) {
      skipped += 1;
      console.log(`- ${category.name}: já usa URL pública.`);
      continue;
    }

    const upload = await uploadIcon(category.icon);
    if (!upload.ok) {
      failed += 1;
      console.warn(`- ${category.name}: ${upload.reason}`);
      continue;
    }

    await pool.query(
      'UPDATE tv_categories SET icon = $1, updated_at = NOW() WHERE id = $2',
      [upload.publicUrl, category.id]
    );

    updated += 1;
    console.log(`- ${category.name}: migrado para Supabase Storage.`);
  }

  console.log('\nResumo da migração:');
  console.log(`Atualizados: ${updated}`);
  console.log(`Ignorados: ${skipped}`);
  console.log(`Falharam: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Erro na migração dos ícones de TV:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  });
