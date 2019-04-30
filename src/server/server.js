import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";
import express from "express";

let config = Config["localhost"];
let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.url.replace("http", "ws"))
);
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(
  FlightSuretyApp.abi,
  config.appAddress
);
//create 5 airlines for the dapp
/*
const fs = require("fs");

let list = [
  { Name: "one", Value: "ss" },
  { Name: "2", Value: "ss" },
  { Name: "2", Value: "ss" }
];

fs.writeFileSync(
  __dirname + "/../src/dapp/airlines.json",
  JSON.stringify(list, null, "\t"),
  "utf-8"
);
*/

//oracles code

let key = 0;

let oracles = [];

var x;

let responses = [0, 10, 20, 20, 20, 30, 40, 50, 20, 20];

//let accounts = web3.eth.accounts;
web3.eth.getAccounts(async (error, accounts) => {
  //create 20+ accounts
  for (var i = 1; i < 45; i++) {
    await flightSuretyApp.registerOracle({
      from: accounts[i],
      value: 1000000000000000000
    });
    let result = await flightSuretyApp.getMyIndexes.call({
      from: accounts[i]
    });
    console.log(
      `          Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`
    );
    oracles.push({
      address: accounts[i],
      index1: result[0],
      index2: result[1],
      index3: result[2]
    });
  }

  //watch events give semi random response status

  for (var i = 0; i < oracles.length; i++) {
    if (
      oracles[i].index1 == key ||
      oracles[i].index2 == key ||
      oracles[i].index2 == key
    ) {
      console.log("add: " + oracles[i].address);
      x = Math.floor(Math.random() * 10);
      console.log("res: " + responses[x]);
    }
  }
});
//console.log(test);

const app = express();
app.get("/api", (req, res) => {
  res.send({
    message: "An API for use with your Dapp!"
  });
});

export default app;
