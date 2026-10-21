const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = new Map();
const commandPath = path.join(__dirname, 'commands');

// Fungsi rekursif membaca folder & sub-folder
function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)]; // Clear cache saat reload
                const cmd = require(fullPath);
                if (cmd && cmd.name) {
                    const category = path.basename(path.dirname(fullPath));
                    commands.set(cmd.name.toLowerCase(), { ...cmd, category });
                }
            } catch (e) {
                console.error(`Gagal memuat file ${file}:`, e);
            }
        }
    }
}

// Load semua commands saat pertama startup
loadCommands(commandPath);

async function handleMessage(sock, m) {
    try {
        if (!m.message) return;

        // Mendapatkan isi teks dari berbagai tipe pesan
        const messageType = Object.keys(m.message)[0];
        let body = '';

        if (messageType === 'conversation') {
            body = m.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text;
        } else if (messageType === 'imageMessage') {
            body = m.message.imageMessage.caption || '';
        } else if (messageType === 'videoMessage') {
            body = m.message.videoMessage.caption || '';
        }

        if (!body) return;

        // Cek prefix
        const usedPrefix = config.prefixes.find(p => body.startsWith(p));
        if (!usedPrefix) return;

        const from = m.key.remoteJid;
        const args = body.slice(usedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (command) {
            console.log(`[EXEC] Perintah '${commandName}' dari ${from}`);
            await command.run(sock, m, from, args, commands, usedPrefix);
        }
    } catch (err) {
        console.error("Error pada handler pesan:", err);
    }
}

module.exports = { handleMessage };
