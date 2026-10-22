export default {
    command: 'ping',
    description: 'Cek kecepatan respon bot',
    category: 'main',
    async execute({ sock, sender, mek }) {
        const start = Date.now();
        const sent = await sock.sendMessage(sender, { text: 'Menghitung kecepatan...' }, { quoted: mek });
        const latency = Date.now() - start;

        await sock.sendMessage(sender, { 
            text: `Pong! 🏓\nKecepatan Respon: *${latency}ms*` 
        }, { quoted: sent });
    }
};
