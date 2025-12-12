import { app } from 'electron';
import fs from 'node:fs';
import { Collection, ObjectId, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import { connectToMongoDB, getCollection } from './mongo';

let clientesCollection: Collection;
let agentesCollection: Collection;
let avisosCollection: Collection;
let enlacesCollection: Collection;
let usuariosCollection: Collection;


async function seedDatabase() {
  const adminUser = await usuariosCollection.findOne({ email: 'admin@agesco.com' });
  if (!adminUser) {
    console.log('Admin user not found. Seeding initial admin user...');
    await addUsuario({
      name: 'Admin',
      email: 'admin@agesco.com',
      password: 'admin',
      role: 'admin',
      status: 'Activo'
    });
    console.log('Admin user created with email: admin@agesco.com and password: admin');
  }
}

// Helper to map MongoDB _id to string id
const mapDocument = (doc: any) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toHexString(), ...rest };
};


// Migration function to Ensure asesorId is String
async function migrateAsesorIds() {
  const collections = [clientesCollection, agentesCollection, avisosCollection, enlacesCollection];
  // Check if collections are initialized
  if (!clientesCollection) return;

  for (const collection of collections) {
    if (!collection) continue;
    // Find documents where asesorId exists and is NOT a string.
    // MongoDB $type: 2 is string.
    const nonStringAsesors = await collection.find({
      asesorId: { $exists: true, $not: { $type: 2 } }
    }).toArray();

    if (nonStringAsesors.length > 0) {
      console.log(`Migrating ${nonStringAsesors.length} documents in ${collection.collectionName} to string asesorId`);
      for (const doc of nonStringAsesors) {
        if (doc.asesorId !== undefined && doc.asesorId !== null) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: { asesorId: String(doc.asesorId) } }
          );
        }
      }
    }
  }
}

export async function initializeDatabase(): Promise<Db> {
  const db = await connectToMongoDB();

  clientesCollection = db.collection('Clientes');
  agentesCollection = db.collection('Agentes');
  avisosCollection = db.collection('Avisos');
  enlacesCollection = db.collection('Enlaces');
  usuariosCollection = db.collection('Usuarios');

  // Ensure indexes for frequently queried fields like email for Usuarios
  await usuariosCollection.createIndex({ email: 1 }, { unique: true });
  // Add other indexes as needed for performance, e.g., asesorId for Clientes, Agentes, Avisos, Enlaces

  await clientesCollection.createIndex({ asesorId: 1 });
  await agentesCollection.createIndex({ asesorId: 1 });
  await avisosCollection.createIndex({ asesorId: 1 });
  await enlacesCollection.createIndex({ asesorId: 1 });

  await seedDatabase();
  await migrateAsesorIds(); // Run migration
  console.log('Database initialized and collections ready.');
  return db;
}

export async function getDashboardData(period: 'today' | 'week' | 'month' | 'total') {
  try {
    const now = new Date();
    let startDate: string | undefined;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart.toISOString();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        break;
      case 'total':
      default:
        startDate = undefined;
        break;
    }

    const dateFilter = startDate ? { fechaCreacion: { $gte: startDate } } : {};

    // --- Run queries in parallel for efficiency ---
    const [
      nuevosClientes,
      polizasActivas,
      gestionesPendientes,
      clientsByAsesorRaw,
      clientesPorEstado,
      users,
    ] = await Promise.all([
      clientesCollection.countDocuments(dateFilter),
      clientesCollection.countDocuments({ ...dateFilter, estatus: 'Activa' }),
      clientesCollection.countDocuments({ ...dateFilter, gestionStatus: 'PENDIENTE' }),
      clientesCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$asesorId", count: { $sum: 1 } } }
      ]).toArray(),
      clientesCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$estado", count: { $sum: 1 } } },
        { $project: { estado: { $ifNull: ["$_id", "Sin Estado"] }, clientCount: "$count", _id: 0 } }
      ]).toArray(),
      getUsuarios(),
    ]);
    
    // --- Use a Map for fast user lookup (O(1) average access time) ---
    const userMap = new Map(users.map(u => [u.id, u.name]));

    const clientesPorAsesor = clientsByAsesorRaw.map(item => {
      const idStr = item._id ? item._id.toString() : 'Unknown';
      const asesorName = userMap.get(idStr);
      return {
        asesorName: asesorName || (idStr === 'Unknown' ? 'Sin Asignar' : `ID: ${idStr.substring(0, 6)}...`),
        clientCount: item.count
      };
    });

    return {
      kpis: {
        nuevosClientes,
        polizasActivas,
        gestionesPendientes,
      },
      clientesPorAsesor,
      clientesPorEstado,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return a default/empty state on error
    return {
      kpis: { nuevosClientes: 0, polizasActivas: 0, gestionesPendientes: 0 },
      clientesPorAsesor: [],
      clientesPorEstado: [],
    };
  }
}

// --- Clientes ---
export async function getClientes(asesorId?: string) {
  const query = asesorId ? { asesorId } : {};
  const clientes = await clientesCollection.find(query).sort({ fechaCreacion: -1 }).toArray();
  return clientes.map(mapDocument);
}
export async function getClienteById(id: string) {
  try {
    const doc = await clientesCollection.findOne({ _id: new ObjectId(id) });
    return mapDocument(doc);
  } catch (error) {
    console.error(`Error fetching client by ID ${id}:`, error);
    return null;
  }
}
export async function addCliente(cliente: any) {
  try {
    const { nombreCompleto, telefono, estado, compania, estatus, asesorId } = cliente;
    const now = new Date();
    const result = await clientesCollection.insertOne({
      nombreCompleto,
      telefono,
      estado,
      compania,
      estatus,
      asesorId,
      fechaCreacion: now.toISOString(),
      updated_at: now.toISOString(),
      lastGestionDate: now.toISOString(), // Initialize with current date
      gestionStatus: "PENDIENTE",       // Default status for new clients
    });
    return result.insertedId.toHexString();
  } catch (error) {
    console.error(`Error adding client:`, error);
    return null;
  }
}
export async function updateCliente(id: string, updates: any) {
  try {
    const now = new Date().toISOString();

    // Crear una copia de updates sin el campo id
    const { id: _, ...updateFields } = updates;

    // Agregar el campo updated_at
    const updateDoc = {
      ...updateFields,
      updated_at: now,
    };

    await clientesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
  } catch (error) {
    console.error(`Error updating client by ID ${id}:`, error);
  }
}
export async function deleteCliente(id: string) {
  try {
    await clientesCollection.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error deleting client by ID ${id}:`, error);
  }
}

// --- Agentes ---
export async function getAgentes(asesorId?: string): Promise<any[]> {
  const query = asesorId ? { asesorId } : {};
  const agentes = await agentesCollection.find(query).toArray();
  return agentes.map(mapDocument);
}
export async function getAgenteById(id: string) {
  try {
    const doc = await agentesCollection.findOne({ _id: new ObjectId(id) });
    return mapDocument(doc);
  } catch (error) {
    console.error(`Error fetching agent by ID ${id}:`, error);
    return null;
  }
}
export async function addAgente(agente: any) {
  const { name, state, company, asesorId } = agente;
  const now = new Date().toISOString();
  const result = await agentesCollection.insertOne({
    name,
    state,
    company,
    asesorId,
    updated_at: now,
  });
  return result.insertedId.toHexString();
}
export async function updateAgente(id: string, updates: any) {
  try {
    const now = new Date().toISOString();
    const updateDoc: any = {
      $set: {
        updated_at: now,
      },
    };

    if (updates.name !== undefined) updateDoc.$set.name = updates.name;
    if (updates.state !== undefined) updateDoc.$set.state = updates.state;
    if (updates.company !== undefined) updateDoc.$set.company = updates.company;

    await agentesCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
  } catch (error) {
    console.error(`Error updating agent by ID ${id}:`, error);
  }
}
export async function deleteAgente(id: string) {
  try {
    await agentesCollection.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error deleting agent by ID ${id}:`, error);
  }
}

// --- Avisos ---
export async function getAvisos(user: { id: string; email: string; }) {
  if (!user) return [];
  const avisos = await avisosCollection.find({
    $or: [
      { asesorId: user.id }, // Assuming asesorId in Avisos collection is stored as string matching user.id
      { recipient: user.email },
      { recipient: 'Todos' }
    ]
  }).toArray();
  
  return avisos.map(doc => {
    const mappedDoc = mapDocument(doc);
    if (mappedDoc) {
      mappedDoc.status = doc.readBy?.includes(user.id) ? 'Visto' : 'Pendiente';
    }
    return mappedDoc;
  });
}
export async function getAvisoById(id: string) {
  try {
    const doc = await avisosCollection.findOne({ _id: new ObjectId(id) });
    return mapDocument(doc);
  } catch (error) {
    console.error(`Error fetching aviso by ID ${id}:`, error);
    return null;
  }
}
export async function addAviso(aviso: any) {
  try {
    const { clientId, note, creator, recipient, asesorId } = aviso;
    const now = new Date().toISOString();
    const result = await avisosCollection.insertOne({
      clientId: typeof clientId === 'string' ? new ObjectId(clientId) : clientId,
      note,
      creator,
      recipient,
      asesorId,
      readBy: [], // New field
      updated_at: now,
    });
    return result.insertedId.toHexString();
  } catch (error) {
    console.error(`Error adding aviso:`, error);
    return null;
  }
}
export async function updateAviso(id: string, updates: any) {
  try {
    const now = new Date().toISOString();
    const { id: _, ...updateFields } = updates;

    const updateDoc = {
      $set: {
        ...updateFields,
        updated_at: now,
      },
    };

    await avisosCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
  } catch (error) {
    console.error(`Error updating aviso by ID ${id}:`, error);
  }
}

export async function updateAvisoStatus(id: string, userId: string, status: 'Visto' | 'Pendiente') {
    try {
        const now = new Date().toISOString();
        const updateDoc: any = {
            $set: { updated_at: now }
        };

        if (status === 'Visto') {
            updateDoc.$addToSet = { readBy: userId };
        } else {
            updateDoc.$pull = { readBy: userId };
        }

        await avisosCollection.updateOne(
            { _id: new ObjectId(id) },
            updateDoc
        );
    } catch (error) {
        console.error(`Error updating aviso status for ID ${id}:`, error);
    }
}
export async function deleteAviso(id: string) {
  try {
    await avisosCollection.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error deleting aviso by ID ${id}:`, error);
  }
}

// --- Enlaces ---
export async function getEnlaces(asesorId?: string): Promise<any[]> {
  const query = asesorId
    ? {
      $or: [
        { asesorId: asesorId },
        { asesorId: { $exists: false } }, // Common links
        { asesorId: null }
      ]
    }
    : {}; // Return all if no asesorId provided (e.g. Admin)

  const enlaces = await enlacesCollection.find(query).toArray();
  return enlaces.map(mapDocument);
}
export async function getEnlaceById(id: string) {
  try {
    const doc = await enlacesCollection.findOne({ _id: new ObjectId(id) });
    return mapDocument(doc);
  } catch (error) {
    console.error(`Error fetching enlace by ID ${id}:`, error);
    return null;
  }
}
export async function addEnlace(enlace: any) {
  try {
    const { name, url, asesorId } = enlace;
    const now = new Date().toISOString();
    const result = await enlacesCollection.insertOne({
      name,
      url,
      asesorId,
      updated_at: now,
    });
    return result.insertedId.toHexString();
  } catch (error) {
    console.error(`Error adding enlace:`, error);
    return null;
  }
}
export async function updateEnlace(id: string, updates: any) {
  try {
    const now = new Date().toISOString();
    const updateDoc: any = {
      $set: {
        updated_at: now,
      },
    };

    if (updates.name !== undefined) updateDoc.$set.name = updates.name;
    if (updates.url !== undefined) updateDoc.$set.url = updates.url;

    await enlacesCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
  } catch (error) {
    console.error(`Error updating enlace by ID ${id}:`, error);
  }
}
export async function deleteEnlace(id: string) {
  try {
    await enlacesCollection.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error deleting enlace by ID ${id}:`, error);
  }
}

// --- Usuarios ---
export async function getUsuarios(): Promise<any[]> {
  const users = await usuariosCollection.find({}, { projection: { password: 0 } }).toArray();
  return users.map(user => {
    const { _id, ...rest } = user;
    return { id: _id.toHexString(), ...rest };
  });
}
export async function getUsuarioByEmail(email: string) {
  try {
    return usuariosCollection.findOne({ email });
  } catch (error) {
    console.error(`Error fetching user by email ${email}:`, error);
    return null;
  }
}
export async function getUsuarioById(id: string) {
  try {
    return usuariosCollection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error fetching user by ID ${id}:`, error);
    return null;
  }
}
export async function addUsuario(usuario: any) {
  try {
    const { name, email, password, role, status } = usuario;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const now = new Date().toISOString();
    const result = await usuariosCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      status,
      updated_at: now,
    });
    // Return the inserted user, transforming _id to id and excluding password
    const newUser = await usuariosCollection.findOne({ _id: result.insertedId }, { projection: { password: 0 } });
    if (newUser) {
      const { _id, ...rest } = newUser;
      return { id: _id.toHexString(), ...rest };
    }
    return null;
  } catch (error) {
    console.error(`Error adding user:`, error);
    return null;
  }
}
export async function updateUsuario(id: string, updates: any) {
  try {
    const now = new Date().toISOString();
    const updateDoc: any = {
      $set: {
        updated_at: now,
      },
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || key === 'id' || key === 'email') continue;
      if (key === 'password') {
        if (value) {
          const saltRounds = 10;
          updateDoc.$set.password = await bcrypt.hash(value as string, saltRounds);
        }
      } else {
        updateDoc.$set[key] = value;
      }
    }

    await usuariosCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
  } catch (error) {
    console.error(`Error updating user by ID ${id}:`, error);
  }
}
export async function deleteUsuario(id: string) {
  try {
    await usuariosCollection.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error deleting user by ID ${id}:`, error);
  }
}

// --- Sync ---
export async function getAllSyncData() {
  try {
    const clientes = await clientesCollection.find({}).toArray();
    const agentes = await agentesCollection.find({}).toArray();
    const avisos = await avisosCollection.find({}).toArray();
    const enlaces = await enlacesCollection.find({}).toArray();
    const usersRaw = await usuariosCollection.find({}, { projection: { password: 0 } }).toArray();

    const usuarios = usersRaw.map(user => {
      const { _id, ...rest } = user;
      return { id: _id.toHexString(), ...rest };
    });

    return {
      clientes: clientes.map(mapDocument),
      agentes: agentes.map(mapDocument),
      avisos: avisos.map(mapDocument),
      enlaces: enlaces.map(mapDocument),
      usuarios
    };
  } catch (error) {
    console.error('Error fetching all sync data:', error);
    return { clientes: [], agentes: [], avisos: [], enlaces: [], usuarios: [] };
  }
}

export async function getSyncDataForUser(user: any) {
  try {
    if (user.role === 'admin') {
      return await getAllSyncData();
    }

    // For 'asesor' role
    const asesorId = user.id;

    const [clientes, agentes, avisos, enlaces, usersRaw] = await Promise.all([
      clientesCollection.find({ asesorId }).toArray(),
      agentesCollection.find({}).toArray(), // Return all agetnes
      avisosCollection.find({
        $or: [
          { asesorId: asesorId },
          { recipient: user.email },
          { recipient: 'Todos' }
        ]
      }).toArray(),
      enlacesCollection.find({
        $or: [
          { asesorId: asesorId },
          { asesorId: { $exists: false } },
          { asesorId: null }
        ]
      }).toArray(),
      usuariosCollection.find({}, { projection: { password: 0 } }).toArray()
    ]);

    const usuarios = usersRaw.map(u => {
      const { _id, ...rest } = u;
      return { id: _id.toHexString(), ...rest };
    });

    return {
      clientes: clientes.map(mapDocument),
      agentes: agentes.map(mapDocument),
      avisos: avisos.map(mapDocument),
      enlaces: enlaces.map(mapDocument),
      usuarios
    };

  } catch (error) {
    console.error(`Error fetching sync data for user ${user.email}:`, error);
    return { clientes: [], agentes: [], avisos: [], enlaces: [], usuarios: [] };
  }
}
