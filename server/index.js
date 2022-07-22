const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const Moralis = require("moralis/node");
require('dotenv').config();
const { connectToDatabase } = require("./util/mongoose");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dataFeed = require("./dataFeed");
const predictions = require("./predictions");
const transactions = require("./transactions");
const bets = require("./bets");
const users = require("./users");

const PORT = process.env.PORT || 3001;

const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;
const masterKey = process.env.MORALIS_MASTER_KEY;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  }
});

io.on('connection', (socket) => {
  socket.on('request_data_feed', (feed) => {
    console.log(`feedAddress: ${feed.feedAddress}`);
    console.log(`User Id: ${socket.client.id}`);
    socket.join(feed.feedAddress);
    dataFeed.getChainlinkFeed(io, feed);
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);
  await Moralis.start({ serverUrl, appId, masterKey });
  await connectToDatabase();
});

app.get('/getLatestDataRound', async (req, res) => {
  const { address, pair } = req.query;
  if(!address || !pair) {
    res.status(400).send('Missing address or pair');
    return;
  }
  let latestRound = await dataFeed.getLatestDataRound(address, pair);
  res.send(latestRound);
});

app.post('/addPrediction', async (req, res) => {
  const prediction  = req.body;

  const predictionData = {
    ...prediction,
    expiryTime: new Date(prediction.expiryTime),
    predictionDeadline: new Date(prediction.predictionDeadline),
    openingPredictionTime: new Date(prediction.openingPredictionTime),
  }
  
  return await predictions.createPrediction(res, predictionData);
});


app.get('/getPredictions', async (req, res) => {
  const searchQuery  = req.body;
  
  return await predictions.getPredictions(res, searchQuery);
});

app.get('/scheduleDailyPredictions', async (req, res) => {
  const { address, pair } = req.body;
  if(!address || !pair) {
    res.status(400).send('Missing address or pair');
    return;
  }
  const predictions = await predictions.addPredictionsDaily(res, address, pair)
  res.send(predictions);
});

app.post('/escrowTransferSOL', async (req, res) => {
  const { toAddress, amount } = req.body;
  if(!toAddress || !amount) {
    res.status(400).send('Missing toAddress or amount');
    return;
  }
  const solTransfer = await transactions.escrowTransferSOL(toAddress, amount)
  res.send(solTransfer);
});

app.post('/addBet', async (req, res) => {
  const bet = req.body;
  
  return await bets.createBet(res, bet);
});

app.get('/getBet/:betId', async (req, res) => {
  const betId = req.params.betId;

  return await bets.getBet(res, betId);
});

app.get('/getBets', async (req, res) => {
  const searchQuery  = req.body;

  return await bets.getBets(res, searchQuery);
});


app.post('/addUser', async (req, res) => {
  const user = req.body;
  
  return await users.createUser(res, user);
});

app.get('/getUser', async (req, res) => {
  const searchQuery  = req.body;

  return await users.getUser(res, searchQuery);
});

app.get('/getUsers', async (req, res) => {
  const searchQuery  = req.body;

  return await users.getUsers(res, searchQuery);
});