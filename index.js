import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import { handleMessage } from './handlers/messageHandler.js';
import config from './config.js';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true,
        browser: ["Professional Bot", "Safari", "3.0.0"]
    });

    // Simpan kredensial saat diperbarui
    sock.ev.on('creds.update', saveCreds);

    // Penanganan koneksi dan rekoneksi otomatis
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus karena:', lastDisconnect?.error, ', Menghubungkan ulang:', shouldReconnect);
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
