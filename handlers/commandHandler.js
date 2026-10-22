import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = new Map();

// Fungsi untuk memuat plugin secara otomatis rekursif
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

// Eksekutor perintah
export async function executeCommand(commandName, context) {
    if (commands.size === 0) await loadPlugins();
    
    const cmd = commands.get(commandName);
    if (!cmd) return;

    try {
        await cmd.execute(context);
    } catch (err) {
        console.error(`[ERROR PLUGIN ${commandName}]:`, err);
        await context.sock.sendMessage(context.sender, { text: 'Terjadi kesalahan saat menjalankan perintah.' });
    }
}
