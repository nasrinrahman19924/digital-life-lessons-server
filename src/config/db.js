import "dotenv/config";
import { MongoClient } from "mongodb";

export const client = new MongoClient(process.env.MONGO_DB_URI);

await client.connect();

console.log("✅ MongoDB Connected");

export const db = client.db(process.env.DB_NAME);