import express from 'express';
import {PriceMonitor} from "./data/eth-data";
import * as database from './data/db-service'
const app = express();
const port = 3000;
const pm = new PriceMonitor();

app.get('/gas', async (req, res) => {
  const lastAddedRecord = await pm.retrieveCurrentPrice();
  if(lastAddedRecord == null) {
    res.status(404).json({ error: true, message: "No latest record was found" });
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
    const start = parseInt(req.query['fromTime'].toString());
    const end = parseInt(req.query['toTime'].toString());

    const currTime = Date.now();

    if(start > currTime) {
      res.status(400).json({ error: true, message: "Cannot calculate future average prices!" })
    } else if(start > end) {
      res.status(400).json({ error: true, message: "fromTime cannot begin after toTime" })
    } else if (start < 0 || end < 0) {
      res.status(400).json({ error: true, message: "fromTime and toTime must be non-negative" })
    } else {
        const average = await pm.retrieveAveragePrice(start, end);
        if(average == -1) {
          res.status(404).json({ error: true, message: "No entries were found"})
        }
        res.status(200).json({
          error: false,
          message: {
            averageGasPrice: average,
            fromTime: start,
            toTime: end
          }
        });
    }
  } catch (e) {
    res.status(400)
        .json({ error: true, message: "Must provide a fromTime and toTime that are valid numbers"});
  }
})

app.listen(port, async () => {
  await database.connect();
  pm.setup();
  pm.start();
  return console.log(`Listening at http://localhost:${port}`);
});

