module.exports = {
    name: "totag",
    description: "Broadcast pesan yang di-reply ke seluruh anggota grup",
    run: async (sock, m, from, args) => {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '⚠️ Perintah khusus Grup!' }, { quoted: m });
        }

        // Cek apakah user mereply sebuah pesan
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const customText = args.join(' ');

        if (!quoted && !customText) {
            return await sock.sendMessage(from, { text: '⚠️ Silakan reply sebuah pesan atau ketik teks yang ingin disebarkan ke semua member!' }, { quoted: m });
        }

        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);

        let broadcastText = customText || 'Pesan Broadcast Admin:';

        if (quoted) {
            // Ambil teks dari pesan yang di-reply jika ada
            const quotedType = Object.keys(quoted)[0];
            const quotedContent = quoted.conversation || quoted.extendedTextMessage?.text || '[Media/Pesan Lain]';
            broadcastText = `${customText}\n\n💬 *Pesan:* "${quotedContent}"`;
        }

        let text = `📢 *BROADCAST KE SELURUH MEMBER*\n\n`;
        text = text + `${broadcastText}\n\n`;
        participants.forEach(p => {
            text = text + `@${p.id.split('@')[0]} `;
        });

        await sock.sendMessage(from, { text: text, mentions: mentions }, { quoted: m });
    }
};
