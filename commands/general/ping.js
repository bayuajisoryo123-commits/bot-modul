module.exports = {
    name: "ping",
    description: "Cek kecepatan respon bot",
    run: async (sock, m, from) => {
        const start = Date.now();
        const sentMsg = await sock.sendMessage(from, { text: 'Testing respon...' }, { quoted: m });
        const latency = Date.now() - start;

        await sock.sendMessage(from, { 
            text: `🏓 *Pong!*\nKecepatan Respon: *${latency} ms*` 
        }, { edit: sentMsg.key });
    }
};
