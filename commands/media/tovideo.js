const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "tovideo",
    description: "Mengubah video pendek menjadi Catatan Video WhatsApp",
    run: async (sock, m, from) => {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !quoted.videoMessage) {
            return await sock.sendMessage(from, { text: '⚠️ Silakan reply video (MP4) berdurasi pendek, lalu ketik perintah ini!' }, { quoted: m });
        }

        const waiting = await sock.sendMessage(from, { text: '🔄 Sedang memproses video menjadi catatan video...' }, { quoted: m });

        try {
            const mediaStream = await sock.downloadAndSaveMediaMessage(quoted, 'temp_vid');
            const outputVid = path.join(__dirname, '../../temp_vnote.mp4');

            // Konversi ukuran ke video kuadrat (aspect ratio 1:1) agar cocok jadi video note
            exec(`ffmpeg -i "${mediaStream}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset ultrafast -c:a aac "${outputVid}" -y`, async (err) => {
                if (err) {
                    await sock.sendMessage(from, { text: '❌ Gagal memproses video note.' }, { quoted: m });
                    if (fs.existsSync(mediaStream)) fs.unlinkSync(mediaStream);
                    return;
                }

                await sock.sendMessage(from, { 
                    video: { url: outputVid }, 
                    mimetype: 'video/mp4',
                    ptt: true // Mengaktifkan mode catatan video bundar
                }, { quoted: m });

                if (fs.existsSync(mediaStream)) fs.unlinkSync(mediaStream);
                if (fs.existsSync(outputVid)) fs.unlinkSync(outputVid);
                await sock.sendMessage(from, { delete: waiting.key });
            });
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '❌ Gagal memproses video.' }, { quoted: m });
        }
    }
};
