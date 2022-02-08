import * as mongo from 'mongodb'

export default class PriceRecord {
    constructor(public readonly fast: number,
                public readonly average: number,
                public readonly low: number,
                public readonly blockNum: number,
                public readonly timestamp: number,
                public readonly id?: mongo.ObjectId) {}

    static mapFromEtherscan(raw: any) {
        return new PriceRecord(raw['FastGasPrice'],
            raw['ProposeGasPrice'],
            raw['SafeGasPrice'],
            raw['LastBlock'],
            Date.now());
    }
}