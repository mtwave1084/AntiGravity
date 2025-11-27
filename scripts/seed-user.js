const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('banana.db');

const email = 'admin@example.com';
const password = 'password123';
const name = 'Admin';

async function seed() {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = 'user_' + Math.random().toString(36).substr(2, 9);

    try {
        const stmt = db.prepare('INSERT INTO User (id, email, password, name) VALUES (?, ?, ?, ?)');
        stmt.run(id, email, hashedPassword, name);
        console.log(`User created: ${email} / ${password}`);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            console.log('User already exists.');
        } else {
            console.error('Error creating user:', error);
        }
    }
}

seed();
