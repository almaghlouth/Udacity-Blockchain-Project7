pragma solidity 0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    address private app;

    struct Airline {
        uint id;
        string name;
        bool approved;
        bool active;
        uint balance;
        uint reserved;
        uint needed_votes;
        uint gained_votes;
    }
    uint private airline_counter = 0;
    mapping(address => Airline) airlines;
    mapping(address => mapping(address => bool)) voters_record;

    struct Passenger {
        address passenger_address;
        uint balance;
    }

    mapping(address => Passenger) passengers;

    uint private policies_counter = 0;
    struct Insurance {
        address holder;
        address airline_address;
        uint flight_id;
        uint departure_time;
        uint cost;
        bool claimed;        
    }

    mapping(uint => Insurance) insurances;

    struct Flight {
        address airline_address;
        uint flight_id;
        uint departure_time;
        bool registred;
        uint status;
    }

    //airline address => flight no => departure => status
    mapping(address => mapping(uint => mapping(uint => uint))) flights;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AirlineRegistered(address _address, uint id, string name);
    event AirlineApproved(address _address, uint id, string name);
    event AirlineActivated(address _address, uint id, string name);

    event InsuranceBought(uint policy, address holder,uint flight_id, uint depature_time, uint price);
    event InsuranceClaimed(uint policy, address holder,uint flight_id, uint depature_time, uint amount);
    event BalanceWithdraw(address holder, uint amount);


    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    
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
    
    //enhance the contract protection post deployment to only recive from App
    modifier fromAppAdress()
    {
        require(app == address(0) || msg.sender == app, "Caller is not the linked application");
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
                            (address _from,
                            string _name,
                            address _address   
                            )
                            external
                            requireIsOperational
                            fromAppAdress
    {
        require((airlines[_address].approved == false), "Already registred");
        uint _id = airline_counter;
        if (airline_counter == 0) {
            Airline memory item = Airline(_id, _name, true, false, 0,0,0,0);
            airline_counter++;
            airlines[_address] = item;
            emit AirlineRegistered(_address, _id, _name);
            emit AirlineApproved(_address, _id, _name);
        } else if (airline_counter > 0 && airline_counter <= 4) {
            require((airlines[_from].approved == true && airlines[_from].active == true), "This transaction must be done by from an account of an approved and active airline");
            Airline memory item2 = Airline(_id, _name, true, false, 0,0,1,1);
            airline_counter++;
            airlines[_address] = item2;
            emit AirlineRegistered(_address, _id, _name);
            emit AirlineApproved(_address, _id, _name);
        } else if (airline_counter > 4) {
            //require(airlines[msg.sender].approved == true, "This transaction must be done by from an account of an approvedd airline");
            require(_address == _from, "Must registre from same account");
            uint _needed = ((_id / 2 ) + ( _id % 2 ));
            Airline memory item3 = Airline(_id, _name, false, false, 0, 0,_needed,1);
            airline_counter++;
            airlines[_address] = item3;
            emit AirlineRegistered(_address, _id, _name);
        }
    }

   function AirlineStatus
                            (address _address)
                            external view
                            requireIsOperational
                            fromAppAdress
                            returns (bool status)
    {
        return airlines[_address].approved && airlines[_address].active;
    }

    function approveAirline
                            (address _from,
                            address _address)  
                            external
                            requireIsOperational
                            fromAppAdress
    {
        require(airlines[_address].approved == true, "This Airline already got approved");
        require(airlines[_from].approved == true, "This transaction must be done by from an account of an approvedd airline");
        require(voters_record[_address][_from] == true, "This account already approved this airline");
        airlines[_address].gained_votes++;
        voters_record[_address][_from]=true;
        if (airlines[_address].gained_votes == airlines[_address].needed_votes) {
            airlines[_address].approved = true;
            emit AirlineRegistered(_address,  airlines[_address].id,  airlines[_address].name);
        }
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (address _from,
                            address _airline_address,
                            uint _flight_id,
                            uint _departure_time
                            )
                            external
                            payable
                            requireIsOperational
                            fromAppAdress
    {
        //1000000000000000000
        require(msg.value <= 1000000000000000000, "Cannot buy insurance for more than 1 ether");
        require(((msg.value * 3) / 2) <= (airlines[_airline_address].balance - airlines[_airline_address].reserved), "The request Airline is sold out of insurances");
        Insurance memory item = Insurance(_from,_airline_address, _flight_id, _departure_time, msg.value, false);
        uint count = policies_counter;
        insurances[count] = item;
        policies_counter++;
        airlines[_airline_address].reserved = airlines[_airline_address].reserved + ((msg.value * 3)/2);
        airlines[_airline_address].balance = airlines[_airline_address].reserved + msg.value;
        emit InsuranceBought(count,_from,_flight_id,_departure_time,msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (address _from,
                                uint _policy
                                )
                                external
                                requireIsOperational
                                fromAppAdress
                               
    {
        require(insurances[_policy].claimed == false, "Policy Already Claimed");
        require(flights[insurances[_policy].airline_address][insurances[_policy].flight_id][insurances[_policy].departure_time] == 20,"The current flight status is not delayed duo to airline failure");
        require((airlines[insurances[_policy].airline_address].balance >= ((insurances[_policy].cost * 3)/ 2 )) && (airlines[insurances[_policy].airline_address].reserved >= ((insurances[_policy].cost * 3)/2)),"The airline cannot provide insurance payment at the moment");
        insurances[_policy].claimed = true;
        airlines[insurances[_policy].airline_address].balance = airlines[insurances[_policy].airline_address].balance - ((insurances[_policy].cost * 3)/ 2 );
        airlines[insurances[_policy].airline_address].reserved = airlines[insurances[_policy].airline_address].reserved - ((insurances[_policy].cost * 3)/ 2 );
        passengers[_from].balance = passengers[_from].balance + ((insurances[_policy].cost * 3)/ 2 );
        emit InsuranceClaimed(_policy,insurances[_policy].holder,insurances[_policy].flight_id,insurances[_policy].departure_time,((insurances[_policy].cost * 3)/ 2 ));
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (address _from)
                            external
                            requireIsOperational
                            fromAppAdress         
    {
        require(passengers[_from].balance > 0,"The account balance is currently empty");
        uint sum = passengers[_from].balance;
        passengers[_from].balance = 0;
        address temp = _from;
        temp.transfer(sum);
        emit BalanceWithdraw(temp,sum);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (address _from
                            )
                            external
                            payable
                            requireIsOperational
                            fromAppAdress
    {
        require(airlines[_from].approved == true, "This transaction must be done by from an account of an approvedd airline");
        require(msg.value >= 10000000000000000000, "The Value must be 10 ether more");
        //1000000000000000000
            airlines[_from].balance = msg.value;
            airlines[_from].active = true;
            emit AirlineActivated(_from,  airlines[_from].id,  airlines[_from].name);

    }
    
    function setAppAddress (address _app) public requireContractOwner {
        app = _app;
    }
    
    //airline address => flight no => departure => status
    
    function setFlightStatus (address _airline_address,
                            uint _flight_id,
                            uint _departure_time,
                            uint _status) 
                            external
                            requireIsOperational
                            fromAppAdress
    {
        //sec
        flights[_airline_address][_flight_id][_departure_time] = _status;
    }
    
    function getFlightStatus (address _airline_address,
                            uint _flight_id,
                            uint _departure_time) 
                            external
                            view
                            requireIsOperational
                            returns (uint status)
                            
    {
        //sec
        return flights[_airline_address][_flight_id][_departure_time];
    }
    
    /*
    function getAirlineInfo (address _address) external requireIsOperational 
    returns (){
    
     
    }
  */  
/*
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
        */
    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() public payable 
    {
        //fund();
    }


}

