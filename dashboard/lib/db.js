import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'hackeasy.db')

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS saved_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    wis_score INTEGER,
    pain_score INTEGER,
    novelty_score INTEGER,
    feasibility_score INTEGER,
    alignment_score INTEGER,
    category TEXT,
    track TEXT DEFAULT 'software',
    judging TEXT DEFAULT 'judge-judged',
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

export function createUser(email, passwordHash) {
  const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
  try {
    const result = stmt.run(email, passwordHash)
    return { id: result.lastInsertRowid, email }
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      throw new Error('Email already exists')
    }
    throw err
  }
}

export function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email)
}

export function getUserById(id) {
  const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
  return stmt.get(id)
}

export function getSavedIdeas(userId) {
  const stmt = db.prepare('SELECT * FROM saved_ideas WHERE user_id = ? ORDER BY saved_at DESC')
  return stmt.all(userId)
}

export function saveIdea(userId, idea) {
  const stmt = db.prepare(`
    INSERT INTO saved_ideas (user_id, title, description, wis_score, pain_score, novelty_score, feasibility_score, alignment_score, category, track, judging)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    userId,
    idea.title,
    idea.description,
    idea.wis_score || idea.wis || null,
    idea.pain_score || idea.pain || null,
    idea.novelty_score || idea.novelty || null,
    idea.feasibility_score || idea.feasibility || null,
    idea.alignment_score || idea.alignment || null,
    idea.category || '',
    idea.track || 'software',
    idea.judging || 'judge-judged'
  )
  return result.lastInsertRowid
}

export function removeIdea(userId, ideaId) {
  const stmt = db.prepare('DELETE FROM saved_ideas WHERE id = ? AND user_id = ?')
  return stmt.run(ideaId, userId)
}

export function clearAllIdeas(userId) {
  const stmt = db.prepare('DELETE FROM saved_ideas WHERE user_id = ?')
  return stmt.run(userId)
}

export default db