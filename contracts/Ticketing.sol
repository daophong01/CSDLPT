// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Minimal demo Ticketing contract for airline-issued tickets.
 * Events are used to mirror data off-chain for reporting and search.
 * NOTE: This is a simplified example for educational purposes.
 */
interface IAirlineRegistry {
    function isAirline(address a) external view returns (bool);
}

contract Ticketing {
    struct Ticket {
        uint256 id;
        bytes32 flightId;      // keccak256(flightCode|departure)
        address owner;
        uint256 price;
        bytes32 classCode;     // ECONOMY, BUSINESS...
        uint8 status;          // 0:ISSUED 1:PURCHASED 2:TRANSFERRED 3:CANCELED
    }

    IAirlineRegistry public registry;
    address public admin;
    mapping(uint256 => Ticket) public tickets;
    uint256 public counter;

    event TicketIssued(uint256 indexed id, bytes32 flightId, uint256 price, bytes32 classCode);
    event TicketPurchased(uint256 indexed id, address indexed buyer, uint256 price);
    event TicketTransferred(uint256 indexed id, address indexed from, address indexed to);
    event TicketCanceled(uint256 indexed id);

    modifier onlyAdmin() { require(msg.sender == admin, "not admin"); _; }

    constructor(address _registry) {
        admin = msg.sender;
        registry = IAirlineRegistry(_registry);
    }

    function issueTicket(bytes32 flightId, uint256 price, bytes32 classCode) external {
        require(registry.isAirline(msg.sender), "not airline");
        counter++;
        tickets[counter] = Ticket(counter, flightId, msg.sender, price, classCode, 0);
        emit TicketIssued(counter, flightId, price, classCode);
    }

    function buy(uint256 id) external payable {
        Ticket storage t = tickets[id];
        require(t.status == 0, "not available");
        require(msg.value == t.price, "incorrect payment");
        address seller = t.owner;
        t.owner = msg.sender;
        t.status = 1;
        emit TicketPurchased(id, msg.sender, t.price);
        // Forward funds to seller (airline). In production, add reentrancy guard and checks-effects-interactions pattern.
        payable(seller).transfer(msg.value);
    }

    function transferTicket(uint256 id, address to) external {
        Ticket storage t = tickets[id];
        require(t.owner == msg.sender, "not owner");
        t.owner = to;
        t.status = 2;
        emit TicketTransferred(id, msg.sender, to);
    }

    function cancel(uint256 id) external {
        Ticket storage t = tickets[id];
        require(registry.isAirline(msg.sender) || msg.sender == admin, "no permission");
        t.status = 3;
        emit TicketCanceled(id);
    }
}