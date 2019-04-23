pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    struct Airline {
        uint id,
        string name,
        bool approved,
        bool active,
        uint balance,
        uint needed_votes,
        uint gained_votes
    }
    uint private airline_counter = 0;
    mapping(address => airline) airlines;
    mapping(address => mapping(address => bool)) voters_record;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AirlineRegistered(address _address,uint ID,uint name);
    event AirlineApproved(address _address,uint ID,uint name);

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (memory string _name,
                            address _address   
                            )
                            external
    {
        uint memory _id = airline_counter;
        if (airline_counter == 0) {
            Airline memory item = Airline(_id, _name, true, false, 0,0,0);
            airline_counter++;
            airlines[_address] = item;
            emit FlightRegistered(_address, _id, _name);
            emit FlightApproved(_address, _id, _name);
        } else if (airline_counter > 0 && airline_counter =< 4) {
            require(airlines[msg.sender].approved == true, "This transaction must be done by from an account of an approvedd airline");
            Airline memory item = Airline(_id, _name, true, false, 0,1,1);
            airline_counter++;
            airlines[_address] = item;
            emit FlightRegistered(_address, _id, _name);
            emit FlightApproved(_address, _id, _name);
        } else if (airline_counter > 4) {
            //require(airlines[msg.sender].approved == true, "This transaction must be done by from an account of an approvedd airline");
            uint _needed = ((_id / 2 ) + ( _id % 2 ))
            Airline memory item = Airline(_id, _name, false, false, 0,_needed,1);
            airline_counter++;
            airlines[_address] = item;
            emit FlightRegistered(_address, _id, _name);
        }
    }


    function registerAirline
                            (address _address)  
                            )
                            external
    {
        require(airlines[_address].approved == true, "This Airline already got approved");
        require(airlines[msg.sender].approved == true, "This transaction must be done by from an account of an approvedd airline");
        require(voters_record[_address][msg.sender] == true, "This account already approved this airline");
        airlines[_address].gained_votes++;
        voters_record[_address][msg.sender]=true;
        if (airlines[_address].gained_votes == airlines[_address].needed_votes) {
            airlines[_address].approved = true;
            emit FlightRegistered(_address,  airlines[_address].id,  airlines[_address].name);
        }
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

