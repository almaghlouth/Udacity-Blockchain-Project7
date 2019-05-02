import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import FlightSuretyData from "../../build/contracts/FlightSuretyData.json";
import Config from "./config.json";
import { default as Web3 } from "web3";

let config = Config["localhost"];
let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.url.replace("http", "ws"))
);
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(
  FlightSuretyApp.abi,
  config.appAddress
);
let flightSuretyData = new web3.eth.Contract(
  FlightSuretyData.abi,
  config.dataAddress
);

function setDetails(message, num) {
  const status = document.getElementById("details" + num);
  status.innerHTML = message;
}

web3.eth.getAccounts(async (error, accounts) => {
  //fill select menus
  var m = document.getElementById("Airline1");
  m.innerHTML =
    m.innerHTML +
    '<option value="' +
    accounts[0] +
    '"> Air One </option><option value="' +
    accounts[10] +
    '"> Air Delta </option><option value="' +
    accounts[11] +
    '"> Air Sigma </option>';
  m = document.getElementById("Airline2");
  m.innerHTML =
    m.innerHTML +
    '<option value="' +
    accounts[0] +
    '"> Air One </option><option value="' +
    accounts[10] +
    '"> Air Delta </option><option value="' +
    accounts[11] +
    '"> Air Sigma </option>';

  //let res = await flightSuretyApp.methods.isOperational().call();

  //s
  document.getElementById("Go1").addEventListener("click", function() {
    var air = document.getElementById("Airline1").value;
    var flight = document.getElementById("Flight1").value;
    var time = document.getElementById("Departure1").value;
    let res = flightSuretyApp.methods
      .getFlightStatus(air, flight, time)
      .call()
      .then(res => {
        return res;
        //await res;
      })
      .catch(res => {
        return res;
      });
    if (res == "10") {
      setDetails("flight status ON TIME", "1");
    } else if (res == "20") {
      setDetails("flight status LATE DUE TO AIRLINE", "1");
    } else if (res == "30") {
      setDetails("flight status LATE DUE TO WEATHER", "1");
    } else if (res == "40") {
      setDetails("flight status LATE DUE TECHNICAL", "1");
    } else if (res == "50") {
      asetDetails("flight status LATE DUE OTHER", "1");
    } else if (res == "0") {
      setDetails("flight status UNKNOWN", "1");
      flightSuretyApp.methods.fetchFlightStatus(air, flight, time).send({
        from: accounts[0],
        gas: 3000000
      });
    } else {
      setDetails(res, "1");
    }
  });
  //e

  //s
  document.getElementById("Go2").addEventListener("click", async function() {
    var air = document.getElementById("Airline2").value;
    var flight = document.getElementById("Flight2").value;
    var time = document.getElementById("Departure2").value;
    var price = document.getElementById("Price2").value;
    var res;
    flightSuretyApp.methods
      .buy(air, flight, time)
      .send({
        from: accounts[0],
        value: price,
        gas: 3000000
      })
      .catch(res => {
        console.log(res);
        setDetails(res, "2");
      })
      .then(async () => {
        //console.log(res);
        flightSuretyData.events.InsuranceBought(
          {
            fromBlock: "latest"
          },
          async function(error, result) {
            //await result;
            if (error) {
              console.log(error);
              setDetails(error, "2");
            }
            await result.returnValues;
            if (result.returnValues.holder == accounts[0]) {
              console.log(result.returnValues.policy);
              setDetails("Policy Bought: " + result.returnValues.policy, "2");
            }
            /*
            console.log(await result.returnValues.policy);
            setDetails(
              "Policy Bought: " + (await result.returnValues.policy),
              "2"
            );
            */
          }
        );
      });
  });
  //e

  //s
  document.getElementById("Go3").addEventListener("click", function() {
    var policy = document.getElementById("Policy3").value;
    var res;
    flightSuretyApp.methods
      .creditInsurees(policy)
      .send({
        from: accounts[0],
        gas: 3000000
      })
      .then(async () => {
        //console.log(res);
        await flightSuretyData.events.InsuranceClaimed(
          {
            fromBlock: "latest"
          },
          async function(error, result) {
            await result;
            if (result.returnValues.policy == policy) {
              console.log(result.returnValues.policy);
              await setDetails(
                "Policy Claimed: " +
                  result.returnValues.policy +
                  "   Awarded Amount: " +
                  result.returnValues.amount,
                "2"
              );
            }
          }
        );
      })
      .catch(res => {
        console.log(res);
        setDetails(res, "3");
      });
  });
  //e

  //s
  document.getElementById("Go4").addEventListener("click", function() {
    var res;
    flightSuretyApp.methods
      .pay()
      .send({
        from: accounts[0],
        gas: 3000000
      })
      .then(async () => {
        //console.log(res);
        await flightSuretyData.events.BalanceWithdraw(
          {
            fromBlock: "latest"
          },
          async function(error, result) {
            await SpeechRecognitionResultList;
            if (result.returnValues.holder == accounts[0]) {
              console.log(result.returnValues.amount);
              setDetails(
                "Balance Withdrawn: " +
                  result.returnValues.policy +
                  "   Amount: -" +
                  result.returnValues.amount,
                "2"
              );
            }
          }
        );
      })
      .catch(res => {
        console.log(res);
        setDetails(res, "4");
      });
  });
  //e
});

/* disabled for testing reasons will be acitve on released version 



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
    "No web3 detected. Falling back to http://127.0.0.1:9545." +
      " You should remove this fallback when you deploy live, as it's inherently insecure." +
      " Consider switching to Metamask for development." +
      " More info here: http://truffleframework.com/tutorials/truffle-and-metamask"
  );
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  window.web3 = new Web3(
    new Web3.providers.HttpProvider("http://127.0.0.1:8545")
  );

}
  */
