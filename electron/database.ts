import { app } from 'electron';
import fs from 'node:fs';
import { Collection, ObjectId } from 'mongodb';
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

export async function initializeDatabase(): Promise<void> {
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

    // KPIs
    const nuevosClientes = await clientesCollection.countDocuments(dateFilter);
    // Assuming 'estatus' can be 'Activa', 'Activo', etc. Adjust based on actual data values.
    // Using regex for flexibility or specific value. Let's assume 'Activa' based on common patterns or check typos.
    const polizasActivas = await clientesCollection.countDocuments({ ...dateFilter, estatus: 'Activa' });

    // Gestiones Pendientes - This field 'gestionStatus' was seen in addCliente as "PENDIENTE"
    const gestionesPendientes = await clientesCollection.countDocuments({ ...dateFilter, gestionStatus: 'PENDIENTE' });

    // Breakdowns

    // Clients per Asesor
    const clientsByAsesorRaw = await clientesCollection.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$asesorId", count: { $sum: 1 } } }
    ]).toArray();

    // Fetch users to map IDs to Names
    const users = await getUsuarios();
    const clientesPorAsesor = clientsByAsesorRaw.map(item => {
      const user = users.find(u => u.id === item._id);
      return {
        asesorName: user ? user.name : `ID: ${item._id}`,
        clientCount: item.count
      };
    });

    // Clients per Estado
    const clientesPorEstado = await clientesCollection.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$estado", count: { $sum: 1 } } },
      { $project: { estado: { $ifNull: ["$_id", "Sin Estado"] }, clientCount: "$count", _id: 0 } }
    ]).toArray();

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
  return clientesCollection.find(query).toArray();
}
export async function getClienteById(id: string) {
  try {
    return clientesCollection.findOne({ _id: new ObjectId(id) });
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
    const updateDoc: any = {
      $set: {
        updated_at: now,
      },
    };

    if (updates.nombreCompleto !== undefined) updateDoc.$set.nombreCompleto = updates.nombreCompleto;
    if (updates.telefono !== undefined) updateDoc.$set.telefono = updates.telefono;
    if (updates.estado !== undefined) updateDoc.$set.estado = updates.estado;
    if (updates.compania !== undefined) updateDoc.$set.compania = updates.compania;
    if (updates.estatus !== undefined) updateDoc.$set.estatus = updates.estatus;
    if (updates.lastGestionDate !== undefined) updateDoc.$set.lastGestionDate = updates.lastGestionDate;
    if (updates.gestionStatus !== undefined) updateDoc.$set.gestionStatus = updates.gestionStatus;

    await clientesCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
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
export async function getAgentes(asesorId: string): Promise<any[]> {
  return agentesCollection.find({ asesorId }).toArray();
}
export async function getAgenteById(id: string) {
  try {
    return agentesCollection.findOne({ _id: new ObjectId(id) });
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
  return avisosCollection.find({
    $or: [
      { asesorId: user.id }, // Assuming asesorId in Avisos collection is stored as string matching user.id
      { recipient: user.email },
      { recipient: 'Todos' }
    ]
  }).toArray();
}
export async function getAvisoById(id: string) {
  try {
    return avisosCollection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error(`Error fetching aviso by ID ${id}:`, error);
    return null;
  }
}
export async function addAviso(aviso: any) {
  try {
    const { clientId, note, status, creator, recipient, asesorId } = aviso;
    const now = new Date().toISOString();
    const result = await avisosCollection.insertOne({
      clientId: typeof clientId === 'string' ? new ObjectId(clientId) : clientId, // Convert to ObjectId if it's a string, otherwise keep as is
      note,
      status,
      creator,
      recipient,
      asesorId,
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
    const updateDoc: any = {
      $set: {
        updated_at: now,
      },
    };

    if (updates.clientId !== undefined) {
      updateDoc.$set.clientId = typeof updates.clientId === 'string' ? new ObjectId(updates.clientId) : updates.clientId;
    }
    if (updates.note !== undefined) updateDoc.$set.note = updates.note;
    if (updates.status !== undefined) updateDoc.$set.status = updates.status;
    if (updates.creator !== undefined) updateDoc.$set.creator = updates.creator;
    if (updates.recipient !== undefined) updateDoc.$set.recipient = updates.recipient;

    await avisosCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
  } catch (error) {
    console.error(`Error updating aviso by ID ${id}:`, error);
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
export async function getEnlaces(asesorId: string): Promise<any[]> {
  return enlacesCollection.find({
    $or: [
      { asesorId: asesorId },
      { asesorId: { $exists: false } } // Handles IS NULL equivalent in MongoDB
    ]
  }).toArray();
}
export async function getEnlaceById(id: string) {
  try {
    return enlacesCollection.findOne({ _id: new ObjectId(id) });
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

    return { clientes, agentes, avisos, enlaces, usuarios };
  } catch (error) {
    console.error('Error fetching all sync data:', error);
    return { clientes: [], agentes: [], avisos: [], enlaces: [], usuarios: [] };
  }
}
