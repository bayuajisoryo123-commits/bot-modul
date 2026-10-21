const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "tovn",
    description: "Mengubah audio/MP3 yang di-reply menjadi Voice Note WhatsApp",
    run: async (sock, m, from) => {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || (!quoted.audioMessage && !quoted.videoMessage)) {
            return await sock.sendMessage(from, { text: '⚠️ Silakan reply file audio/MP3 atau video, lalu ketik perintah ini!' }, { quoted: m });
        }

        const waiting = await sock.sendMessage(from, { text: '🔄 Sedang mengonversi media menjadi Voice Note...' }, { quoted: m });
        
        try {
            // Unduh media yang di-reply
            const mediaStream = await sock.downloadAndSaveMediaMessage(quoted, 'temp_audio');
            const outputAudio = path.join(__dirname, '../../temp_vn.opus');

            // Konversi menggunakan FFmpeg ke format opus (standar VN WhatsApp)
            exec(`ffmpeg -i "${mediaStream}" -c:a libopus -b:a 64k -vbr on -vn "${outputAudio}" -y`, async (err) => {
                if (err) {
                    await sock.sendMessage(from, { text: '❌ Gagal mengonversi audio.' }, { quoted: m });
                    if (fs.existsSync(mediaStream)) fs.unlinkSync(mediaStream);
                    return;
                }

                await sock.sendMessage(from, { 
                    audio: { url: outputAudio }, 
                    mimetype: 'audio/ogg; codecs=opus', 
                    ptt: true 
                }, { quoted: m });

                // Bersihkan file temporary
                if (fs.existsSync(mediaStream)) fs.unlinkSync(mediaStream);
                if (fs.existsSync(outputAudio)) fs.unlinkSync(outputAudio);
                await sock.sendMessage(from, { delete: waiting.key });
            });
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '❌ Terjadi kesalahan saat memproses media.' }, { quoted: m });
        }
    }
};
