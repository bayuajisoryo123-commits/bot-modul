const fs = require('fs');
const path = require('path');

// File database lokal untuk menyimpan arsip story yang tertangkap
const storyDbPath = path.join(__dirname, '../../database/story_logs.json');

// Inisialisasi database jika belum ada
if (!fs.existsSync(path.dirname(storyDbPath))) {
    fs.mkdirSync(path.dirname(storyDbPath), { recursive: true });
}
if (!fs.existsSync(storyDbPath)) {
    fs.writeFileSync(storyDbPath, JSON.stringify({ stories: [] }, null, 2));
}

module.exports = {
    name: "storysniff",
    description: "Melihat daftar status/story member yang tertangkap sistem radar",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        try {
            const rawData = fs.readFileSync(storyDbPath);
            const db = JSON.parse(rawData);

            if (!db.stories || db.stories.length === 0) {
                return await sock.sendMessage(from, { 
                    text: `📡 *STATUS RADAR STORY SNIFFER*\n\nBelum ada story/status member yang tertangkap oleh radar bot saat ini.\n*(Pastikan bot aktif dan memantau siaran status).*` 
                }, { quoted: m });
            }

            let report = `📡 *EXCLUSIVE STORY SNIPER INTEL* 📡\n`;
            report += `_Menampilkan arsip status member terbaru:_\n\n`;

            // Ambil 5 story terakhir yang terekam
            const recentStories = db.stories.slice(-5).reverse();
            recentStories.forEach((st, idx) => {
                report += `${idx + 1}. *Pengirim:* @${st.sender.split('@')[0]}\n`;
                report += `   • *Waktu Dibuat:* ${st.timestamp}\n`;
                report += `   • *Tipe Konten:* ${st.type.toUpperCase()}\n`;
                report += `   • *Keterangan/Teks:* ${st.caption}\n`;
                report += `──────────────────────────────\n`;
            });

            const mentions = recentStories.map(st => st.sender);
            await sock.sendMessage(from, { text: report.trim(), mentions }, { quoted: m });

        } catch (err) {
            console.error("Gagal membaca database story:", err);
            await sock.sendMessage(from, { text: '❌ Terjadi kesalahan saat membaca arsip story.' }, { quoted: m });
        }
    },

    // ── BACKGROUND LISTENER UNTUK MENANGKAP STORY ──
    listenStory: async (sock, m) => {
        try {
            // Memeriksa apakah pesan berasal dari siaran status (status@broadcast)
            if (m.key.remoteJid === 'status@broadcast') {
                const sender = m.key.participant || m.participant || 'Unknown';
                const messageType = Object.keys(m.message)[0];
                
                let caption = '';
                if (messageType === 'imageMessage') {
                    caption = m.message.imageMessage.caption || '[Gambar Status tanpa teks]';
                } else if (messageType === 'videoMessage') {
                    caption = m.message.videoMessage.caption || '[Video Status tanpa teks]';
                } else if (messageType === 'conversation') {
                    caption = m.message.conversation;
                } else if (messageType === 'extendedTextMessage') {
                    caption = m.message.extendedTextMessage.text;
                } else {
                    caption = `[Media tipe: ${messageType}]`;
                }

                // Mendapatkan cap waktu akurat kapan story dibuat
                const messageTimestamp = m.messageTimestamp ? Number(m.messageTimestamp) * 1000 : Date.now();
                const createDate = new Date(messageTimestamp);
                const timeString = createDate.toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'medium'
                });

                // Simpan ke database JSON lokal
                const rawData = fs.readFileSync(storyDbPath);
                const db = JSON.parse(rawData);

                db.stories.push({
                    id: m.key.id,
                    sender: sender,
                    type: messageType,
                    caption: caption,
                    timestamp: timeString,
                    rawTime: messageTimestamp
                });

                // Batasi maksimal 50 arsip terakhir agar efisien
                if (db.stories.length > 50) {
                    db.stories.shift();
                }

                fs.writeFileSync(storyDbPath, JSON.stringify(db, null, 2));
                console.log(`[STORY SNIPER] Tertangkap status baru dari ${sender} pada ${timeString}`);
            }
        } catch (e) {
            console.error("Error pada background listener story:", e);
        }
    }
};
