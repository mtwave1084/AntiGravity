/**
 * Database Migration for Diagram Generation Mode
 * 図解生成モード用DBマイグレーション
 * 
 * Run with: node scripts/migrate-diagram.js
 */

const Database = require('better-sqlite3');
const db = new Database('banana.db');

console.log('Running diagram generation migrations...');

// Create DiagramJob table (new table, no impact on existing data)
db.exec(`
  CREATE TABLE IF NOT EXISTS DiagramJob (
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
  );

  -- Diagram-specific image table to avoid FK conflict with existing Image -> GenerationJob
  CREATE TABLE IF NOT EXISTS DiagramImage (
    id TEXT PRIMARY KEY,
    diagramJobId TEXT NOT NULL,
    imageType TEXT NOT NULL,  -- 'wireframe' or 'final'
    mimeType TEXT NOT NULL,
    dataBase64 TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagramJobId) REFERENCES DiagramJob(id)
  );
`);

console.log('✅ DiagramJob table created (if not exists)');
console.log('✅ DiagramImage table created (if not exists)');

// Create index for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_diagramjob_userid ON DiagramJob(userId);
  CREATE INDEX IF NOT EXISTS idx_diagramjob_status ON DiagramJob(status);
`);

console.log('✅ Indexes created');

console.log('Diagram generation migrations completed successfully.');
