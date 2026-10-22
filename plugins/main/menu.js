import config from '../../config.js';

export default {
    command: 'menu',
    description: 'Menampilkan daftar perintah bot',
    category: 'main',
    async execute({ sock, sender, pushName }) {
        const menuText = `Halo *${pushName}*, berikut adalah daftar menu bot:

📌 *Main Menu*
- ${config.prefix}menu
- ${config.prefix}ping

_Gunakan perintah dengan bijak._`;

        await sock.sendMessage(sender, { text: menuText });
    }
};
