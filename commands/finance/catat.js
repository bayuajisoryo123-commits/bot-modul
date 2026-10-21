const config = require('../../config');

module.exports = {
    name: "catat",
    description: "Mencatat transaksi keuangan",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        if (args.length < 2) {
            return await sock.sendMessage(from, { 
                text: `❌ *Format Salah!*\n\nContoh penggunaan:\n• ${usedPrefix}catat masuk 50000 Gaji\n• ${usedPrefix}catat keluar 15000 Kopi` 
            }, { quoted: m });
        }

        const tipe = args[0].toLowerCase();
        const nominal = parseInt(args[1]);
        const keterangan = args.slice(2).join(' ') || '-';

        if (isNaN(nominal)) {
            return await sock.sendMessage(from, { text: '⚠️ Nominal harus berupa angka!' }, { quoted: m });
        }

        const responseText = `📝 *CATATAN DITAMBAHKAN*\n\n` +
                             `• Jenis: ${tipe.toUpperCase()}\n` +
                             `• Nominal: Rp ${nominal.toLocaleString('id-ID')}\n` +
                             `• Keterangan: ${keterangan}`;

        await sock.sendMessage(from, { text: responseText }, { quoted: m });
    }
};
