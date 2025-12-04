import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron'; // Import app from electron
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(app.getPath('userData'), 'agesco_crm.db');

// Seeder function to create an initial admin user if it doesn't exist
async function seedDatabase(db: any) {
  const adminUser = await getUsuarioByEmail(db, 'admin@agesco.com');
  if (!adminUser) {
    console.log('Admin user not found. Seeding initial admin user...');
    await addUsuario(db, {
      name: 'Admin',
      email: 'admin@agesco.com',
      password: 'admin', // The addUsuario function will hash this
      role: 'admin',
      status: 'Activo'
    });
    console.log('Admin user created with email: admin@agesco.com and password: admin');
  }
}

export async function initializeDatabase() {
  // Ensure the directory for the database exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombreCompleto TEXT NOT NULL,
      telefono TEXT,
      estado TEXT,
      compania TEXT,
      estatus TEXT,
      asesorId TEXT NOT NULL,
      ultimaActualizacion TEXT,
      fechaCreacion TEXT
    );

    CREATE TABLE IF NOT EXISTS Agentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      state TEXT,
      company TEXT,
      asesorId TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Avisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId INTEGER,
      note TEXT NOT NULL,
      status TEXT,
      creator TEXT,
      recipient TEXT,
      asesorId TEXT NOT NULL,
      FOREIGN KEY (clientId) REFERENCES Clientes(id)
    );

    CREATE TABLE IF NOT EXISTS Enlaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      asesorId TEXT
    );

    CREATE TABLE IF NOT EXISTS Usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  // --- Schema Migrations ---
  try {
    await db.exec('ALTER TABLE Usuarios ADD COLUMN password TEXT NOT NULL DEFAULT ""');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) console.error('Error altering Usuarios table:', error);
  }
  try {
    await db.exec('ALTER TABLE Clientes ADD COLUMN fechaCreacion TEXT');
  } catch (error) {
    if (!error.message.includes('duplicate column name')) console.error('Error altering Clientes table:', error);
  }

  // Seed the database with the initial admin user if necessary
  await seedDatabase(db);

  console.log('Database initialized and schema verified.');
  return db;
}

// --- Dashboard ---
function getDateCondition(period: 'today' | 'week' | 'month' | 'total'): string {
  switch (period) {
    case 'today':
      return `DATE(fechaCreacion) = DATE('now', 'localtime')`;
    case 'week':
      return `DATE(fechaCreacion) >= DATE('now', 'localtime', '-6 days')`;
    case 'month':
      return `STRFTIME('%Y-%m', fechaCreacion) = STRFTIME('%Y-%m', 'now', 'localtime')`;
    case 'total':
    default:
      return '1=1'; // Always true
  }
}

export async function getDashboardData(db: any, period: 'today' | 'week' | 'month' | 'total') {
  const dateCondition = getDateCondition(period);

  const kpis = await db.get(`
    SELECT
      COUNT(CASE WHEN ${dateCondition} THEN id END) as nuevosClientes,
      COUNT(CASE WHEN estatus = 'Activa' AND ${dateCondition} THEN id END) as polizasActivas,
      COUNT(CASE WHEN estatus = 'GESTION NECESARIA' AND ${dateCondition} THEN id END) as gestionesPendientes
    FROM Clientes;
  `);

  const clientesPorAsesor = await db.all(`
    SELECT u.name as asesorName, COUNT(c.id) as clientCount
    FROM Clientes c
    JOIN Usuarios u ON CAST(c.asesorId AS INTEGER) = u.id OR c.asesorId = u.email
    WHERE ${dateCondition}
    GROUP BY u.id, u.name
    ORDER BY clientCount DESC;
  `);

  const clientesPorEstado = await db.all(`
    SELECT estado, COUNT(id) as clientCount
    FROM Clientes
    WHERE ${dateCondition} AND estado IS NOT NULL AND estado != ''
    GROUP BY estado
    ORDER BY clientCount DESC;
  `);

  return { kpis, clientesPorAsesor, clientesPorEstado };
}


// --- Clientes ---
export async function getClientes(db: any, asesorId?: string) {
  if (asesorId) {
    return db.all('SELECT * FROM Clientes WHERE asesorId = ?', asesorId);
  } else {
    // If no asesorId is provided (for admins), return all clients
    return db.all('SELECT * FROM Clientes');
  }
}

export async function addCliente(db: any, cliente: any) {
  const { nombreCompleto, telefono, estado, compania, estatus, asesorId } = cliente;
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO Clientes (nombreCompleto, telefono, estado, compania, estatus, asesorId, ultimaActualizacion, fechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    nombreCompleto, telefono, estado, compania, estatus, asesorId, now, now
  );
  return result.lastID;
}

export async function updateCliente(db: any, id: number, updates: any) {
  const { nombreCompleto, telefono, estado, compania, estatus } = updates;
  const now = new Date().toISOString();
  await db.run(
    'UPDATE Clientes SET nombreCompleto = ?, telefono = ?, estado = ?, compania = ?, estatus = ?, ultimaActualizacion = ? WHERE id = ?',
    nombreCompleto, telefono, estado, compania, estatus, now, id
  );
}

export async function deleteCliente(db: any, id: number) {
  await db.run('DELETE FROM Clientes WHERE id = ?', id);
}

// --- Agentes ---
export async function getAgentes(db: any, asesorId: string) {
  return db.all('SELECT * FROM Agentes WHERE asesorId = ?', asesorId);
}

export async function addAgente(db: any, agente: any) {
  const { name, state, company, asesorId } = agente;
  const result = await db.run(
    'INSERT INTO Agentes (name, state, company, asesorId) VALUES (?, ?, ?, ?)',
    name, state, company, asesorId
  );
  return result.lastID;
}

export async function updateAgente(db: any, id: number, updates: any) {
  const { name, state, company } = updates;
  await db.run(
    'UPDATE Agentes SET name = ?, state = ?, company = ? WHERE id = ?',
    name, state, company, id
  );
}

export async function deleteAgente(db: any, id: number) {
  await db.run('DELETE FROM Agentes WHERE id = ?', id);
}

// --- Avisos ---
export async function getAvisos(db: any, user: { id: number; email: string; }) {
  if (!user) return [];
  // Selects notices created by the user, sent to the user, or sent to "Todos"
  return db.all(
    'SELECT * FROM Avisos WHERE asesorId = ? OR recipient = ? OR recipient = "Todos"',
    user.id,
    user.email
  );
}

export async function addAviso(db: any, aviso: any) {
  const { clientId, note, status, creator, recipient, asesorId } = aviso;
  const result = await db.run(
    'INSERT INTO Avisos (clientId, note, status, creator, recipient, asesorId) VALUES (?, ?, ?, ?, ?, ?)',
    clientId, note, status, creator, recipient, asesorId
  );
  return result.lastID;
}

export async function updateAviso(db: any, id: number, updates: any) {
  const { clientId, note, status, creator, recipient } = updates;
  await db.run(
    'UPDATE Avisos SET clientId = ?, note = ?, status = ?, creator = ?, recipient = ? WHERE id = ?',
    clientId, note, status, creator, recipient, id
  );
}

export async function deleteAviso(db: any, id: number) {
  await db.run('DELETE FROM Avisos WHERE id = ?', id);
}

// --- Enlaces ---
export async function getEnlaces(db: any, asesorId: string) {
  return db.all('SELECT * FROM Enlaces WHERE asesorId = ? OR asesorId IS NULL', asesorId);
}

export async function addEnlace(db: any, enlace: any) {
  const { name, url, asesorId } = enlace;
  const result = await db.run(
    'INSERT INTO Enlaces (name, url, asesorId) VALUES (?, ?, ?)',
    name, url, asesorId
  );
  return result.lastID;
}

export async function updateEnlace(db: any, id: number, updates: any) {
  const { name, url } = updates;
  await db.run(
    'UPDATE Enlaces SET name = ?, url = ? WHERE id = ?',
    name, url, id
  );
}

export async function deleteEnlace(db: any, id: number) {
  await db.run('DELETE FROM Enlaces WHERE id = ?', id);
}

// --- Usuarios ---
export async function getUsuarios(db: any) {
  return db.all('SELECT id, name, email, role, status FROM Usuarios');
}

export async function getUsuarioByEmail(db: any, email: string) {
  return db.get('SELECT * FROM Usuarios WHERE email = ?', email);
}

export async function addUsuario(db: any, usuario: any) {
  const { name, email, password, role, status } = usuario;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await db.run(
    'INSERT INTO Usuarios (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
    name, email, hashedPassword, role, status
  );

  // Return the newly created user object
  return db.get('SELECT id, name, email, role, status FROM Usuarios WHERE id = ?', result.lastID);
}

export async function updateUsuario(db: any, id: number, updates: any) {
  const fields = [];
  const params = [];

  // Dynamically build the query based on provided fields
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || key === 'id' || key === 'email') continue; // Skip undefined, id, and email

    if (key === 'password') {
      if (value) { // Only hash and update if a new password is provided
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(value as string, saltRounds);
        fields.push('password = ?');
        params.push(hashedPassword);
      }
    } else {
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) {
    return; // Nothing to update
  }

  params.push(id);
  const sql = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
  
  await db.run(sql, ...params);
}

export async function deleteUsuario(db: any, id: number) {
  await db.run('DELETE FROM Usuarios WHERE id = ?', id);
}
