const config = require('../../config');

module.exports = {
    name: "invoice",
    description: "Membuat nota tagihan profesional untuk transaksi klien",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        if (args.length < 2) {
            return await sock.sendMessage(from, { 
                text: `💼 *FORMAT PEMBUATAN INVOICE*\n\n` +
                      `Gunakan format:\n*${usedPrefix}invoice [Nama Klien] | [Nama Produk/Jasa] | [Nominal]*\n\n` +
                      `*Contoh:* \n` +
                      `• ${usedPrefix}invoice Budi Santoso | Jasa Setup Bot WhatsApp | 150000` 
            }, { quoted: m });
        }

        const fullText = args.join(" ");
        const parts = fullText.split('|').map(item => item.trim());

        if (parts.length < 3) {
            return await sock.sendMessage(from, { text: '⚠️ Format salah! Pastikan menggunakan pemisah garis tegak (|).' }, { quoted: m });
        }

        const namaKlien = parts[0];
        const namaProduk = parts[1];
        const nominal = parseInt(parts[2].replace(/[^0-9]/g, ''));

        if (isNaN(nominal)) {
            return await sock.sendMessage(from, { text: '⚠️ Nominal harga harus berupa angka yang valid!' }, { quoted: m });
        }

        const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const kodeInvoice = `INV/${Math.floor(100000 + Math.random() * 900000)}`;

        let invoiceText = `🧾 *NOTA INVOICE RESMI* 🧾\n` +
                          `──────────────────\n` +
                          `• *No. Invoice:* ${kodeInvoice}\n` +
                          `• *Tanggal:* ${tanggal}\n` +
                          `• *Kepada:* ${namaKlien}\n` +
                          `──────────────────\n` +
                          `📦 *Rincian Pesanan:*\n` +
                          `• ${namaProduk}\n` +
                          `• *Total Tagihan:* *Rp ${nominal.toLocaleString('id-ID')}*\n` +
                          `──────────────────\n` +
                          `💳 *Metode Pembayaran:*\n` +
                          `• Transfer Bank / E-Wallet\n` +
                          `• Konfirmasi dengan mengirim bukti transfer.\n\n` +
                          `_Terima kasih atas kepercayaan Anda!_`;

        await sock.sendMessage(from, { text: invoiceText }, { quoted: m });
    }
};
