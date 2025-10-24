# Airline Blockchain — Hệ thống quản lý vé máy bay bằng NFT

[![Contracts CI](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/contracts.yml?label=contracts-ci)](#)
[![Backend CI](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/backend.yml?label=backend-ci)](#)
[![Frontend CI](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/frontend.yml?label=frontend-ci)](#)

Dự án fullstack gồm 3 phần: smart-contracts (Solidity + Hardhat), backend (Node.js/Express + MongoDB + ethers.js), frontend (Next.js + Web3/MetaMask).

## Cấu trúc

airline-blockchain/
├── smart-contracts/
│   ├── contracts/
│   │   └── AirlineTicketNFT.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   ├── AirlineTicket.test.js
│   │   └── AirlineTicket.more.test.js
│   ├── hardhat.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── models/ (Flight.js, Ticket.js, User.js)
│   │   ├── routes/ (flights.js, tickets.js, users.js, analytics.js)
│   │   ├── services/ (blockchainService.js)
│   │   └── server.js
│   ├── tests/ (api.test.js, tickets.test.js)
│   ├── jest.config.js
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── components/ (FlightSearchForm.jsx, FlightResults.jsx, BookingForm.jsx, MyTickets.jsx, TicketCard.jsx, TransferTicketModal.jsx, AnalyticsDashboard.jsx, WalletConnect.jsx)
│   ├── pages/ (index.js, flights/search.js, booking/[flightId].js, my-tickets.js, ticket/[tokenId].js, analytics.js)
│   ├── services/ (web3Service.js)
│   ├── styles/globals.css
│   ├── jest.config.js, jest.setup.js, .babelrc
│   ├── next.config.js
│   └── package.json
├── .github/workflows/ (contracts.yml, backend.yml, frontend.yml)
└── docker-compose.yml

## Thiết lập

### Smart Contracts
1) Vào thư mục smart-contracts, tạo file .env từ .env.example và điền:
   - PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY, COINMARKETCAP_API_KEY
2) Cài dependencies:
   - npm install
3) Compile và deploy:
   - npx hardhat compile
   - npx hardhat run scripts/deploy.js --network sepolia
4) Kết quả:
   - Lưu địa chỉ hợp đồng vào deployments.json
   - Export ABI sang backend và frontend (services sẽ dùng ABI này)

### Backend
1) Vào thư mục backend, tạo .env từ .env.example:
   - MONGODB_URI, ETHEREUM_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS, PORT, JWT_SECRET, SENDGRID_API_KEY
2) Cài dependencies:
   - npm install
3) Chạy backend:
   - npm run dev
4) Test + Coverage:
   - npm test

### Frontend
1) Vào thư mục frontend, tạo .env.local từ .env.example:
   - NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CONTRACT_ADDRESS, NEXT_PUBLIC_CHAIN_ID, NEXT_PUBLIC_ETHERSCAN_URL
2) Cài dependencies:
   - npm install
3) Chạy frontend:
   - npm run dev
4) Test + Coverage:
   - npm test

## Tính năng
- Tìm kiếm chuyến bay, đặt vé NFT, chuyển nhượng, check-in, huỷ vé.
- Analytics dashboard với charts.
- UI/UX responsive, MetaMask integration.
- Testing coverage >80% (Hardhat/Jest/RTL) — CI kiểm thử tự động.

## Ghi chú bảo mật
- Hợp đồng dùng Ownable, ReentrancyGuard, input validation.
- Backend có rate limiting, Helmet, JWT.
- Frontend xử lý Web3 events, chống XSS/CSRF.