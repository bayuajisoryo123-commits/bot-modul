const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { handleMessage } = require('./handler');

global.commandsMap = new Map();

// Helper untuk membaca input nomor HP dari terminal
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

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
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"] // Browser identity agar pairing code lancar
    });

    sock.ev.on('creds.update', saveCreds);

    // Fitur Pairing Code jika belum terautentikasi
    if (!sock.authState.creds.registered) {
        let phoneNumber = await question('\n📱 Masukkan nomor WhatsApp bot Anda (contoh: 6281234567890): ');
        phoneNumber = phoneNumber.replace(/[^0-9]/g, ''); // Bersihkan dari spasi/karakter lain

        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n🔑 KODE PAIRING WHATSAPP ANDA: \x1b[32m${code}\x1b[0m\n`);
            console.log('Masukkan kode di atas pada WhatsApp: Perangkat Tertaut > Tautkan dengan Nomor Telepon.\n');
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

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
