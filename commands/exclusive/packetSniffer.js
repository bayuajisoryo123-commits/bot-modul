const { exec } = require('child_process');

module.exports = {
    name: "netstat",
    description: "Menganalisis statistik trafik data masuk dan keluar pada interface jaringan",
    run: async (sock, m, from) => {
        const waiting = await sock.sendMessage(from, { text: '📊 Menganalisis statistik paket data jaringan...' }, { quoted: m });

        // Membaca statistik jaringan dari kernel /proc/net/dev
        exec("cat /proc/net/dev", async (err, stdout) => {
            if (err) {
                return await sock.sendMessage(from, { text: '❌ Gagal membaca statistik jaringan.', edit: waiting.key });
            }

            const report = `🌐 *NETWORK INTERFACE TRAFFIC ANALYZER* 🌐\n` +
                           `──────────────────────────────\n` +
                           `📊 *Bytes & Packets Statistics (Kernel Level):*\n\`\`\`${stdout.trim()}\`\`\``;

            await sock.sendMessage(from, { text: report }, { edit: waiting.key });
        });
    }
};
