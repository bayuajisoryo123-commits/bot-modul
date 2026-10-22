import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import readline from 'readline';
import { handleMessage } from './handlers/messageHandler.js';
import config from './config.js';

// Fungsi untuk membaca input terminal (jika sewaktu-waktu dibutuhkan)
const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => { rl.close(); resolve(ans); }));
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        // Menggunakan browser desktop agar lebih stabil
        browser: Browsers.macOS("Desktop")
    });

    // Jika belum terhubung, minta pairing code via nomor HP
    if (!sock.authState.creds.registered) {
        // MASUKKAN NOMOR WHATSAPP ANDA DI SINI (Tanpa +, contoh: 628123456789)
        const phoneNumber = "6281217364460"; 
        
        // Beri jeda sejenak agar socket siap
        await = new Promise(resolve => setTimeout(resolve, 3000));
        
        let code = await sock.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(`\n=========================================`);
        console.log(`> KODE PAIRING WHATSAPP ANDA: ${code}`);
        console.log(`=========================================\n`);
    }

    // Simpan kredensial saat diperbarui
    sock.ev.on('creds.update', saveCreds);

    // Penanganan koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus, menghubungkan ulang:', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log(`[INFO] Bot berhasil terhubung ke WhatsApp!`);
        }
    });

    // Listener pesan masuk
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const mek = messages[0];
        if (!mek.message || mek.key.fromMe) return;
        
        await handleMessage(sock, mek);
    });
}

startBot();
