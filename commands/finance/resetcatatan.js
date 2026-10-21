const financeDB = require('../../database/financeDB');

module.exports = {
    name: "resetcatatan",
    description: "Mereset/menghapus seluruh riwayat data keuangan Anda",
    run: async (sock, m, from) => {
        financeDB.resetUserDB(from);
        await sock.sendMessage(from, {
            text: `🧹 *Data Keuangan Berhasil Direset!*\nSemua riwayat transaksi dan saldo Anda telah dibersihkan.`
        }, { quoted: m });
    }
};
