const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { uploadToSupabase } = require('./supabaseStorage');

function resolveFfmpegBinary() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic) return ffmpegStatic;
  } catch (_) {}
  return 'ffmpeg';
}

function resolveFfprobeBinary() {
  if (process.env.FFPROBE_PATH) return process.env.FFPROBE_PATH;
  try {
    const ffprobeStatic = require('ffprobe-static');
    if (ffprobeStatic && ffprobeStatic.path) return ffprobeStatic.path;
  } catch (_) {}
  return 'ffprobe';
}

const FFMPEG_BIN = resolveFfmpegBinary();
const FFPROBE_BIN = resolveFfprobeBinary();

function runProcess(command, args, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(new Error(`${command} timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', err => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', code => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} exited with ${code}: ${stderr || stdout}`));
      }
    });
  });
}

function safeFileStem(value) {
  return String(value || 'maxx-video')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'maxx-video';
}

async function getVideoDurationSeconds(videoUrl) {
  const result = await runProcess(FFPROBE_BIN, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    videoUrl
  ], Number(process.env.NEXUS_FFPROBE_TIMEOUT_MS || 30000));

  const duration = Number.parseFloat(String(result.stdout || '').trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('Nao foi possivel calcular a duracao do video.');
  }
  return duration;
}

async function captureMiddleFrameToSupabase(videoUrl, options = {}) {
  if (!videoUrl) throw new Error('URL do video ausente para captura de frame.');

  const folder = options.folder || 'nexus-middle-frames';
  const title = options.title || 'maxx-video';
  const durationSeconds = await getVideoDurationSeconds(videoUrl);
  const seekSeconds = Math.max(1, Math.floor(durationSeconds / 2));
  const outputPath = path.join(os.tmpdir(), `maxx-nexus-frame-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`);

  try {
    await runProcess(FFMPEG_BIN, [
      '-y',
      '-ss', String(seekSeconds),
      '-i', videoUrl,
      '-frames:v', '1',
      '-q:v', '3',
      '-vf', 'scale=1280:-2',
      outputPath
    ], Number(process.env.NEXUS_FFMPEG_TIMEOUT_MS || 45000));

    const buffer = await fs.readFile(outputPath);
    if (!buffer || buffer.length < 1024) {
      throw new Error('Frame capturado vazio ou invalido.');
    }

    const publicUrl = await uploadToSupabase({
      originalname: `${safeFileStem(title)}-middle.jpg`,
      mimetype: 'image/jpeg',
      buffer
    }, folder);

    return {
      publicUrl,
      seekSeconds,
      durationSeconds: Math.round(durationSeconds),
      source: 'auto_middle_frame'
    };
  } finally {
    await fs.unlink(outputPath).catch(() => {});
  }
}

module.exports = { captureMiddleFrameToSupabase };
