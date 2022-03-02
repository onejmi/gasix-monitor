import * as mongo from "mongodb";
import PriceRecord from "../models/PriceRecord";

/**
 * Database service class to initialize and connect to a MongoDB Database
 * to store and retrieve prices
 */
export class PriceDatabase {

    private static _instance;

    private _collections: { prices?: mongo.Collection<PriceRecord> } = {};

    // eslint-disable-next-line
    private constructor() {}

    /**
     * @returns The {@link PriceDatabase} application instance
     */
    static getInstance() {
        // lazy init
        if(PriceDatabase._instance == null) {
            PriceDatabase._instance = new PriceDatabase();
        }
        return PriceDatabase._instance;
    }

    /**
     * Connects to MongoDB database {@link dbName} hosted at {@link dbConnectionString}.
     * Also creates a {@link pricesCollectionName} collection if it does not exist on {@link dbName}
     *
     * @param dbConnectionString - The MongoDB connection string
     * @param dbName - The name of the database
     * @param pricesCollectionName - The name of the MongoDB collection to store price records
     *
     * @throws {@link MongoError}
     */
    async connect(dbConnectionString: string, dbName: string, pricesCollectionName: string): Promise<void> {
        const client = new mongo.MongoClient(dbConnectionString);
        await client.connect();
        const db = client.db(dbName);
        this._collections.prices = db.collection<PriceRecord>(pricesCollectionName);

        // for faster indexing - (index by time added)
        await this._collections.prices.createIndex({ timestamp: 1 })
    }

    /**
     * @returns The database prices collection
     */
    get collections() : { prices?: mongo.Collection<PriceRecord> } {
        return this._collections;
    }
}