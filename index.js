import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // 1. Tanyakan nomor HP terlebih dahulu SEBELUM membuat koneksi socket
    const phoneNumber = await question('Masukkan nomor WhatsApp Anda (Contoh: 628123456789): \n');
    if (!phoneNumber) {
        console.log('Nomor tidak boleh kosong!');
        process.exit(0);
    }

    console.log('\n[INFO] Menghubungkan ke server WhatsApp...');

    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    // Simpan kredensial
    sock.ev.on('creds.update', saveCreds);

    // 2. Tangani koneksi dan minta pairing code begitu socket terbuka
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus, mencoba menghubungkan ulang...', shouldReconnect);
            if (shouldReconnect) {
                // Jika terputus, kita jalankan ulang tapi pastikan nomor tidak ditanya ulang jika sudah ada sesi
                startBot();
            }
        } else if (connection === 'open') {
            console.log('[INFO] Bot WhatsApp berhasil terhubung ke server!');
            rl.close();

            // Jika belum terdaftar, minta pairing code sekarang secara aman
            if (!sock.authState.creds.registered) {
                try {
                    console.log('[INFO] Meminta Kode Pairing...');
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Jeda agar stabil
                    
                    const code = await sock.requestPairingCode(phoneNumber.trim());
                    console.log(`\n========================================`);
                    console.log(`> KODE PAIRING ANDA: ${code}`);
                    console.log(`========================================\n`);
                    console.log(`Masukkan kode ini di aplikasi WhatsApp Anda (Perangkat Tertaut -> Tautkan Perangkat -> Tautkan dengan nomor telepon saja).`);
                } catch (error) {
                    console.error("Gagal mendapatkan pairing code:", error);
                }
            }
        }
    });

    // Contoh merespon pesan masuk
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const messageContent = m.message.conversation || m.message.extendedTextMessage?.text;
        const sender = m.key.remoteJid;

        console.log(`Pesan dari ${sender}: ${messageContent}`);

        if (messageContent && messageContent.toLowerCase() === 'halo') {
            await sock.sendMessage(sender, { text: 'Halo! Bot WhatsApp modular Anda aktif.' });
        }
    });
}

startBot();
