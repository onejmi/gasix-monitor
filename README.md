# Gasix Monitor
**Find it difficult to stay on top of highly-fluctuating Ethereum gas prices?** <br><br>
Gasix Monitor is an application that helps you stay on top of <br>
highly-fluctuating gas prices on the Ethereum Network. 



**Note:** All prices are in *Gwei*

## Challenges
* This was my first time using Docker, so I had to look through
the documentation and a few videos to get a basic understanding of how contanerization works and how to implement it <br>
  

## Next Steps

* Use a job scheduling library such as [agenda](https://www.npmjs.com/package/agenda) to schedule API requests
* Currently, I'm using a REST API to serve users of the app. In reality, prices change very quickly, so next time I would use Websockets to serve users in realtime when a price change occurs

## Usage

Add a `.env` file to the project's root directory containing the following information:
```
DB_CONN_STRING="mongodb://root:passwd@db:27017"
DB_NAME="priceDb"
PRICES_COLLECTION="prices"
API_KEY="API_KEY_HERE"
```
Replace API_KEY_HERE with an [Etherscan API Key](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics) <br>
Note that "root" and "passwd" can be updated to reflect the
username and password of the database user.

Make sure that you have [Docker](https://docs.docker.com/get-docker/) installed. <br>
Then run:
```
docker-compose up
```
in the command line to build and execute the application.