//var Test = require("../config/testConfig.js");
var FlightSuretyApp = artifacts.require("./FlightSuretyApp.sol");
var FlightSuretyData = artifacts.require("./FlightSuretyData.sol");
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

contract("Flight Surety Tests", async accounts => {
  var config;
  before("setup contract", async () => {
    config = await Config(accounts);

    //access data only through app
    await config.flightSuretyData.setAppAddress(
      config.flightSuretyApp.address,
      {
        from: accounts[0]
      }
    );
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`App Contract has correct initial isOperational() value`, async function() {
    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`Data Contract has correct initial isOperational() value`, async function() {
    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`Airline not active until funded`, async function() {
    // Get operating status
    let status = await config.flightSuretyApp.AirlineStatus.call(accounts[0]);
    assert.equal(status, false, "Incorrect initial status value");
  });

  it(`Can block access to setOperatingStatus() for non-Contract Owner account`, async function() {
    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false, {
        from: accounts[2]
      });
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
  });

  it("(airline) cannot register an Airline using registerAirline() if it is not funded and Approved", async () => {
    // ACT

    let accessDenied = false;
    try {
      await config.flightSuretyApp.registerAirline("Air Three", accounts[2], {
        from: accounts[0]
      });
    } catch (e) {
      accessDenied = true;
    }
    // ASSERT
    assert.equal(
      accessDenied,
      true,
      "Airline should not be able to register another airline if it hasn't provided funding"
    );
  });

  it("Only existing airline may register a new airline until there are at least four airlines registered", async () => {
    // ACT

    let accessDenied = false;
    try {
      await config.flightSuretyApp.registerAirline("Air Beta", accounts[2], {
        from: accounts[2]
      });
    } catch (e) {
      accessDenied = true;
    }
    // ASSERT
    assert.equal(accessDenied, true);
  });

  it("5th Airline and more will need voting for approval", async () => {
    // ACT

    await config.flightSuretyApp.fund({
      from: accounts[0],
      value: 10000000000000000000
    });
    await config.flightSuretyApp.registerAirline("Air Beta", accounts[2], {
      from: accounts[0]
    });
    await config.flightSuretyApp.registerAirline("Air Delta", accounts[3], {
      from: accounts[0]
    });
    await config.flightSuretyApp.registerAirline("Air Sigma", accounts[4], {
      from: accounts[0]
    });
    await config.flightSuretyApp.registerAirline("Air Alpha", accounts[5], {
      from: accounts[5]
    });
    let status = await config.flightSuretyApp.AirlineStatus.call(accounts[5]);

    // ASSERT
    assert.equal(status, false);
  });

  it("5th Airline can be approved with 50% votes", async () => {
    //activate air 2-3
    await config.flightSuretyApp.fund({
      from: accounts[2],
      value: 10000000000000000000
    });

    await config.flightSuretyApp.fund({
      from: accounts[3],
      value: 10000000000000000000
    });

    // voting
    await config.flightSuretyApp.approveAirline(accounts[5], {
      from: accounts[2]
    });
    await config.flightSuretyApp.approveAirline(accounts[5], {
      from: accounts[3]
    });
    //funding 5th airline
    await config.flightSuretyApp.fund({
      from: accounts[5],
      value: 10000000000000000000
    });
    let status = await config.flightSuretyApp.AirlineStatus.call(accounts[5]);

    // ASSERT
    assert.equal(status, true);
  });

  const TEST_ORACLES_COUNT = 10;
  const STATUS_CODE_UNKNOWN = 0;
  const STATUS_CODE_ON_TIME = 10;
  const STATUS_CODE_LATE_AIRLINE = 20;
  const STATUS_CODE_LATE_WEATHER = 30;
  const STATUS_CODE_LATE_TECHNICAL = 40;
  const STATUS_CODE_LATE_OTHER = 50;

  it("can register oracles", async () => {
    await config.flightSuretyApp.registerOracle({
      from: accounts[8],
      value: 1000000000000000000
    });
    let result = await config.flightSuretyApp.getMyIndexes.call({
      from: accounts[8]
    });
    console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
  });
});
