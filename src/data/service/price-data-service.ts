import PriceRecord from "../models/PriceRecord";
import {PriceDatabase} from "./db-service";
import axios from "axios"

/**
 * API/Price service class to add records to {@link PriceDatabase} and retrieve latest
 * and average gas prices
 */
export class PriceMonitor {

    private static _instance;

    /**
     * @returns The {@link PriceMonitor} application instance
     */
    static getInstance() {
        if (PriceMonitor._instance == null) {
            PriceMonitor._instance = new PriceMonitor();
        }
        return PriceMonitor._instance;
    }

    // eslint-disable-next-line
    private constructor() {}

    /**
     * Initiates a job that adds a new {@link PriceRecord} from the Etherscan API to the {@link PriceDatabase}
     * every {@link refreshRate} milliseconds.
     *
     * @param apiKey - The Etherscan API key
     * @param priceEndpoint - The Etherscan endpoint to query for prices
     * @param refreshRate - The interval (in milliseconds) to query {@link priceEndpoint}
     */
    start(apiKey: string, priceEndpoint: string, refreshRate: number): void {
        setInterval(async () => {
            try {
                const res = await axios.get(priceEndpoint + apiKey);
                await PriceDatabase.getInstance()
                    .collections
                    .prices
                    .insertOne(PriceRecord.mapFromEtherscan(res.data.result));
                console.log("Inserted price record from latest Etherscan API gas price: "
                    + JSON.stringify(res.data.result));
            } catch (e) {
                console.log("Error adding or retrieving a new price record: " + e);
            }
        }, refreshRate);
    }

    /**
     * Produces the average price of Ethereum gas from {@link start} to {@link end} (milliseconds since epoch)
     * on the {@link PriceDatabase}. (Average calculation uses mean)
     *
     * @param start - Lower time bound for average price calculation (in milliseconds since epoch)
     * @param end - Upper time bound for average price calculation (in milliseconds since epoch)
     * @param refreshRate - The interval (in milliseconds) to query {@link priceEndpoint}
     * @returns The average price (rounded to 2 decimal points) or -1 if there are no added prices
     */
    async retrieveAveragePrice(start: number, end: number): Promise<number> {
        let total = 0;
        let recordCount = 0;
        try {
            await PriceDatabase.getInstance().collections.prices.find({timestamp: {$gte: start, $lte: end}})
                .forEach((record) => {
                    total += +record.average;
                    recordCount++;
                });
            if (recordCount == 0) {
                return -1;
            }
            return total / recordCount;
        } catch (e) {
            // i.e not connected to database / db error
            return -1;
        }
    }

    /**
     * Produces the latest added price of Ethereum gas (on the {@link PriceDatabase}).
     *
     * @returns The latest Ethereum gas price or null if none is found
     */
    async retrieveCurrentPrice(): Promise<PriceRecord | null> {
        try {
            // using find instead of findOne since find returns a cursor which supports the .sort() function
            const latest =
                await PriceDatabase.getInstance().collections.prices.find({}).sort({timestamp: -1}).limit(1).next();
            return (latest as PriceRecord);
        } catch (e) {
            // i.e not connected to database / db error
            return null;
        }
    }
}