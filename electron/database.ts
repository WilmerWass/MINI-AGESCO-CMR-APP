import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(app.getPath('userData'), 'agesco_crm.db');

async function seedDatabase(db: any) {
  const adminUser = await getUsuarioByEmail(db, 'admin@agesco.com');
  if (!adminUser) {
    console.log('Admin user not found. Seeding initial admin user...');
    await addUsuario(db, {
      name: 'Admin',
      email: 'admin@agesco.com',
      password: 'admin',
      role: 'admin',
      status: 'Activo'
    });
    console.log('Admin user created with email: admin@agesco.com and password: admin');
  }
}

async function addColumn(db: any, tableName: string, columnName: string, columnDef: string) {
  try {
    const columns = await db.all(`PRAGMA table_info(${tableName})`);
    if (!columns.some((col: any) => col.name === columnName)) {
      await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
      console.log(`Column ${columnName} added to table ${tableName}.`);
    }
  } catch (error) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, error);
  }
}

export async function initializeDatabase() {
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
      fechaCreacion TEXT,
      updated_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS Agentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      state TEXT,
      company TEXT,
      asesorId TEXT NOT NULL,
      updated_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS Avisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId INTEGER,
      note TEXT NOT NULL,
      status TEXT,
      creator TEXT,
      recipient TEXT,
      asesorId TEXT NOT NULL,
      updated_at DATETIME,
      FOREIGN KEY (clientId) REFERENCES Clientes(id)
    );
    CREATE TABLE IF NOT EXISTS Enlaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      asesorId TEXT,
      updated_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS Usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at DATETIME
    );
  `);

  await addColumn(db, 'Clientes', 'updated_at', 'DATETIME');
  await addColumn(db, 'Agentes', 'updated_at', 'DATETIME');
  await addColumn(db, 'Avisos', 'updated_at', 'DATETIME');
  await addColumn(db, 'Enlaces', 'updated_at', 'DATETIME');
  await addColumn(db, 'Usuarios', 'updated_at', 'DATETIME');

  await seedDatabase(db);
  console.log('Database initialized and schema verified.');
  return db;
}

export async function getDashboardData(db: any, period: 'today' | 'week' | 'month' | 'total') {
  // ...
}

// --- Clientes ---
export async function getClientes(db: any, asesorId?: string) {
  if (asesorId) {
    return db.all('SELECT * FROM Clientes WHERE asesorId = ?', asesorId);
  } else {
    return db.all('SELECT * FROM Clientes');
  }
}
export async function getClienteById(db: any, id: number) {
  return db.get('SELECT * FROM Clientes WHERE id = ?', id);
}
export async function addCliente(db: any, cliente: any) {
  const { nombreCompleto, telefono, estado, compania, estatus, asesorId } = cliente;
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO Clientes (nombreCompleto, telefono, estado, compania, estatus, asesorId, fechaCreacion, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    nombreCompleto, telefono, estado, compania, estatus, asesorId, now, now
  );
  return result.lastID;
}
export async function updateCliente(db: any, id: number, updates: any) {
  const { nombreCompleto, telefono, estado, compania, estatus } = updates;
  const now = new Date().toISOString();
  await db.run(
    'UPDATE Clientes SET nombreCompleto = ?, telefono = ?, estado = ?, compania = ?, estatus = ?, updated_at = ? WHERE id = ?',
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
export async function getAgenteById(db: any, id: number) {
  return db.get('SELECT * FROM Agentes WHERE id = ?', id);
}
export async function addAgente(db: any, agente: any) {
  const { name, state, company, asesorId } = agente;
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO Agentes (name, state, company, asesorId, updated_at) VALUES (?, ?, ?, ?, ?)',
    name, state, company, asesorId, now
  );
  return result.lastID;
}
export async function updateAgente(db: any, id: number, updates: any) {
  const { name, state, company } = updates;
  const now = new Date().toISOString();
  await db.run(
    'UPDATE Agentes SET name = ?, state = ?, company = ?, updated_at = ? WHERE id = ?',
    name, state, company, now, id
  );
}
export async function deleteAgente(db: any, id: number) {
  await db.run('DELETE FROM Agentes WHERE id = ?', id);
}

// --- Avisos ---
export async function getAvisos(db: any, user: { id: number; email: string; }) {
  if (!user) return [];
  return db.all('SELECT * FROM Avisos WHERE asesorId = ? OR recipient = ? OR recipient = "Todos"', user.id, user.email);
}
export async function getAvisoById(db: any, id: number) {
  return db.get('SELECT * FROM Avisos WHERE id = ?', id);
}
export async function addAviso(db: any, aviso: any) {
  const { clientId, note, status, creator, recipient, asesorId } = aviso;
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO Avisos (clientId, note, status, creator, recipient, asesorId, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    clientId, note, status, creator, recipient, asesorId, now
  );
  return result.lastID;
}
export async function updateAviso(db: any, id: number, updates: any) {
  const { clientId, note, status, creator, recipient } = updates;
  const now = new Date().toISOString();
  await db.run(
    'UPDATE Avisos SET clientId = ?, note = ?, status = ?, creator = ?, recipient = ?, updated_at = ? WHERE id = ?',
    clientId, note, status, creator, recipient, now, id
  );
}
export async function deleteAviso(db: any, id: number) {
  await db.run('DELETE FROM Avisos WHERE id = ?', id);
}

// --- Enlaces ---
export async function getEnlaces(db: any, asesorId: string) {
  return db.all('SELECT * FROM Enlaces WHERE asesorId = ? OR asesorId IS NULL', asesorId);
}
export async function getEnlaceById(db: any, id: number) {
  return db.get('SELECT * FROM Enlaces WHERE id = ?', id);
}
export async function addEnlace(db: any, enlace: any) {
  const { name, url, asesorId } = enlace;
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO Enlaces (name, url, asesorId, updated_at) VALUES (?, ?, ?, ?)',
    name, url, asesorId, now
  );
  return result.lastID;
}
export async function updateEnlace(db: any, id: number, updates: any) {
  const { name, url } = updates;
  const now = new Date().toISOString();
  await db.run(
    'UPDATE Enlaces SET name = ?, url = ?, updated_at = ? WHERE id = ?',
    name, url, now, id
  );
}
export async function deleteEnlace(db: any, id: number) {
  await db.run('DELETE FROM Enlaces WHERE id = ?', id);
}

// --- Usuarios ---
export async function getUsuarios(db: any) {
  return db.all('SELECT id, name, email, role, status, updated_at FROM Usuarios');
}
export async function getUsuarioByEmail(db: any, email: string) {
  return db.get('SELECT * FROM Usuarios WHERE email = ?', email);
}
export async function getUsuarioById(db: any, id: number) {
  return db.get('SELECT * FROM Usuarios WHERE id = ?', id);
}
export async function addUsuario(db: any, usuario: any) {
  const { name, email, password, role, status } = usuario;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const now = new Date().toISOString();
  const result = await db.run(
    'INSERT INTO Usuarios (name, email, password, role, status, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    name, email, hashedPassword, role, status, now
  );
  return db.get('SELECT id, name, email, role, status, updated_at FROM Usuarios WHERE id = ?', result.lastID);
}
export async function updateUsuario(db: any, id: number, updates: any) {
  const fields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || key === 'id' || key === 'email') continue;
    if (key === 'password') {
      if (value) {
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

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  params.push(new Date().toISOString());

  params.push(id);
  const sql = `UPDATE Usuarios SET ${fields.join(', ')} WHERE id = ?`;
  await db.run(sql, ...params);
}
export async function deleteUsuario(db: any, id: number) {
  await db.run('DELETE FROM Usuarios WHERE id = ?', id);
}

// --- Sync ---
export async function getAllSyncData(db: any) {
  const clientes = await db.all('SELECT * FROM Clientes');
  const agentes = await db.all('SELECT * FROM Agentes');
  const avisos = await db.all('SELECT * FROM Avisos');
  const enlaces = await db.all('SELECT * FROM Enlaces');
  const usuarios = await db.all('SELECT * FROM Usuarios');
  return { clientes, agentes, avisos, enlaces, usuarios };
}
