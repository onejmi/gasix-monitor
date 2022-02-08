import * as dotenv from "dotenv";
import * as mongo from "mongodb";
import PriceRecord from "./models/PriceRecord";

export const collections: { prices?: mongo.Collection<PriceRecord> } = {};

// connect to mongodb database & initializes collections
export async function connect() : Promise<void> {
    dotenv.config();
    const client = new mongo.MongoClient(process.env.DB_CONN_STRING);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    collections.prices = db.collection<PriceRecord>(process.env.PRICES_COLLECTION);

    // for faster indexing - (index by time added)
    await collections.prices.createIndex({ timestamp: 1 })
}