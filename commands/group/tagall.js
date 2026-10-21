module.exports = {
    name: "tagall",
    description: "Menyebut/mention seluruh anggota grup beserta pesan",
    run: async (sock, m, from, args) => {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '⚠️ Perintah khusus Grup!' }, { quoted: m });
        }

        const pesan = args.join(' ') || 'Tidak ada pesan pengumuman.';
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;

        let text = `📢 *PENGUMUMAN GRUP*\n`;
        text = text + `💬 *Pesan:* ${pesan}\n\n`;
        text = text + `👥 *Total Anggota:* ${participants.length} Orang\n\n`;

        participants.forEach((member, i) => {
            text = text + `${i + 1}. @${member.id.split('@')[0]}\n`;
        });

        const mentions = participants.map(p => p.id);

        await sock.sendMessage(from, { text: text, mentions: mentions }, { quoted: m });
    }
};
