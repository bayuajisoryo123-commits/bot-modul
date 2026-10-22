export default {
    command: 'bc',
    description: 'Kirim pesan broadcast ke chat tertentu (Khusus Owner)',
    category: 'owner',
    ownerOnly: true, // 👈 Flag batas akses khusus owner/admin
    async execute({ sock, sender, args, mek }) {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(sender, { 
                text: '⚠️ Harap masukkan pesan yang ingin di-broadcast.\n\nContoh: `.bc Halo semua!`' 
            }, { quoted: mek });
        }

        await sock.sendMessage(sender, { 
            text: `📢 *BROADCAST PROCESS*\n\nPesan:\n"${text}"\n\n_Pesan berhasil dikirim oleh Admin._` 
        }, { quoted: mek });
    }
};
