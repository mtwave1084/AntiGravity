const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('banana.db');

const output = {
    diagramJobSchema: null,
    diagramImageSchema: null,
    userSchema: null,
    allTables: [],
    foreignKeys: [],
    foreignKeysEnabled: null
};

// Get DiagramJob schema
const diagramJobSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='DiagramJob'").get();
output.diagramJobSchema = diagramJobSchema?.sql || 'Table not found';

// Get DiagramImage schema
const diagramImageSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='DiagramImage'").get();
output.diagramImageSchema = diagramImageSchema?.sql || 'Table not found';

// Get User schema
const userSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='User'").get();
output.userSchema = userSchema?.sql || 'Table not found';

// Get all tables
const allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
output.allTables = allTables.map(t => t.name);

// Get all foreign keys
const foreignKeys = db.prepare(`
  SELECT 
    m.name as table_name,
    p."table" as foreign_table,
    p."from" as from_column,
    p."to" as to_column
  FROM sqlite_master m
  JOIN pragma_foreign_key_list(m.name) p
  WHERE m.type = 'table'
  ORDER BY m.name, p.id
`).all();
output.foreignKeys = foreignKeys;

// Check if foreign keys are enabled
const fkStatus = db.prepare('PRAGMA foreign_keys').get();
output.foreignKeysEnabled = fkStatus;

db.close();

// Write to JSON file
fs.writeFileSync('schema-debug.json', JSON.stringify(output, null, 2), 'utf8');
console.log('Schema information written to schema-debug.json');
