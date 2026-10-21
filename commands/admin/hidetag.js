module.exports = {
    name: "hidetag",
    description: "Tag semua member grup secara tersembunyi",
    run: async (sock, m, from, args) => {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '⚠️ Perintah ini hanya dapat digunakan di dalam Grup!' }, { quoted: m });
        }

        const pesan = args.join(' ') || 'Pemberitahuan!';
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(from, { 
            text: pesan, 
            mentions: participants 
        }, { quoted: m });
    }
};
