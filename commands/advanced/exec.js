const { exec } = require('child_process');
const config = require('../../config');

module.exports = {
    name: "exec",
    description: "Menjalankan perintah terminal Linux (Khusus Owner)",
    run: async (sock, m, from, args) => {
        // Validasi pengirim harus Owner
        const sender = m.key.participant || m.key.remoteJid;
        if (!sender.includes(config.ownerNumber.replace('@s.whatsapp.net', ''))) {
            return await sock.sendMessage(from, { text: '❌ Perintah ini khusus untuk Owner bot!' }, { quoted: m });
        }

        const command = args.join(' ');
        if (!command) {
            return await sock.sendMessage(from, { text: '⚠️ Masukkan perintah terminal yang ingin dijalankan.\nContoh: `.exec df -h`' }, { quoted: m });
        }

        exec(command, async (error, stdout, stderr) => {
            let output = '';
            if (error) {
                output += `❌ *ERROR:*\n${error.message}\n`;
            }
            if (stderr) {
                output += `⚠️ *STDERR:*\n${stderr}\n`;
            }
            if (stdout) {
                output += `💻 *STDOUT:*\n${stdout}`;
            }

            if (!output) output = 'Perintah berhasil dieksekusi tanpa output.';

            await sock.sendMessage(from, { text: `\`\`\`${output.trim()}\`\`\`` }, { quoted: m });
        });
    }
};
