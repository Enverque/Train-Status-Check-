# Train Ticket PNR Status & Live Train Location Website

A full-stack web application to check **Indian Railway PNR status** and **track live train location** using a valid PNR number or train number. Built using **React**, **Node.js**, and public APIs via **RapidAPI**.

---

## Features

- Search by 10-digit **PNR Number**
- View real-time **PNR status**, including:
  - Train number
  - Boarding and destination stations
  - Date of journey
  - Passenger booking and current status
- Get **live train location**
  - Shows current station, delay info, next halt
  - Uses train number from PNR data or manual input
- Responsive and user-friendly interface
- Input validation and error handling

---

## ⚙️ Technologies Used

| Layer       | Tools                              |
|-------------|------------------------------------|
| Frontend    | React (Vite)                       |
| Styling     | CSS                                |
| Backend     | Node.js + Express.js               |
| HTTP Client | Axios                              |
| API         | RapidAPI – IRCTC + Live Train APIs |

---

## How It Works

1. User enters a valid **PNR number**
2. Frontend sends a request to the backend
3. Backend sends an API request to the RapidAPI IRCTC endpoint
4. Response is parsed and sent back to the frontend
5. User sees PNR details and live train location

### APIs Used

- 📍 [Live Train Location API (Train Running Status)](https://rapidapi.com/)

---

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Enverque/Train-Status-Check-.git
cd Train-Status-Check-
```

### 2. Start the backend

```bash
cd Server
npm install
node server.js
```

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
```