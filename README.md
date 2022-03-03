# Gasix Monitor
**Find it difficult to stay on top of highly-fluctuating Ethereum gas prices?** <br><br>
Gasix Monitor is an API that tracks current and past
operation gas prices on the Ethereum Network.

### Endpoints

- ``/gas`` produces the latest gas prices
- ``/average?fromTime=FROM_TIME&toTime=TO_TIME`` produces the average price of gas over a period of time, starting from [fromTime] to [toTime] (where both fields are in seconds since epoch)

**Note:** All prices are in *Gwei*

## Challenges & Considerations
* This was my first time using Docker, so I had to look through
  the provided documentation and a couple videos to get a basic understanding of how contanerization works and how to implement it. <br>
* The primairy reasons why I opted to use the Etherscan.io API for this project are: it was the more popular option (and hence probably more stable / production ready), and I was given the rate limit beforehand which made it straightforward to setup my request scheduler in a way that would prevent it from throttling (due to API blockages for excessive requests).
* Knowing that the API would be frequently sorting price entries by time, I setup the record timestamp field to be a database index for more efficient querying.

## Next Steps

* Use a job scheduling library such as [agenda](https://www.npmjs.com/package/agenda) to schedule API requests
* Currently, I'm using a REST API to serve price data. In reality, prices can change very quickly, so next time I would use Websockets to serve data in realtime when a price change occurs.
* Make price records unique based on blockNumber (i.e do not add duplicate blocks to the database if the same block is returned from the Etherscan API for multiple requests)
* Cache requests for averages (becomes an intense operation as the number of records increases)

## Getting Started

Add a `.env` file to the project's root directory containing the following information:
```
DB_CONN_STRING="mongodb://root:passwd@db:27017"
DB_NAME="priceDb"
PRICES_COLLECTION="prices"
API_KEY="API_KEY_HERE"
```
Replace `API_KEY_HERE` with an [Etherscan API Key](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics) <br>
Note that "root" and "passwd" can be updated to reflect the
username and password of the database user.

Make sure that you have [Docker](https://docs.docker.com/get-docker/) installed. <br>
Then run:
```
docker-compose up
```
in the command line to build and execute the application.
