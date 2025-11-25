import Database from 'better-sqlite3';
import { dev } from '$app/environment';

const db = new Database(dev ? 'dev.db' : 'prod.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    sport TEXT NOT NULL,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS progress_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    meters INTEGER NOT NULL,
    entry_date DATE NOT NULL,
    entry_time TIME,
    entry_timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_progress_entry_date ON progress_entries(entry_date);
`);

// Add password_hash column to existing databases if it doesn't exist
try {
	db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
} catch (e: any) {
	// Column already exists, ignore error
	if (!e.message?.includes('duplicate column')) {
		console.error('Error adding password_hash column:', e);
	}
}

// Add google_id column to existing databases if it doesn't exist
try {
	const tableInfo = db.prepare(`PRAGMA table_info(users)`).all() as Array<{
		cid: number;
		name: string;
		type: string;
		notnull: number;
		dflt_value: any;
		pk: number;
	}>;
	
	const hasGoogleId = tableInfo.some((col) => col.name === 'google_id');
	if (!hasGoogleId) {
		// SQLite doesn't support adding UNIQUE columns directly, so add without constraint first
		db.exec(`ALTER TABLE users ADD COLUMN google_id TEXT`);
		// Create a unique index instead
		try {
			db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL`);
		} catch (e: any) {
			// Index might already exist
			console.warn('Could not create unique index for google_id:', e.message);
		}
	}
} catch (e: any) {
	// Column already exists, ignore error
	if (!e.message?.includes('duplicate column')) {
		console.error('Error adding google_id column:', e);
	}
}

// Migrate user IDs from INTEGER to TEXT if needed
try {
	const tableInfo = db.prepare(`PRAGMA table_info(users)`).all() as Array<{
		cid: number;
		name: string;
		type: string;
		notnull: number;
		dflt_value: any;
		pk: number;
	}>;
	
	const idColumn = tableInfo.find((col) => col.name === 'id');
	if (idColumn && idColumn.type.toUpperCase() === 'INTEGER') {
		console.log('Migrating user IDs from INTEGER to TEXT...');
		
		// Start a transaction for the migration
		db.exec('BEGIN TRANSACTION');
		
		try {
			// Create new users table with TEXT ID
			db.exec(`
				CREATE TABLE users_new (
					id TEXT PRIMARY KEY,
					name TEXT NOT NULL,
					email TEXT UNIQUE NOT NULL,
					sport TEXT NOT NULL,
					password_hash TEXT,
					google_id TEXT,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
			`);
			
			// Copy users, converting INTEGER IDs to TEXT
			const users = db.prepare('SELECT * FROM users').all() as Array<{
				id: number;
				name: string;
				email: string;
				sport: string;
				password_hash: string | null;
				google_id: string | null;
				created_at: string | null;
			}>;
			
			const insertUser = db.prepare(`
				INSERT INTO users_new (id, name, email, sport, password_hash, google_id, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`);
			
			for (const user of users) {
				insertUser.run(
					String(user.id), // Convert INTEGER to TEXT
					user.name,
					user.email,
					user.sport,
					user.password_hash || null,
					user.google_id || null,
					user.created_at || null
				);
			}
			
			// Create new sessions table with TEXT user_id
			db.exec(`
				CREATE TABLE sessions_new (
					id TEXT PRIMARY KEY,
					user_id TEXT NOT NULL,
					expires_at INTEGER NOT NULL,
					FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE
				);
			`);
			
			// Copy sessions, converting INTEGER user_ids to TEXT (if table exists)
			const sessionsTableExists = db.prepare(`
				SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'
			`).get();
			
			if (sessionsTableExists) {
				const sessions = db.prepare('SELECT * FROM sessions').all() as Array<{
					id: string;
					user_id: number;
					expires_at: number;
				}>;
				
				const insertSession = db.prepare(`
					INSERT INTO sessions_new (id, user_id, expires_at)
					VALUES (?, ?, ?)
				`);
				
				for (const session of sessions) {
					insertSession.run(
						session.id,
						String(session.user_id), // Convert INTEGER to TEXT
						session.expires_at
					);
				}
			}
			
			// Create new progress_entries table with TEXT user_id
			db.exec(`
				CREATE TABLE progress_entries_new (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id TEXT NOT NULL,
					meters INTEGER NOT NULL,
					entry_date DATE NOT NULL,
					entry_time TIME,
					entry_timestamp DATETIME NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES users_new(id)
				);
			`);
			
			// Copy progress_entries, converting INTEGER user_ids to TEXT (if table exists)
			const entriesTableExists = db.prepare(`
				SELECT name FROM sqlite_master WHERE type='table' AND name='progress_entries'
			`).get();
			
			if (entriesTableExists) {
				const entries = db.prepare('SELECT * FROM progress_entries').all() as Array<{
					id: number;
					user_id: number;
					meters: number;
					entry_date: string;
					entry_time: string | null;
					entry_timestamp: string;
					created_at: string | null;
				}>;
				
				const insertEntry = db.prepare(`
					INSERT INTO progress_entries_new (id, user_id, meters, entry_date, entry_time, entry_timestamp, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?)
				`);
				
				for (const entry of entries) {
					insertEntry.run(
						entry.id,
						String(entry.user_id), // Convert INTEGER to TEXT
						entry.meters,
						entry.entry_date,
						entry.entry_time || null,
						entry.entry_timestamp,
						entry.created_at || null
					);
				}
			}
			
			// Drop old tables
			db.exec('DROP TABLE IF EXISTS progress_entries');
			db.exec('DROP TABLE IF EXISTS sessions');
			db.exec('DROP TABLE IF EXISTS users');
			
			// Rename new tables
			db.exec('ALTER TABLE users_new RENAME TO users');
			db.exec('ALTER TABLE sessions_new RENAME TO sessions');
			db.exec('ALTER TABLE progress_entries_new RENAME TO progress_entries');
			
			// Recreate indexes
			db.exec(`
				CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
				CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress_entries(user_id);
				CREATE INDEX IF NOT EXISTS idx_progress_entry_date ON progress_entries(entry_date);
				CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
			`);
			
			db.exec('COMMIT');
			console.log('User ID migration completed successfully');
		} catch (e: any) {
			db.exec('ROLLBACK');
			console.error('Error during user ID migration:', e);
			throw e;
		}
	}
} catch (e: any) {
	console.error('Error checking user ID type:', e);
}

// Migrate progress_entries table to support multiple entries per day
try {
	// Check if the old unique constraint exists by looking at the table schema
	const tableSchema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='progress_entries'`).get() as { sql: string } | undefined;
	
	if (tableSchema && tableSchema.sql.includes('UNIQUE(user_id, entry_date)')) {
		// Need to recreate the table without the unique constraint
		console.log('Migrating progress_entries table to remove unique constraint...');
		
		// Create new table without unique constraint
		db.exec(`
			CREATE TABLE IF NOT EXISTS progress_entries_new (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id TEXT NOT NULL,
				meters INTEGER NOT NULL,
				entry_date DATE NOT NULL,
				entry_time TIME,
				entry_timestamp DATETIME NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id)
			);
		`);
		
		// Copy data from old table to new table
		// First, add missing columns to old entries if needed
		try {
			db.exec(`ALTER TABLE progress_entries ADD COLUMN entry_time TIME`);
		} catch (e: any) {
			// Column may already exist
		}
		
		try {
			db.exec(`ALTER TABLE progress_entries ADD COLUMN entry_timestamp DATETIME`);
		} catch (e: any) {
			// Column may already exist
		}
		
		// Update existing entries to have timestamps if they don't
		db.exec(`
			UPDATE progress_entries 
			SET entry_timestamp = entry_date || ' 12:00:00',
			    entry_time = '12:00:00'
			WHERE entry_timestamp IS NULL
		`);
		
		// Copy all data
		db.exec(`
			INSERT INTO progress_entries_new (id, user_id, meters, entry_date, entry_time, entry_timestamp, created_at)
			SELECT id, user_id, meters, entry_date, entry_time, entry_timestamp, created_at
			FROM progress_entries
		`);
		
		// Drop old table
		db.exec(`DROP TABLE progress_entries`);
		
		// Rename new table
		db.exec(`ALTER TABLE progress_entries_new RENAME TO progress_entries`);
		
		// Recreate indexes
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress_entries(user_id);
			CREATE INDEX IF NOT EXISTS idx_progress_entry_date ON progress_entries(entry_date);
		`);
		
		console.log('Migration completed successfully');
	} else {
		// Table doesn't have unique constraint, just ensure columns exist
		const tableInfo = db.prepare(`PRAGMA table_info(progress_entries)`).all() as Array<{
			cid: number;
			name: string;
			type: string;
			notnull: number;
			dflt_value: any;
			pk: number;
		}>;
		
		const hasTimestamp = tableInfo.some((col) => col.name === 'entry_timestamp');
		const hasTime = tableInfo.some((col) => col.name === 'entry_time');
		
		if (!hasTimestamp || !hasTime) {
			// Add new columns
			try {
				db.exec(`ALTER TABLE progress_entries ADD COLUMN entry_time TIME`);
			} catch (e: any) {
				if (!e.message?.includes('duplicate column')) {
					console.error('Error adding entry_time column:', e);
				}
			}
			
			try {
				db.exec(`ALTER TABLE progress_entries ADD COLUMN entry_timestamp DATETIME`);
			} catch (e: any) {
				if (!e.message?.includes('duplicate column')) {
					console.error('Error adding entry_timestamp column:', e);
				}
			}
			
			// Update existing entries to have timestamps
			db.exec(`
				UPDATE progress_entries 
				SET entry_timestamp = entry_date || ' 12:00:00',
				    entry_time = '12:00:00'
				WHERE entry_timestamp IS NULL
			`);
		}
	}
} catch (e: any) {
	console.error('Error migrating progress_entries table:', e);
}

export default db;

