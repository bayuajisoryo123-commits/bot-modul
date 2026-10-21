const financeDB = require('../../database/financeDB');

module.exports = {
    name: "mutasi",
    description: "Melihat laporan riwayat mutasi keuangan",
    run: async (sock, m, from) => {
        const summary = financeDB.getSummary(from);

        if (summary.count === 0) {
            return await sock.sendMessage(from, {
                text: `📊 *BELUM ADA TRANSAKSI*\n\nBelum ada catatan keuangan yang tersimpan.`
            }, { quoted: m });
        }

        let report = `📊 *LAPORAN MUTASI KEUTANGAN*\n\n`;
        report += `🟢 Total Pemasukan : Rp ${summary.totalMasuk.toLocaleString('id-ID')}\n`;
        report += `🔴 Total Pengeluaran: Rp ${summary.totalKeluar.toLocaleString('id-ID')}\n`;
        report += `💵 *SISA SALDO      : Rp ${summary.saldo.toLocaleString('id-ID')}*\n\n`;
        report += `📜 *5 Transaksi Terakhir:*\n`;

        summary.history.forEach((tx, i) => {
            const icon = tx.type === 'masuk' ? '➕' : '➖';
            const dateStr = new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            report += `${i + 1}. [${dateStr}] ${icon} Rp ${tx.amount.toLocaleString('id-ID')} (${tx.note})\n`;
        });

        await sock.sendMessage(from, { text: report }, { quoted: m });
    }
};
