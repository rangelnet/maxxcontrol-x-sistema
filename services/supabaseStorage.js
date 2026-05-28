const supabase = require('../config/supabase');
const path = require('path');

// Usaremos Date.now() + random para gerar nome unico caso o uuid não esteja no package.json, 
// para não correr risco de falhar se não tiver uuid instalado.
const generateUniqueName = (originalname) => {
    const ext = path.extname(originalname);
    const rand = Math.round(Math.random() * 1E9);
    return `${Date.now()}-${rand}${ext}`;
};

/**
 * Faz o upload de um arquivo (buffer) para o Supabase Storage e retorna a URL pública.
 * @param {Object} file Objeto de arquivo do multer (req.file)
 * @param {String} folder Nome da sub-pasta no bucket (ex: 'tv-categories')
 * @returns {Promise<String>} URL pública gerada
 */
const uploadToSupabase = async (file, folder) => {
    if (!file || !file.buffer) return null;

    const fileName = `${folder}/${generateUniqueName(file.originalname)}`;

    const { data, error } = await supabase.storage
        .from('painel-uploads')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        console.error(`Erro ao fazer upload para ${folder}:`, error);
        throw new Error('Falha no upload da imagem para a nuvem.');
    }

    const { data: publicData } = supabase.storage
        .from('painel-uploads')
        .getPublicUrl(fileName);

    return publicData.publicUrl;
};

module.exports = { uploadToSupabase };
