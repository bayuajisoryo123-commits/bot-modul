const { exec } = require('child_process');

module.exports = {
    name: "netwatch",
    description: "Memantau koneksi jaringan dan port aktif pada server bot",
    run: async (sock, m, from) => {
        const waiting = await sock.sendMessage(from, { text: '🌐 Menganalisis aktivitas jaringan perangkat...' }, { quoted: m });

        // Menggunakan netstat atau ss untuk melihat koneksi aktif
        exec("netstat -an | grep ESTABLISHED | head -n 10", async (err, stdout) => {
            let netData = stdout.trim();
            if (!netData) {
                // Alternatif jika netstat tidak ada
                exec("ss -t -a | head -n 10", async (err2, stdout2) => {
                    netData = stdout2.trim() || "Tidak ada koneksi aktif yang terekam.";
                    sendResult(netData);
                });
            } else {
                sendResult(netData);
            }
        });

        async function sendResult(data) {
            const resultText = `🌐 *NETWORK INTRUSION & WATCHER* 🌐\n` +
                               `──────────────────────────────\n` +
                               `📡 *Active Established Connections:*\n\`\`\`${data}\`\`\``;

            await sock.sendMessage(from, { text: resultText }, { edit: waiting.key });
        }
    }
};
