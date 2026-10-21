const { exec } = require('child_process');

module.exports = {
    name: "syssnapshot",
    description: "Mengambil laporan snapshot performa sistem dan hardware secara mendalam",
    run: async (sock, m, from) => {
        const waiting = await sock.sendMessage(from, { text: '🔍 Mengambil snapshot kernel dan hardware sistem...' }, { quoted: m });

        // Menjalankan perintah linux untuk mengambil data load, disk, dan memory
        exec("uptime && free -h && df -h / | tail -n 1", async (err, stdout) => {
            if (err) {
                return await sock.sendMessage(from, { text: '❌ Gagal membaca snapshot sistem.', edit: waiting.key });
            }

            const report = `🛡️ *EKSKLUSIF SYSTEM SNAPSHOT* 🛡️\n` +
                           `──────────────────────────────\n` +
                           `💻 *Kernel & Load Metrics:*\n\`\`\`${stdout.trim()}\`\`\`\n\n` +
                           `⚡ *Status:* _Clean, Secure, and Optimized for UserLAnd_`;

            await sock.sendMessage(from, { text: report }, { edit: waiting.key });
        });
    }
};
