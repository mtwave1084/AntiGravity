/**
 * Check for foreign key violations in the database
 */
const Database = require('better-sqlite3');
const db = new Database('banana.db');

// Enable foreign keys for this check
db.pragma('foreign_keys = ON');

console.log('Checking for foreign key violations...\n');

let violationsFound = false;

// Check ApiKey table
console.log('=== ApiKey -> User ===');
const apiKeyViolations = db.prepare(`
  SELECT ak.id, ak.userId 
  FROM ApiKey ak 
  LEFT JOIN User u ON ak.userId = u.id 
  WHERE u.id IS NULL
`).all();
if (apiKeyViolations.length > 0) {
    console.log('❌ Violations found:', JSON.stringify(apiKeyViolations, null, 2));
    violationsFound = true;
} else {
    console.log('✅ No violations');
}

// Check Preset table
console.log('\n=== Preset -> User ===');
const presetViolations = db.prepare(`
  SELECT p.id, p.userId 
  FROM Preset p 
  LEFT JOIN User u ON p.userId = u.id 
  WHERE u.id IS NULL
`).all();
if (presetViolations.length > 0) {
    console.log('❌ Violations found:', JSON.stringify(presetViolations, null, 2));
    violationsFound = true;
} else {
    console.log('✅ No violations');
}

// Check GenerationJob table
console.log('\n=== GenerationJob -> User ===');
const jobUserViolations = db.prepare(`
  SELECT gj.id, gj.userId 
  FROM GenerationJob gj 
  LEFT JOIN User u ON gj.userId = u.id 
  WHERE u.id IS NULL
`).all();
if (jobUserViolations.length > 0) {
    console.log('❌ Violations found:', JSON.stringify(jobUserViolations, null, 2));
    violationsFound = true;
} else {
    console.log('✅ No violations');
}

// Check Image table
console.log('\n=== Image -> GenerationJob ===');
const imageViolations = db.prepare(`
  SELECT i.id, i.jobId 
  FROM Image i 
  LEFT JOIN GenerationJob gj ON i.jobId = gj.id 
  WHERE gj.id IS NULL
`).all();
if (imageViolations.length > 0) {
    console.log('❌ Violations found:', JSON.stringify(imageViolations, null, 2));
    violationsFound = true;
} else {
    console.log('✅ No violations');
}

// Check DiagramJob table
console.log('\n=== DiagramJob -> User ===');
const diagramJobViolations = db.prepare(`
  SELECT dj.id, dj.userId 
  FROM DiagramJob dj 
  LEFT JOIN User u ON dj.userId = u.id 
  WHERE u.id IS NULL
`).all();
if (diagramJobViolations.length > 0) {
    console.log('❌ Violations found:', JSON.stringify(diagramJobViolations, null, 2));
    violationsFound = true;
} else {
    console.log('✅ No violations');
}

// Check DiagramImage table
console.log('\n=== DiagramImage -> DiagramJob ===');
const diagramImageViolations = db.prepare(`
  SELECT di.id, di.diagramJobId 
  FROM DiagramImage di 
  LEFT JOIN DiagramJob dj ON di.diagramJobId = dj.id 
  WHERE dj.id IS NULL
`).all();
if (diagramImageViolations.length > 0) {
    console.log('❌ Violations found:', JSON.stringify(diagramImageViolations, null, 2));
    violationsFound = true;
} else {
    console.log('✅ No violations');
}

db.close();

console.log('\n' + '='.repeat(50));
if (violationsFound) {
    console.log('❌ Foreign key violations detected!');
    process.exit(1);
} else {
    console.log('✅ All foreign key constraints are valid!');
    process.exit(0);
}
