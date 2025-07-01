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

| Layer       | Tools                             |
|-------------|-----------------------------------|
| Frontend    | React (Vite)                      |
| Styling     | CSS
| Backend     | Node.js + Express.js              |
| HTTP Client | Axios                             |
| API         | RapidAPI – IRCTC + Live Train APIs|

## How it Works

1. User enters a valid **PNR number**
2. Frontend sends a request to backend 
3. Backend sends API request to RapidAPI IRCTC endpoint
4. Response is parsed and sent back to frontend
5. User sees PNR details and live train location

   
### APIs Used
- 📍 [Live Train Location API (Train Running Status)](https://rapidapi.com/)


## How to Run Locally Step-by-Step Instructions

### 1. Clone the GitHub Repository

```bash
git clone https://github.com/Enverque/Train-Status-Check-.git
cd Train-Status-Check-
```

  
  ### 2. Start the Backend
  
  ```bash
  cd Server
  npm install
  node main.js
```

3. Start the Frontend
 ```
  cd client
  npm install
  npm run dev
```


