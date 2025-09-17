import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

const mongo = client.db("ecoride_mongo_db");

export default mongo;
