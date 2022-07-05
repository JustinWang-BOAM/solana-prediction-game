const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dataFeed = require("./dataFeed");
const predictions = require("./predictions");
const transactions = require("./transactions");

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.get('/getLatestDataRound', async (req, res) => {
  const { address, pair } = req.query;
  let latestRound = await dataFeed.getLatestDataRound(address, pair);
  res.send(latestRound);
});

app.post('/addPrediction', async (req, res) => {
  const prediction  = req.body;

  await Moralis.start({ serverUrl, appId, masterKey });
  
  const predictionData = await predictions.createPrediction({
    ...prediction,
    expiryTime: new Date(prediction.expiryTime),
    predictionDeadline: new Date(prediction.predictionDeadline),
    openingPredictionTime: new Date(prediction.openingPredictionTime),
  });

  res.send(predictionData);
});

/* Moralis init code */
const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;
const masterKey = process.env.MORALIS_MASTER_KEY;

app.get('/scheduleDailyPredictions', async (req, res) => {
  const { address, pair } = req.body;
  await Moralis.start({ serverUrl, appId, masterKey });
  const predictions = await predictions.addPredictionsDaily(address, pair)
  res.send(predictions);
});

app.post('/escrowTransferSOL', async (req, res) => {
  const { toAddress, amount } = req.body;
  const solTransfer = await transactions.escrowTransferSOL(toAddress, amount)
  res.send(solTransfer);
});
