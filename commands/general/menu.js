const config = require('../../config');

module.exports = {
    name: "menu",
    description: "Menampilkan daftar seluruh perintah",
    run: async (sock, m, from, args, commandsMap, usedPrefix) => {
        let menuText = `✨ *${config.botName}* ✨\n\n`;

        // Kelompokkan command berdasarkan folder kategori
        const categories = {};
        commandsMap.forEach((cmd) => {
            const catName = (cmd.category || 'LAINNYA').toUpperCase();
            if (!categories[catName]) categories[catName] = [];
            categories[catName].push(cmd);
        });

        for (const [category, cmds] of Object.entries(categories)) {
            menuText += `📂 *KATEGORI ${category}*\n`;
            cmds.forEach(cmd => {
                menuText += ` • ${usedPrefix}${cmd.name} _(${cmd.description})_\n`;
            });
            menuText += `\n`;
        }

        menuText += `_Prefix aktif: ${config.prefixes.join(' ')}_`;

        await sock.sendMessage(from, { text: menuText.trim() }, { quoted: m });
    }
};
