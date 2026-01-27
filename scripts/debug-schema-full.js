const Database = require('better-sqlite3');
const db = new Database('banana.db');

console.log('--- TABLE SCHEMAS ---');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => {
    console.log(`\nTable: ${t.name}`);
    console.log(t.sql);
});

console.log('\n--- FOREIGN KEYS ---');
tables.forEach(t => {
    const fks = db.prepare(`PRAGMA foreign_key_list("${t.name}")`).all();
    if (fks.length > 0) {
        console.log(`\nForeign keys for ${t.name}:`);
        console.log(JSON.stringify(fks, null, 2));
    }
});

console.log('\n--- CHECKING FOR VIOLATIONS ---');
const violations = db.prepare('PRAGMA foreign_key_check').all();
console.log(JSON.stringify(violations, null, 2));

console.log('\n--- PRAGMA STATUS ---');
console.log('foreign_keys:', db.prepare('PRAGMA foreign_keys').get());
console.log('journal_mode:', db.prepare('PRAGMA journal_mode').get());

db.close();
