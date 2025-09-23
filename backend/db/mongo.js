import { MongoClient } from "mongodb";
import "dotenv/config";

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017";
const dbName =
  process.env.MONGODB_DB ||
  process.env.MONGO_DB ||
  process.env.DB_NAME ||
  "ecorideMongo";

let _client;
let _db;
let _connecting = null;

async function connect() {
  if (_db) return _db;
  if (_connecting) return _connecting;

  _connecting = (async () => {
    if (!global.__MONGO_CLIENT__) {
      global.__MONGO_CLIENT__ = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 3000,
      });
    }
    _client = global.__MONGO_CLIENT__;
    await _client.connect();
    _db = _client.db(dbName);
    return _db;
  })();

  try {
    return await _connecting;
  } finally {
    _connecting = null;
  }
}

function getDb() {
  if (!_db) throw new Error("Mongo not connected. Call connect() first.");
  return _db;
}

function getClient() {
  if (!_client) throw new Error("Mongo not connected. Call connect() first.");
  return _client;
}

function collection(name) {
  return getDb().collection(name);
}

function rawCollection(name) {
  return getDb().collection(name);
}

export { connect, getDb, getClient, collection, rawCollection };
export default { connect, getDb, getClient, collection, rawCollection };
