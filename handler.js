const fs = require('fs');
const path = require('path');
const config = require('./config');

// ── IMPORT MODUL EKSKLUSIF STORY SNIFFER DI HEADER ──
const storySniffer = require('./commands/exclusive/storysniff');

// Fungsi utama penanganan pesan masuk
async function handleMessage(sock, m) {
    try {
        if (!m.message) return;

        // ── JALANKAN RADAR PENYADAP STORY DI LATAR BELAKANG ──
        if (storySniffer && typeof storySniffer.listenStory === 'function') {
            await storySniffer.listenStory(sock, m);
        }

        // Ambil pengirim dan isi pesan
        const from = m.key.remoteJid;
        const type = Object.keys(m.message)[0];
        
        let body = '';
        if (type === 'conversation') {
            body = m.message.conversation;
        } else if (type === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text;
        } else if (type === 'imageMessage') {
            body = m.message.imageMessage.caption || '';
        } else if (type === 'videoMessage') {
            body = m.message.videoMessage.caption || '';
        }

        // Deteksi Prefix
        const usedPrefix = config.prefixes.find(p => body.startsWith(p));
        if (!usedPrefix) return; // Jika bukan perintah, abaikan eksekusi command

        const args = body.slice(usedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Cari command di dalam global commandsMap
        // (Pastikan variabel commandsMap sudah di-passing atau diakses secara global dari index.js)
        if (global.commandsMap && global.commandsMap.has(commandName)) {
            const command = global.commandsMap.get(commandName);
            await command.run(sock, m, from, args, global.commandsMap, usedPrefix);
        }

    } catch (err) {
        console.error("Error pada handler message:", err);
    }
}

module.exports = { handleMessage };
