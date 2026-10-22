const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal'); // Gunakan qrcode-terminal
const { handleMessage } = require('./handler');

global.commandsMap = new Map();

// Fungsi rekursif muat modul
function loadCommands(dir = path.join(__dirname, 'commands')) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            loadCommands(fullPath);
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
    loadCommands();

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) // printQRInTerminal dihapus agar tidak muncul warning
    });

    sock.ev.on('creds.update', saveCreds);

    // Menampilkan QR Code saat membutuhkan autentikasi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 SCAN QR CODE BERIKUT DENGAN WHATSAPP:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus. Mengisi ulang...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
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
