module.exports = {
    name: "saldo",
    description: "Cek total saldo dan ringkasan",
    run: async (sock, m, from) => {
        const teks = `📊 *RINGKASAN SALDO*\n\n` +
                     `• Total Pemasukan: Rp 0\n` +
                     `• Total Pengeluaran: Rp 0\n` +
                     `• Sisa Saldo: Rp 0`;

        await sock.sendMessage(from, { text: teks }, { quoted: m });
    }
};
