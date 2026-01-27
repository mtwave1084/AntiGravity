const Database = require('better-sqlite3');
const db = new Database('banana.db');

console.log('Adding confirmed column to Image table...');

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(Image)").all();
    const hasConfirmed = tableInfo.some(col => col.name === 'confirmed');

    if (!hasConfirmed) {
        db.exec(`
            ALTER TABLE Image ADD COLUMN confirmed BOOLEAN DEFAULT 1;
        `);
        console.log('Added "confirmed" column to Image table.');

        // Set all existing images as confirmed (they were created before this feature)
        db.exec(`UPDATE Image SET confirmed = 1 WHERE confirmed IS NULL;`);
        console.log('Set all existing images as confirmed.');
    } else {
        console.log('Column "confirmed" already exists.');
    }

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
