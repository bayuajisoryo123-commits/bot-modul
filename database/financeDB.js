const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'finance_data.json');

// Pastikan file database ada
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ transactions: [] }, null, 2));
}

function loadDB() {
    try {
        const data = fs.readFileSync(dbPath);
        return JSON.parse(data);
    } catch {
        return { transactions: [] };
    }
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Menambahkan transaksi tunggal
function addTransaction(userId, type, amount, note) {
    const db = loadDB();
    const newTx = {
        id: Date.now().toString(36),
        userId,
        type: type.toLowerCase(), // 'masuk' atau 'keluar'
        amount: Number(amount),
        note: note || '-',
        date: new Date().toISOString()
    };
    db.transactions.push(newTx);
    saveDB(db);
    return newTx;
}

// Analisis teks alami (Multi-item parser)
function parseAndSaveFinancialText(userId, text) {
    const db = loadDB();
    const lines = text.split(/,|\n|dan/i);
    const added = [];

    // Keyword pencocokan
    const inKeywords = ['masuk', 'dapat', 'dapatan', 'gaji', 'transfer', 'terima', 'pemasukan', 'proyek'];
    const outKeywords = ['keluar', 'beli', 'bayar', 'jajan', 'makan', 'minum', 'bensin', 'pengeluaran', 'pulsa'];

    for (let line of lines) {
        const numMatch = line.match(/(\d+[\d\.]*)/);
        if (!numMatch) continue;

        let rawNum = numMatch[1].replace(/\./g, '');
        let amount = parseInt(rawNum, 10);
        if (isNaN(amount) || amount <= 0) continue;

        let type = 'keluar'; // Default
        const lowerLine = line.toLowerCase();

        if (inKeywords.some(k => lowerLine.includes(k))) {
            type = 'masuk';
        } else if (outKeywords.some(k => lowerLine.includes(k))) {
            type = 'keluar';
        }

        // Ambil keterangan teks
        let note = line.replace(numMatch[0], '').replace(/(beli|bayar|jajan|dapat|masuk|keluar|rp)/gi, '').trim();
        if (!note) note = 'Transaksi otomatis';

        const tx = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
            userId,
            type,
            amount,
            note,
            date: new Date().toISOString()
        };

        db.transactions.push(tx);
        added.push(tx);
    }

    saveDB(db);
    return added;
}

// Mendapatkan ringkasan saldo & transaksi
function getSummary(userId) {
    const db = loadDB();
    const userTxs = db.transactions.filter(t => t.userId === userId);

    let totalMasuk = 0;
    let totalKeluar = 0;

    userTxs.forEach(t => {
        if (t.type === 'masuk') totalMasuk += t.amount;
        if (t.type === 'keluar') totalKeluar += t.amount;
    });

    return {
        totalMasuk,
        totalKeluar,
        saldo: totalMasuk - totalKeluar,
        count: userTxs.length,
        history: userTxs.slice(-5).reverse() // 5 transaksi terakhir
    };
}

// Reset data
function resetUserDB(userId) {
    const db = loadDB();
    db.transactions = db.transactions.filter(t => t.userId !== userId);
    saveDB(db);
}

module.exports = {
    addTransaction,
    parseAndSaveFinancialText,
    getSummary,
    resetUserDB
};
