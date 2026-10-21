const { exec } = require('child_process');

module.exports = {
    name: "speedtest",
    description: "Mengecek kecepatan jaringan internet server UserLAnd",
    run: async (sock, m, from) => {
        const waitingMsg = await sock.sendMessage(from, { text: '🔄 Menguji kecepatan koneksi jaringan server, mohon tunggu...' }, { quoted: m });

        exec('ping -c 3 8.8.8.8', async (error, stdout) => {
            let resultText = `🌐 *STATUS JARINGAN SERVER*\n\n`;
            if (error) {
                resultText += `❌ Gagal melakukan tes jaringan.`;
            } else {
                resultText += `✅ Koneksi stabil ke Google DNS (8.8.8.8)\n\`\`\`${stdout.trim()}\`\`\``;
            }

            await sock.sendMessage(from, { text: resultText }, { edit: waitingMsg.key });
        });
    }
};
