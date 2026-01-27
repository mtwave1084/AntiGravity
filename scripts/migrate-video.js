/**
 * Database Migration for Video Generation Mode
 * 動画生成モード用DBマイグレーション
 * 
 * Run with: node scripts/migrate-video.js
 */

const Database = require('better-sqlite3');
const db = new Database('banana.db');

console.log('Running video generation migrations...');

// Create VideoJob table
db.exec(`
  CREATE TABLE IF NOT EXISTS VideoJob (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negativePrompt TEXT,
    aspectRatio TEXT DEFAULT '16:9',
    resolution TEXT DEFAULT '720p',
    durationSeconds INTEGER DEFAULT 8,
    startFrameData TEXT,
    endFrameData TEXT,
    referenceImagesData TEXT,
    operationName TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    errorMessage TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
  );

  CREATE TABLE IF NOT EXISTS Video (
    id TEXT PRIMARY KEY,
    jobId TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    dataBase64 TEXT NOT NULL,
    durationSeconds INTEGER,
    confirmed BOOLEAN DEFAULT 0,
    favorite BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES VideoJob(id)
  );
`);

console.log('✅ VideoJob table created (if not exists)');
console.log('✅ Video table created (if not exists)');

// Create indexes for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_videojob_userid ON VideoJob(userId);
  CREATE INDEX IF NOT EXISTS idx_videojob_status ON VideoJob(status);
  CREATE INDEX IF NOT EXISTS idx_video_confirmed ON Video(confirmed);
`);

console.log('✅ Indexes created');

console.log('Video generation migrations completed successfully.');
