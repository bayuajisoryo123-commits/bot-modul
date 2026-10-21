module.exports = {
    name: "kick",
    description: "Mengeluarkan anggota dari grup",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        // Cek apakah perintah dijalankan di dalam grup
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '⚠️ Perintah ini hanya dapat digunakan di dalam Grup!' }, { quoted: m });
        }

        // Cek apakah bot adalah admin
        const groupMetadata = await sock.groupMetadata(from);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;

        if (!isBotAdmin) {
            return await sock.sendMessage(from, { text: '❌ Bot harus dijadikan Admin terlebih dahulu untuk menggunakan fitur ini!' }, { quoted: m });
        }

        // Target bisa lewat tag, reply pesan, atau nomor
        let target = m.message.extendedTextMessage?.contextInfo?.participant;
        
        if (!target && args.length > 0) {
            target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }

        if (!target) {
            return await sock.sendMessage(from, { 
                text: `⚠️ *Format Salah!*\n\nCara pakai:\n• Reply pesan member yang ingin dikeluarkan lalu ketik: *${usedPrefix}kick*\n• Atau ketik: *${usedPrefix}kick 62812345678xx*` 
            }, { quoted: m });
        }

        try {
            await sock.groupParticipantsUpdate(from, [target], "remove");
            await sock.sendMessage(from, { text: `✅ Berhasil mengeluarkan anggota dari grup.` }, { quoted: m });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: `❌ Gagal mengeluarkan anggota. Pastikan bot adalah admin.` }, { quoted: m });
        }
    }
};
