// this java script got recycled from project 5 and extended to support the current project
import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import { default as Web3 } from "web3";
//import { default as contract } from "truffle-contract";

//import DCSSCArtifact from "../../build/contracts/DCSSC.json";

//const DCSSC = contract(DCSSCArtifact);

let accounts;
let account;

const fstatus = async () => {
  const self = this;
  //const instance = await flightSuretyApp.deployed();
  const a = document.getElementById("Airline1").value;
  const f = document.getElementById("Flight1").value;
  const d = document.getElementById("Departure1").value;
  const item1 = await self.flightSuretyApp.getFlightStatus(a, f, d, {
    from: account
  });
  setDetails(item1, "1");
};

const App = {
  start: function() {
    const self = this;

    //DCSSC.setProvider(web3.currentProvider);

    let config = Config["localhost"];
    let web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    let flightSuretyApp = new this.web3.eth.Contract(
      FlightSuretyApp.abi,
      config.appAddress
    );

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length === 0) {
        alert(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }

      accounts = accs;
      account = accounts[0];
    });
  },

  setDetails: function(message, num) {
    const status = document.getElementById("details" + num);
    status.innerHTML = message;
  },

  status: function() {
    fstatus();
  }
};

window.App = App;

window.addEventListener("load", function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== "undefined") {
    console.warn(
      "Using web3 detected from external source." +
        " If you find that your accounts don't appear or you have 0 MetaCoin," +
        " ensure you've configured that source properly." +
        " If using MetaMask, see the following link." +
        " Feel free to delete this warning. :)" +
        " http://truffleframework.com/tutorials/truffle-and-metamask"
    );
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545." +
        " You should remove this fallback when you deploy live, as it's inherently insecure." +
        " Consider switching to Metamask for development." +
        " More info here: http://truffleframework.com/tutorials/truffle-and-metamask"
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545")
    );
  }

  App.start();
});
