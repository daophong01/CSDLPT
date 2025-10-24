// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * AirlineTicketNFT
 * - Vé máy bay là NFT ERC721.
 * - Quản lý chuyến bay và vé với các điều kiện nghiệp vụ cơ bản.
 * - Dùng cho mục đích demo/giáo dục: cần audit trước khi sản xuất.
 */
contract AirlineTicketNFT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Flight {
        string flightNumber;
        string airline;
        string departureAirport;
        string arrivalAirport;
        uint256 departureTime; // epoch seconds
        uint256 arrivalTime;   // epoch seconds
        uint256 totalSeats;
        uint256 availableSeats;
        bool isActive;
    }

    struct Ticket {
        uint256 flightId;
        address passenger;
        string passengerName;
        string passportNumber;
        string seatNumber;
        uint256 price;
        string ticketClass; // ECONOMY/BUSINESS/FIRST
        bool isCheckedIn;
        bool isUsed;
        uint256 purchaseTime;
        bool isTransferable;
    }

    event FlightCreated(uint256 indexed flightId, string flightNumber, string airline);
    event TicketMinted(uint256 indexed tokenId, uint256 indexed flightId, address indexed passenger, uint256 price);
    event TicketTransferred(uint256 indexed tokenId, address indexed from, address indexed to, string newPassengerName);
    event CheckInCompleted(uint256 indexed tokenId, address indexed passenger);
    event TicketCancelled(uint256 indexed tokenId, address indexed passenger, uint256 refundAmount);

    // flights
    Flight[] public flights;
    // tokenId => Ticket
    mapping(uint256 => Ticket) public tickets;
    // per flight seat assignment tracking
    mapping(uint256 => mapping(string => bool)) private _seatTaken; // flightId => seatNumber => taken

    constructor() ERC721("Airline Ticket NFT", "ATN") {}

    modifier validFlight(uint256 flightId) {
        require(flightId < flights.length, "Invalid flight");
        _;
    }

    function createFlight(
        string calldata flightNumber,
        string calldata airline,
        string calldata departureAirport,
        string calldata arrivalAirport,
        uint256 departureTime,
        uint256 arrivalTime,
        uint256 totalSeats
    ) external onlyOwner {
        require(bytes(flightNumber).length > 0, "flightNumber required");
        require(bytes(airline).length > 0, "airline required");
        require(bytes(departureAirport).length > 0 && bytes(arrivalAirport).length > 0, "airports required");
        require(arrivalTime > departureTime, "arrivalTime must be after departureTime");
        require(totalSeats > 0, "totalSeats > 0");

        flights.push(Flight({
            flightNumber: flightNumber,
            airline: airline,
            departureAirport: departureAirport,
            arrivalAirport: arrivalAirport,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            totalSeats: totalSeats,
            availableSeats: totalSeats,
            isActive: true
        }));

        emit FlightCreated(flights.length - 1, flightNumber, airline);
    }

    function mintTicket(
        uint256 flightId,
        string calldata passengerName,
        string calldata passportNumber,
        string calldata seatNumber,
        string calldata ticketClass,
        bool isTransferable
    ) external payable nonReentrant validFlight(flightId) {
        Flight storage f = flights[flightId];
        require(f.isActive, "flight inactive");
        require(block.timestamp < f.departureTime, "past departure");
        require(f.availableSeats > 0, "no seats available");
        require(bytes(passengerName).length > 0 && bytes(passportNumber).length > 0, "name/passport required");
        require(bytes(seatNumber).length > 0, "seat required");
        require(!_seatTaken[flightId][seatNumber], "seat taken");

        uint256 price = calculateTicketPrice(ticketClass);
        require(msg.value == price, "incorrect price");

        // assign seat
        _seatTaken[flightId][seatNumber] = true;
        f.availableSeats -= 1;

        // mint NFT
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);

        tickets[tokenId] = Ticket({
            flightId: flightId,
            passenger: msg.sender,
            passengerName: passengerName,
            passportNumber: passportNumber,
            seatNumber: seatNumber,
            price: price,
            ticketClass: ticketClass,
            isCheckedIn: false,
            isUsed: false,
            purchaseTime: block.timestamp,
            isTransferable: isTransferable
        });

        emit TicketMinted(tokenId, flightId, msg.sender, price);
        // forward funds to owner (airline)
        payable(owner()).transfer(msg.value);
    }

    function transferTicket(
        uint256 tokenId,
        address to,
        string calldata newPassengerName
    ) external nonReentrant {
        require(_exists(tokenId), "token not exist");
        Ticket storage t = tickets[tokenId];
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(t.isTransferable, "non-transferable");
        require(!t.isUsed, "already used");
        require(!t.isCheckedIn, "already checked-in");
        require(bytes(newPassengerName).length > 0, "name required");

        _transfer(msg.sender, to, tokenId);
        t.passenger = to;
        t.passengerName = newPassengerName;

        emit TicketTransferred(tokenId, msg.sender, to, newPassengerName);
    }

    function checkIn(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "token not exist");
        Ticket storage t = tickets[tokenId];
        Flight storage f = flights[t.flightId];
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(!t.isCheckedIn, "already checked-in");
        require(block.timestamp + 2 hours <= f.departureTime, "check-in too late"); // must be at least 2h before departure

        t.isCheckedIn = true;
        emit CheckInCompleted(tokenId, msg.sender);
    }

    function cancelTicket(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "token not exist");
        Ticket storage t = tickets[tokenId];
        Flight storage f = flights[t.flightId];
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(!t.isUsed, "already used");
        require(block.timestamp + 6 hours <= f.departureTime, "cancellation too late"); // at least 6h before departure

        // refund 80% (20% fee)
        uint256 refund = (t.price * 80) / 100;
        t.isUsed = true; // mark consumed by cancellation
        _burn(tokenId);

        emit TicketCancelled(tokenId, msg.sender, refund);
        payable(msg.sender).transfer(refund);
    }

    function getTicketDetails(uint256 tokenId) external view returns (Ticket memory ticket, Flight memory flight) {
        require(_exists(tokenId), "token not exist");
        ticket = tickets[tokenId];
        flight = flights[ticket.flightId];
    }

    function getPassengerTickets(address passenger) external view returns (uint256[] memory tokenIds) {
        uint256 total = _tokenIdCounter.current();
        uint256 count = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_exists(i) && ownerOf(i) == passenger) {
                count++;
            }
        }
        tokenIds = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_exists(i) && ownerOf(i) == passenger) {
                tokenIds[idx++] = i;
            }
        }
    }

    function calculateTicketPrice(string calldata ticketClass) public pure returns (uint256) {
        // demo pricing: ECONOMY=0.01 ETH, BUSINESS=0.03 ETH, FIRST=0.05 ETH
        bytes32 cls = keccak256(abi.encodePacked(ticketClass));
        if (cls == keccak256("ECONOMY")) return 0.01 ether;
        if (cls == keccak256("BUSINESS")) return 0.03 ether;
        if (cls == keccak256("FIRST")) return 0.05 ether;
        revert("invalid class");
    }

    // admin controls
    function setFlightActive(uint256 flightId, bool active) external onlyOwner validFlight(flightId) {
        flights[flightId].isActive = active;
    }
}