module.exports = {
    name: "lisensi",
    description: "Membuat kode lisensi atau serial produk digital unik",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        const pembeli = args.join(" ") || "Customer";
        
        // Membuat string acak unik untuk lisensi
        const randomCode = 'RVN-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        const tanggalExp = new Date();
        tanggalExp.setMonth(tanggalExp.getMonth() + 1); // Masa aktif 1 bulan
        const expStr = tanggalExp.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        let licenseText = `🔐 *KODE LISENSI PRODUK DIGITAL*\n\n` +
                          `• *Untuk Pembeli:* ${pembeli}\n` +
                          `• *Serial Key:* \`${randomCode}\`\n` +
                          `• *Masa Aktif Berlaku:* s/d ${expStr}\n\n` +
                          `⚠️ _Simpan kode ini dengan baik. Lisensi sah untuk 1 perangkat/klien._`;

        await sock.sendMessage(from, { text: licenseText }, { quoted: m });
    }
};
