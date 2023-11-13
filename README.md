# HTTP-Round-Robin-API
These project is to simulate on how to calculate total fare of a public transport.
It receive a CSV contain a list of trips (routes and its time), then calculate the total fare of all the trips. The example csv can be found here --> https://github.com/zakiarsyad/fee-calculator/blob/master/example.csv

## Run it locally
We can run this project by running these commmands:
```
npm install
npm run build
npm run start
```

Or if can run it in a Docker with these commmands:
```
docker build -t fee-calculator  -f Dockerfile .
docker run -p 3000:3000 fee-calculator
```

## Run the test
To run the test, we can use this command:
```
npm run test
```