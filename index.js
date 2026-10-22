const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { handleMessage } = require('./handler');

global.commandsMap = new Map();

// Fungsi rekursif untuk membaca semua file command dari sub-folder
function loadCommands(dir = path.join(__dirname, 'commands')) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            loadCommands(fullPath); // Rekursif ke sub-folder
        } else if (item.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const cmd = require(fullPath);
                if (cmd.name) {
                    global.commandsMap.set(cmd.name, cmd);
                    console.log(`[LOADER] Command loaded: ${cmd.name}`);
                }
            } catch (e) {
                console.error(`[LOADER ERROR] Gagal memuat ${item}:`, e);
            }
        }
    }
}

async function startBot() {
    loadCommands(); // Muat semua perintah saat bot dinyalakan

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ BOT BERHASIL TERHUBUNG DENGAN WHATSAPP!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        await handleMessage(sock, m);
    });
}

startBot();
