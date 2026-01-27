const Database = require('better-sqlite3');
const db = new Database('banana.db');

console.log('Starting DiagramJob schema fix...');

try {
    // PRAGMA foreign_keys cannot be changed inside a transaction.
    db.pragma('foreign_keys = OFF');
    console.log('Foreign keys turned OFF.');

    db.transaction(() => {
        // 1. Create the new table with the correct schema
        db.exec(`
            CREATE TABLE DiagramJob_new (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                structureType TEXT NOT NULL,
                styleType TEXT NOT NULL,
                title TEXT,
                blocks TEXT NOT NULL,
                wireframeImageId TEXT,
                finalImageId TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                errorMessage TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES User(id)
            )
        `);
        console.log('Temporary table DiagramJob_new created.');

        // 2. Migrate data
        db.exec('INSERT INTO DiagramJob_new SELECT * FROM DiagramJob');
        console.log('Data migrated.');

        // 3. Drop DiagramImage since it points to DiagramJob (re-create it later)
        // Actually, PRAGMA foreign_keys = OFF should allow dropping DiagramJob even if DiagramImage points to it.
        // If it still fails, we might need to recreate DiagramImage too.

        db.exec('DROP TABLE DiagramJob');
        console.log('Old DiagramJob table dropped.');

        db.exec('ALTER TABLE DiagramJob_new RENAME TO DiagramJob');
        console.log('Table renamed.');

        db.exec('CREATE INDEX IF NOT EXISTS idx_diagramjob_userid ON DiagramJob(userId)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_diagramjob_status ON DiagramJob(status)');
        console.log('Indexes recreated.');
    })();

    db.pragma('foreign_keys = ON');
    console.log('Foreign keys turned ON.');
    console.log('✅ DiagramJob schema fixed successfully.');

    // Final verification
    const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='DiagramJob'").get();
    console.log('\nNew DiagramJob Schema:');
    console.log(schema.sql);

} catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
} finally {
    db.close();
}

