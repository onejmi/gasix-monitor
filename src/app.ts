import express from 'express';
import * as dotenv from "dotenv";
import {PriceMonitor} from "./data/service/price-data-service";
import {PriceDatabase} from './data/service/db-service'

const app = express();
const port = 3000;
const API_ENDPOINT = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=';
//time in milliseconds between API requests
const REFRESH_RATE = 10000;

app.get('/gas', async (req, res) => {
    const lastAddedRecord = await PriceMonitor.getInstance().retrieveCurrentPrice();
    if (lastAddedRecord == null) {
        res.status(404).json({error: true, message: "No latest record was found"});
    } else {
        res.status(200).json({
            error: false,
            message: {
                fast: lastAddedRecord.fast,
                average: lastAddedRecord.average,
                low: lastAddedRecord.low,
                blockNum: lastAddedRecord.blockNum
            }
        });
    }
});

app.get('/average', async (req, res) => {
    try {
        const start = parseInt(req.query['fromTime'].toString()) * 1000;
        const end = parseInt(req.query['toTime'].toString()) * 1000;

        const currTime = Date.now();

        if (start > currTime || end > currTime) {
            res.status(400).json({error: true, message: "Cannot calculate future average prices!"})
        } else if (start > end) {
            res.status(400).json({error: true, message: "fromTime cannot begin after toTime"})
        } else if (start < 0 || end < 0) {
            res.status(400).json({error: true, message: "fromTime and toTime must be non-negative"})
        } else {
            const average = await PriceMonitor.getInstance().retrieveAveragePrice(start, end);
            if (average == -1) {
                res.status(404).json({error: true, message: "No entries were found"})
            } else {
                res.status(200).json({
                    error: false,
                    message: {
                        averageGasPrice: Math.round(average * 100) / 100,
                        fromTime: start / 1000,
                        toTime: end / 1000
                    }
                });
            }
        }
    } catch (e) {
        res.status(400)
            .json({error: true, message: "Must provide a fromTime and toTime that are valid numbers"});
    }
})

app.listen(port, async () => {
    dotenv.config();
    await PriceDatabase.getInstance().connect(process.env.DB_CONN_STRING,
        process.env.DB_NAME,
        process.env.PRICES_COLLECTION);
    PriceMonitor.getInstance().start(process.env.API_KEY, API_ENDPOINT, REFRESH_RATE);
    return console.log(`Listening at: http://localhost:${port}`);
});

