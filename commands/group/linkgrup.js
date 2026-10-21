module.exports = {
    name: "linkgrup",
    description: "Mendapatkan link tautan undangan grup",
    run: async (sock, m, from) => {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '⚠️ Perintah khusus Grup!' }, { quoted: m });
        }

        try {
            const code = await sock.groupInviteCode(from);
            const link = `https://chat.whatsapp.com/${code}`;
            await sock.sendMessage(from, { text: `🔗 *Link Tautan Undangan Grup:*\n${link}` }, { quoted: m });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Gagal mengambil link. Pastikan bot adalah admin grup.` }, { quoted: m });
        }
    }
};
