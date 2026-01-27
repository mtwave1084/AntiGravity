/**
 * Debug script to check DiagramJob data and foreign key relationships
 */
const Database = require('better-sqlite3');
const db = new Database('banana.db');

console.log('\n=== Foreign Keys Status ===');
const fkStatus = db.prepare('PRAGMA foreign_keys').get();
console.log('Foreign keys enabled:', fkStatus);

console.log('\n=== Recent DiagramJob Records ===');
const jobs = db.prepare('SELECT id, userId, status, createdAt FROM DiagramJob ORDER BY createdAt DESC LIMIT 5').all();
console.log(JSON.stringify(jobs, null, 2));

console.log('\n=== DiagramImage Records ===');
const images = db.prepare('SELECT id, diagramJobId, imageType, createdAt FROM DiagramImage ORDER BY createdAt DESC LIMIT 5').all();
console.log(JSON.stringify(images, null, 2));

console.log('\n=== Checking for orphaned DiagramImages (no matching DiagramJob) ===');
const orphaned = db.prepare(`
  SELECT di.id, di.diagramJobId, di.imageType 
  FROM DiagramImage di 
  LEFT JOIN DiagramJob dj ON di.diagramJobId = dj.id 
  WHERE dj.id IS NULL
`).all();
console.log(orphaned.length > 0 ? JSON.stringify(orphaned, null, 2) : 'No orphaned records found');

console.log('\n=== User Table Sample ===');
const users = db.prepare('SELECT id, email FROM User LIMIT 3').all();
console.log(JSON.stringify(users, null, 2));

db.close();
console.log('\nDebug completed.');
