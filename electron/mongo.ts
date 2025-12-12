import { MongoClient, Db } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

// Load configuration from external file
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const MONGODB_URI = config.mongo_uri;

if (!MONGODB_URI) {
    throw new Error('mongo_uri not found in electron/config.json. Please ensure the file exists and contains the connection string.');
}

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db; // Return existing connection if already connected
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('agesco_crm'); // Specify your database name here
    console.log('Successfully connected to MongoDB!');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function closeMongoDBConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
    db = undefined as any; // Reset db instance
  }
}

// Optional: Add a function to get a specific collection
export function getCollection(name: string) {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectToMongoDB first.');
  }
  return db.collection(name);
}
