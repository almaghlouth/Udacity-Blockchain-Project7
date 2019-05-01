# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`npm install -g ganache-cli`
`npm install -g truffle`

## test contract

To run truffle tests:

1. `npm install`
2. `truffle develop`
3. `compile --reset`
4. `test`

## testing the full system

you will need a seprate window or instance for each of the following:

1. start 50 test accounts locally
   `ganache-cli -a 50`
2. Compile and migrate the accounts
   `truffle compile --reset`
   then
   `truffle migarte --reset`
3. Run server to initiate oracles and Airlines
   `npm run server`
4. Run the website
   `npm run dapp`

To view dapp:

`http://localhost:8000`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder

## Resources

- [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
- [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
- [Truffle Framework](http://truffleframework.com/)
- [Ganache Local Blockchain](http://truffleframework.com/ganache/)
- [Remix Solidity IDE](https://remix.ethereum.org/)
- [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
- [Ethereum Blockchain Explorer](https://etherscan.io/)
- [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)
