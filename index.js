const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { handleMessage } = require('./handler');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Diset false jika menggunakan Pairing Code
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.0']
    });

    // Jalankan fitur pairing code jika belum pernah terhubung
    if (!sock.authState.creds.registered) {
        console.log("=== SETUP KONEKSI BOT ===");
        let phoneNumber = await question('Masukkan Nomor WhatsApp Bot (Contoh: 628xxxxxxxxxx): ');
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n👉 KODE PAIRING ANDA: \x1b[32m${code}\x1b[0m\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`Koneksi terputus (code ${statusCode}). Reconnect: ${shouldReconnect}`);
            if (shouldReconnect) {
                startBot();
            } else {
                console.log('Sesi keluar. Hapus folder auth_session lalu jalankan ulang.');
            }
        } else if (connection === 'open') {
            console.log('✅ BOT BERHASIL TERHUBUNG DENGAN WHATSAPP!');
        }
    });

    // Menagkap seluruh pesan masuk (termasuk dari pesan sendiri / fromMe)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const m = messages[0];
        if (!m.message) return;

        await handleMessage(sock, m);
    });
}

startBot();
