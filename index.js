import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // Menyimpan sesi agar tidak perlu pairing ulang kedepannya
    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Matikan QR karena kita pakai Pairing Code
    });

    // Jika belum terdaftar, minta nomor HP untuk memunculkan Pairing Code
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Masukkan nomor WhatsApp Anda (Contoh: 628123456789): \n');
        
        // Beri jeda sebentar agar socket siap
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber.trim());
                console.log(`\n========================================`);
                console.log(`PAIRING CODE ANDA: ${code}`);
                console.log(`========================================\n`);
                console.log(`Masukkan kode ini di aplikasi WhatsApp Anda (Linked Devices -> Link with phone number).`);
            } catch (error) {
                console.error("Gagal mendapatkan pairing code:", error);
            }
        }, 3000);
    }

    // DIPERBAIKI: Menggunakan sock.ev.on, bukan sock.app.on
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus, mencoba menghubungkan ulang...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('Bot WhatsApp berhasil terhubung!');
            rl.close();
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Contoh merespon pesan masuk
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const messageContent = m.message.conversation || m.message.extendedTextMessage?.text;
        const sender = m.key.remoteJid;

        console.log(`Pesan dari ${sender}: ${messageContent}`);

        // Balas pesan otomatis
        if (messageContent && messageContent.toLowerCase() === 'halo') {
            await sock.sendMessage(sender, { text: 'Halo! Bot WhatsApp dengan Pairing Code aktif.' });
        }
    });
}

startBot();
