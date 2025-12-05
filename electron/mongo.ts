import { MongoClient, Db } from 'mongodb';

// Replace with your MongoDB Atlas connection string
// Example: "mongodb+srv://user:password@clustername.mongodb.net/agesco_crm?retryWrites=true&w=majority"
// Make sure to replace <user>, <password>, <clustername>, and <dbname> with your actual values.
const MONGODB_URI = "mongodb+srv://wilmersaludybienestar_db_user:Na19s7JFltdyk2sZ@cluster0.ryqzv2d.mongodb.net/?appName=Cluster0";

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
    process.exit(1); // Exit process if connection fails
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
