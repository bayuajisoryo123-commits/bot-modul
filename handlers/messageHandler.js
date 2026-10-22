import config from '../config.js';
import { executeCommand } from './commandHandler.js';

export async function handleMessage(sock, mek) {
    try {
        const body = mek.message.conversation || 
                     mek.message.extendedTextMessage?.text || 
                     mek.message.imageMessage?.caption || '';

        const isCmd = body.startsWith(config.prefix);
        const command = isCmd ? body.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const sender = mek.key.remoteJid;
        const pushName = mek.pushName || 'User';

        if (isCmd) {
            console.log(`[CMD] Dari: ${pushName} (${sender}) -> Perintah: ${command}`);
            await executeCommand(command, { sock, mek, args, sender, pushName, body });
        }
    } catch (err) {
        console.error('[ERROR MESSAGE HANDLER]:', err);
    }
}
