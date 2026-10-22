import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { handleMessage } from './handlers/messageHandler.js';
import config from './config.js';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS("Desktop"),
        connectTimeoutMs: 60000, // Perpanjang timeout koneksi
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error instanceof Boom)?.output?.statusCode;
            const errorMessage = lastDisconnect?.error?.message || 'Unknown error';
            
            console.log(`[DISCONNECT] Koneksi terputus. Status Code: ${statusCode}, Pesan: ${errorMessage}`);

            // Cek alasan diskoneksi khusus
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('[INFO] Perangkat telah logout. Hapus folder sessions untuk pairing ulang.');
                process.exit(0);
            }

            // Hubungkan ulang untuk semua error selain logout
            console.log('[INFO] Menghubungkan ulang dalam 3 detik...');
            setTimeout(() => {
                startBot();
            }, 3000);

        } else if (connection === 'open') {
            console.log(`[INFO] Bot berhasil terhubung ke server WebSocket WhatsApp!`);

            if (!sock.authState.creds.registered) {
                // GANTI DENGAN NOMOR ANDA (Tanpa +, contoh: 628123456789)
                const phoneNumber = "6281217364460"; 
                
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                try {
                    let code = await sock.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n=========================================`);
                    console.log(`> KODE PAIRING WHATSAPP ANDA: ${code}`);
                    console.log(`========================================-\n`);
                } catch (err) {
                    console.error('[ERROR] Gagal mendapatkan kode pairing:', err);
                }
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const mek = messages[0];
        if (!mek.message || mek.key.fromMe) return;
        
        await handleMessage(sock, mek);
    });
}

startBot();
