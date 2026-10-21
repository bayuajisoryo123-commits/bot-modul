const financeDB = require('../../database/financeDB');

module.exports = {
    name: "smartcatat",
    description: "Catat banyak transaksi otomatis dari satu kalimat teks",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(from, {
                text: `💡 *Fitur Catat Keuangan Otomatis*\n\n` +
                      `Ketikkan rincian transaksi dalam bentuk kalimat bebas.\n\n` +
                      `*Contoh:* \n` +
                      `• ${usedPrefix}smartcatat Beli bensin 20000, jajan bakso 15000, dapat transferan 200000`
            }, { quoted: m });
        }

        const results = financeDB.parseAndSaveFinancialText(from, text);

        if (results.length === 0) {
            return await sock.sendMessage(from, {
                text: `⚠️ Tidak ditemukan nominal angka transaksi yang valid dalam kalimat Anda.`
            }, { quoted: m });
        }

        let reply = `✅ *${results.length} Transaksi Berhasil Dicatat Otomatis*\n\n`;
        results.forEach((item, index) => {
            const simbol = item.type === 'masuk' ? '🟢 (+)' : '🔴 (-)';
            reply += `${index + 1}. ${simbol} Rp ${item.amount.toLocaleString('id-ID')} _(${item.note})_\n`;
        });

        const summary = financeDB.getSummary(from);
        reply += `\n💰 *Sisa Saldo Saat Ini:* Rp ${summary.saldo.toLocaleString('id-ID')}`;

        await sock.sendMessage(from, { text: reply }, { quoted: m });
    }
};
