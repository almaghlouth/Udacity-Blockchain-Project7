var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require("bignumber.js");

var Config = async function(accounts) {
  let owner = accounts[0];
  let firstAirline = accounts[0];

  let flightSuretyData = await FlightSuretyData.new();
  let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);
  //let linkApp = await flightSuretyData.setAppAddress(flightSuretyApp.address);

  return {
    owner: owner,
    firstAirline: firstAirline,
    weiMultiple: new BigNumber(10).pow(18),
    //accounts: accounts,
    flightSuretyData: flightSuretyData,
    flightSuretyApp: flightSuretyApp
  };
};

module.exports = {
  Config: Config
};
