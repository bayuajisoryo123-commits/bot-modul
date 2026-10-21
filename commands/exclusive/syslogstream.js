const { exec } = require('child_process');

module.exports = {
    name: "syslog",
    description: "Menarik catatan live system log dan kernel error terbaru dari Linux",
    run: async (sock, m, from) => {
        const waiting = await sock.sendMessage(from, { text: '📡 Menyadap dan menarik log kernel sistem terbaru...' }, { quoted: m });

        // Mengambil 15 baris log kernel/sistem terakhir
        exec("dmesg | tail -n 15", async (err, stdout) => {
            let logData = stdout.trim();
            if (!logData) {
                // Alternatif jika dmesg dibatasi, ambil log sistem umum
                exec("journalctl -n 15 --no-pager 2>/dev/null || cat /var/log/syslog | tail -n 15", async (err2, stdout2) => {
                    logData = stdout2.trim() || "Tidak dapat mengakses system log pada level hak akses saat ini.";
                    sendOutput(logData);
                });
            } else {
                sendOutput(logData);
            }
        });

        async function sendOutput(data) {
            const report = `🛡️ *EXCLUSIVE SYSTEM LOG STREAM* 🛡️\n` +
                           `──────────────────────────────\n` +
                           `📋 *Kernel Buffer & System Messages:*\n\`\`\`${data}\`\`\``;

            await sock.sendMessage(from, { text: report }, { edit: waiting.key });
        }
    }
};
