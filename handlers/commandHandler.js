import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = new Map();

// Load plugin secara otomatis
export async function loadPlugins() {
    commands.clear();
    const pluginsDir = path.join(__dirname, '../plugins');

    function readDirRecursive(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                readDirRecursive(fullPath);
            } else if (file.endsWith('.js')) {
                import(`file://${fullPath}`).then((plugin) => {
                    if (plugin.default && plugin.default.command) {
                        commands.set(plugin.default.command, plugin.default);
                    }
                }).catch(err => console.error(`Gagal memuat plugin ${file}:`, err));
            }
        }
    }

    if (fs.existsSync(pluginsDir)) {
        readDirRecursive(pluginsDir);
        console.log('[INFO] Modul plugin berhasil dimuat.');
    }
}

// Eksekutor perintah dengan Pengecekan Hak Akses
export async function executeCommand(commandName, context) {
    if (commands.size === 0) await loadPlugins();
    
    const cmd = commands.get(commandName);
    if (!cmd) return;

    const { sender, sock, mek } = context;

    // 🔒 PENGECEKAN KHUSUS OWNER / ADMIN BOT
    if (cmd.ownerOnly) {
        const isOwner = config.ownerNumbers.includes(sender);
        if (!isOwner) {
            return await sock.sendMessage(sender, { 
                text: '❌ *Akses Ditolak!* Perintah ini hanya dapat digunakan oleh Admin/Owner Bot.' 
            }, { quoted: mek });
        }
    }

    try {
        await cmd.execute(context);
    } catch (err) {
        console.error(`[ERROR PLUGIN ${commandName}]:`, err);
        await context.sock.sendMessage(sender, { text: 'Terjadi kesalahan saat menjalankan perintah.' });
    }
}
