const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    name: "tourl",
    description: "Mengubah media/gambar/audio menjadi link URL publik",
    run: async (sock, m, from) => {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
        const mime = Object.keys(quoted)[0];

        if (!mime || (!mime.includes('image') && !mime.includes('video') && !mime.includes('audio') && !mime.includes('document'))) {
            return await sock.sendMessage(from, { text: '⚠️ Kirim atau reply gambar, video, audio, atau dokumen yang ingin dijadikan URL!' }, { quoted: m });
        }

        const waiting = await sock.sendMessage(from, { text: '📤 Mengunggah media ke server...' }, { quoted: m });

        try {
            const mediaPath = await sock.downloadAndSaveMediaMessage(quoted, 'temp_upload');
            const fileStream = fs.createReadStream(mediaPath);
            const form = new FormData();
            form.append('file', fileStream);

            // Menggunakan layanan temp file gratis (Telegraph/Catbox)
            const response = await axios.post('https://itzpire.com/tools/upload', form, {
                headers: { ...form.getHeaders() }
            });

            if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);

            const fileUrl = response.data?.result?.url || response.data?.url;
            if (!fileUrl) {
                return await sock.sendMessage(from, { text: '❌ Gagal mendapatkan URL dari server.', edit: waiting.key });
            }

            await sock.sendMessage(from, { 
                text: `🔗 *LINK URL BERHASIL DIBUAT*\n\n${fileUrl}` 
            }, { edit: waiting.key });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ Terjadi kesalahan saat mengunggah file.', edit: waiting.key });
        }
    }
};
