export default {
    command: 'restart',
    description: 'Restart proses bot secara langsung',
    category: 'owner',
    ownerOnly: true, // 👈 Khusus Admin
    async execute({ sock, sender, mek }) {
        await sock.sendMessage(sender, { text: '🔄 Memulai ulang bot...' }, { quoted: mek });
        process.exit(0); // PM2 atau Pterodactyl akan otomatis restart proses bot
    }
};
