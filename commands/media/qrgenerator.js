module.exports = {
    name: "qrcode",
    description: "Membuat QR Code dari teks atau tautan",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        const text = args.join(' ');
        if (!text) {
            return await sock.sendMessage(from, { text: `⚠️ Masukkan teks atau link yang ingin dibuat QR Code.\nContoh: *${usedPrefix}qrcode https://google.com*` }, { quoted: m });
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
        
        await sock.sendMessage(from, { 
            image: { url: qrUrl }, 
            caption: `🔲 *QR Code Berhasil Dibuat*\n\n• Isi: ${text}` 
        }, { quoted: m });
    }
};
