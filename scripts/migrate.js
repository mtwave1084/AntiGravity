const Database = require('better-sqlite3');
const db = new Database('banana.db');

console.log('Running migrations...');

db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ApiKey (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    provider TEXT NOT NULL,
    encryptedKey TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id),
    UNIQUE(userId, provider)
  );

  CREATE TABLE IF NOT EXISTS Preset (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    tags TEXT,
    provider TEXT NOT NULL,
    taskType TEXT NOT NULL,
    aspectRatio TEXT,
    outputResolution TEXT,
    numOutputs INTEGER DEFAULT 1,
    seed INTEGER,
    prompt TEXT NOT NULL,
    negativePrompt TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
  );

  CREATE TABLE IF NOT EXISTS GenerationJob (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    presetId TEXT,
    provider TEXT NOT NULL,
    taskType TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negativePrompt TEXT,
    aspectRatio TEXT,
    outputResolution TEXT,
    numOutputs INTEGER NOT NULL,
    seed INTEGER,
    status TEXT NOT NULL, -- "pending" | "success" | "error"
    errorMessage TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id),
    FOREIGN KEY (presetId) REFERENCES Preset(id)
  );

  CREATE TABLE IF NOT EXISTS Image (
    id TEXT PRIMARY KEY,
    jobId TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    mimeType TEXT NOT NULL,
    dataBase64 TEXT,
    url TEXT,
    label TEXT,
    favorite BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES GenerationJob(id)
  );
`);

console.log('Migrations completed successfully.');
