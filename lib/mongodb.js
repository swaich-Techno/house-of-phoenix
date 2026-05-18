import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "house-of-phoenix";
const databaseState = globalThis.__houseOfPhoenixDbState || {
  connectionIssue: null
};

globalThis.__houseOfPhoenixDbState = databaseState;

let clientPromise;

export function isDatabaseConfigured() {
  return Boolean(uri) && !databaseState.connectionIssue;
}

export function getDatabaseConnectionIssue() {
  return databaseState.connectionIssue;
}

export async function getDatabase() {
  if (!uri) {
    databaseState.connectionIssue = null;
    return null;
  }

  try {
    if (!clientPromise) {
      const client = new MongoClient(uri);
      clientPromise = client.connect();
    }

    const client = await clientPromise;
    databaseState.connectionIssue = null;
    return client.db(dbName);
  } catch (error) {
    clientPromise = null;
    databaseState.connectionIssue =
      error instanceof Error ? error.message : "Unknown database connection error.";
    console.warn("MongoDB connection unavailable. Falling back to demo mode.");
    return null;
  }
}
