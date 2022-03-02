import * as mongo from 'mongodb'

// Note: Using PriceRecord class instead of directly storing/reading
// the retrieved API payload (since all current / new fields that are returned
// would be saved to the database and displayed to the client - including large/irrelevant payload fields)
// Trade-off is that API fields might be refactored which means PriceRecord also needs to be updated accordingly.

/** Model class for price record entries in {@link PriceDatabase} */
export default class PriceRecord {
    constructor(public readonly fast: number,
                public readonly average: number,
                public readonly low: number,
                public readonly blockNum: number,
                public readonly timestamp: number,
                public readonly id?: mongo.ObjectId) {}

    /**
     * Maps a {@link raw} Etherscan gas price payload into a serializable {@link PriceRecord}
     *
     * @param raw - A gas price payload from Etherscan API
     * @returns A {@link PriceRecord} populated with data from {@link raw}
     */
    static mapFromEtherscan(raw: any) {
        return new PriceRecord(raw.FastGasPrice,
            raw.ProposeGasPrice,
            raw.SafeGasPrice,
            raw.LastBlock,
            Date.now());
    }
}