const config = require('../../config');
const os = require('os');

module.exports = {
    name: "menu",
    description: "Menampilkan antarmuka menu futuristik & canggih",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        // Waktu & Jam Real-Time
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('id-ID', { 
            weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' 
        });
        const timeFormatted = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });

        // Informasi Sistem / Server
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

        // Total Perintah
        const totalCmds = commandsMap.size;

        // Banner ASCII Cyberpunk Header
        let menuText = `┌───〔 *${config.botName}* 〕───┐\n`;
        menuText += `│ ⚡ *SYSTEM OVERRIDE ONLINE*\n`;
        menuText += `└──────────────────────────────┘\n\n`;

        menuText += `┌─〔 *SYSTEM METRICS* 〕\n`;
        menuText += `│ 📅 *Date:* ${dateFormatted}\n`;
        menuText += `│ ⏰ *Time:* ${timeFormatted} WIB\n`;
        menuText += `│ ⏳ *Uptime:* ${uptimeStr}\n`;
        menuText += `│ 🖥️ *OS Platform:* ${os.platform()} (${os.arch()})\n`;
        menuText += `│ 🗂️ *Total Commands:* ${totalCmds} Modules\n`;
        menuText += `│ 🔑 *Active Prefix:* [ ${config.prefixes.join(" ")} ]\n`;
        menuText += `└──────────────────────────────\n\n`;

        // Ikon Khusus per Kategori Folder
        const categoryIcons = {
            'GENERAL': '🌐',
            'FINANCE': '💳',
            'GROUP': '🛡️',
            'ADVANCED': '⚡',
            'BUSINESS': '💼',
            'MEDIA': '🎬',
            'ADMIN': '👑'
        };

        // Kelompokkan Perintah Berdasarkan Kategori
        const categories = {};
        commandsMap.forEach((cmd) => {
            const catName = (cmd.category || 'OTHER').toUpperCase();
            if (!categories[catName]) categories[catName] = [];
            categories[catName].push(cmd);
        });

        // Menyusun Menu per Kategori secara Futuristik
        for (const [category, cmds] of Object.entries(categories)) {
            const icon = categoryIcons[category] || '📦';
            menuText += `┌─〔 ${icon} *CATEGORY: ${category}* 〕\n`;
            
            cmds.forEach(cmd => {
                menuText += `│ ➢ \`${usedPrefix}${cmd.name}\`\n`;
                if (cmd.description) {
                    menuText += `│    └ _${cmd.description}_\n`;
                }
            });
            
            menuText += `└──────────────────────────────\n\n`;
        }

        menuText += `┌──────────────────────────────┐\n`;
        menuText += `│ 💡 _Ketik \`${usedPrefix}[nama_perintah]\` untuk_ \n│ _menjalankan modul fitur._\n`;
        menuText += `└──────────────────────────────┘`;

        await sock.sendMessage(from, { text: menuText.trim() }, { quoted: m });
    }
};
