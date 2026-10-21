const config = require('../../config');

module.exports = {
    name: "katalog",
    description: "Menampilkan daftar produk atau jasa yang Anda tawarkan",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        let katalogText = `🛍️ *KATALOG PRODUK & JASA* 🛍️\n` +
                          `_Pilihan layanan profesional siap order:_\n\n` +
                          `1️⃣ *Jasa Script Bot WhatsApp Modular*\n` +
                          `   • Harga: Rp 150.000\n` +
                          `   • Deskripsi: Full source code siap pakai + fitur kustom.\n\n` +
                          `2️⃣ *Setup Server Bot di UserLAnd/VPS*\n` +
                          `   • Harga: Rp 100.000\n` +
                          `   • Deskripsi: Dibantu instalasi sampai bot online 24/7.\n\n` +
                          `3️⃣ *Jasa Otomasi Script Python/Node.js*\n` +
                          `   • Harga: Menyesuaikan\n` +
                          `   • Deskripsi: Sesuai kebutuhan kustom bisnis Anda.\n\n` +
                          `💡 *Cara Order:* Ketik *${usedPrefix}invoice [Nama Anda] | [Nama Layanan] | [Harga]* untuk mencetak tagihan pesanan.`;

        await sock.sendMessage(from, { text: katalogText }, { quoted: m });
    }
};
