import PriceRecord from "./models/PriceRecord";
import {collections} from "./db-service";
import axios from "axios"
const API_ENDPOINT = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=';
//time in milliseconds between API requests
const REFRESH_RATE = 10000;

export class PriceMonitor {
    private _apiKey: string

    setup() : void {
        this._apiKey = process.env.API_KEY;
    }

    // initiate async job that adds a
    // new price entry from the Etherscan API to the database every [REFRESH_RATE] milliseconds
    async start() : Promise<void> {
        try {
            const res = await axios.get(API_ENDPOINT + this._apiKey);
            await collections.prices.insertOne(PriceRecord.mapFromEtherscan(res.data.result));
            setTimeout(this.start.bind(this), REFRESH_RATE);
        } catch (e) {
            // try again after a longer period of time (in case server is down)
            setTimeout(this.start.bind(this), REFRESH_RATE * 2);
        }
    }

    // produces the average price of eth gas from [start] to [end] (millis since epoch)
    async retrieveAveragePrice(start: number, end: number) : Promise<number> {
        let total = 0;
        let recordCount = 0;
        await collections.prices.find({timestamp: { $gte: start, $lte: end}})
            .forEach((record) => {
                total += +record.average;
                recordCount++;
            });
        if (recordCount == 0) {
            return -1;
        }
        return total / recordCount;
    }

    // produces the last price record that was added to the database
    async retrieveCurrentPrice() : Promise<PriceRecord | null> {
        try {
            const latest = await collections.prices.find({}).sort({timestamp: -1}).limit(1).next();
            return (latest as PriceRecord);
        } catch (e) {
            // i.e not connected to database
            return null;
        }
    }
}