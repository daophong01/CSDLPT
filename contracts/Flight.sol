// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Flight - quản lý chuyến bay on-chain.
 * - Chỉ các hãng (được xác thực qua AirlineRegistry) mới được tạo chuyến bay.
 * - Dữ liệu tối thiểu để mirror off-chain: flightId, flightCode, origin, destination, departure, arrival, airplaneHash.
 */
interface IAirlineRegistry {
    function isAirline(address a) external view returns (bool);
}

contract Flight {
    IAirlineRegistry public registry;

    struct FlightInfo {
        bytes32 flightId;
        string flightCode;
        string origin;       // IATA e.g., HAN
        string destination;  // IATA e.g., SGN
        uint256 departure;   // epoch seconds
        uint256 arrival;     // epoch seconds
        bytes32 airplaneHash;
        address issuer;      // airline
    }

    mapping(bytes32 => FlightInfo) public flights;

    event FlightCreated(
        bytes32 indexed flightId,
        string flightCode,
        string origin,
        string destination,
        uint256 departure,
        uint256 arrival,
        bytes32 airplaneHash,
        address indexed issuer
    );

    constructor(address _registry) {
        registry = IAirlineRegistry(_registry);
    }

    function createFlight(
        string memory flightCode,
        string memory origin,
        string memory destination,
        uint256 departure,
        uint256 arrival,
        bytes32 airplaneHash
    ) external {
        require(registry.isAirline(msg.sender), "not airline");
        require(arrival > departure, "arrival must be after departure");

        bytes32 fid = keccak256(abi.encodePacked(flightCode, origin, destination, departure, msg.sender));
        require(flights[fid].flightId == 0, "already exists");

        flights[fid] = FlightInfo({
            flightId: fid,
            flightCode: flightCode,
            origin: origin,
            destination: destination,
            departure: departure,
            arrival: arrival,
            airplaneHash: airplaneHash,
            issuer: msg.sender
        });

        emit FlightCreated(fid, flightCode, origin, destination, departure, arrival, airplaneHash, msg.sender);
    }
}