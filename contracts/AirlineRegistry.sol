// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * AirlineRegistry - quản lý danh sách hãng hàng không được phép phát hành vé/chuyến bay.
 * - Admin có quyền thêm/xoá hãng.
 * - Các hợp đồng khác (Ticketing/Flight) sẽ gọi isAirline(addr) để kiểm tra quyền.
 */
contract AirlineRegistry {
    address public admin;
    mapping(address => bool) private airlines;

    event AirlineAdded(address indexed airline);
    event AirlineRemoved(address indexed airline);

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addAirline(address airline) external onlyAdmin {
        airlines[airline] = true;
        emit AirlineAdded(airline);
    }

    function removeAirline(address airline) external onlyAdmin {
        airlines[airline] = false;
        emit AirlineRemoved(airline);
    }

    function isAirline(address a) external view returns (bool) {
        return airlines[a];
    }
}