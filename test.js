const fs = require("fs");

let list = [
  { Name: "one", Value: "ss" },
  { Name: "2", Value: "ss" },
  { Name: "2", Value: "ss" }
];

fs.writeFileSync(
  __dirname + "/src/dapp/airlines.json",
  JSON.stringify(list, null, "\t"),
  "utf-8"
);

/*
let key = 0;

let oracles = [];

var x;

let responses = [0, 10, 20, 20, 20, 30, 40, 50, 20, 20];

for (var i = 1; i < 45; i++) {
  let result = [
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10)
  ];
  console.log(
    `          Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`
  );
  oracles.push({
    address: Math.floor(Math.random() * 1000),
    index1: result[0],
    index2: result[1],
    index3: result[2]
  });
}

//watch
key = Math.floor(Math.random() * 10);

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
*/
