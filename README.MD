# Virtual Grow Monitor

## About the Project
Virtual Grow Monitor is a complete, cloud-based web application built to simulate and monitor a smart growing environment.  
The project solves the problem of testing and developing an IoT system without the need for physical hardware.

A Node.js application simulates a sensor that sends real-time data (soil moisture, temperature, light) to AWS.  
The data is processed by a serverless backend and visualized in a responsive Progressive Web App (PWA) built with Vue.js.  
The system also includes push notifications that alert the user when the simulated plant needs to be “watered”.

This project is a fully-fledged prototype and an excellent example of a modern, event-driven cloud architecture.

---

## Features
- **Real-time Simulation**: A Node.js script simulates realistic, time-based sensor data.  
- **Serverless Backend**: Built entirely on AWS with a scalable, event-driven architecture (IoT Core, Lambda, DynamoDB).  
- **Data Visualization**: A dynamic, interactive dashboard built with Vue.js and Chart.js.  
- **Smart Alerts**: Dashboard cards change color based on threshold values to provide a quick status overview.  
- **Progressive Web App (PWA)**: Installable on the home screen with offline support via a Service Worker.  
- **Push Notifications**: Sends notifications to subscribed devices when soil moisture falls below a critical level.  

---

## Technologies

### Frontend (PWA)
- Vue.js (with Vite)  
- Chart.js for graphs  
- Axios for API calls  

### Backend (AWS Cloud)
- **AWS IoT Core**: Receives MQTT messages from the virtual sensor.  
- **AWS Lambda**:  
  - `processSensorData` for saving data  
  - `getSensorData` for retrieving data  
- **Amazon DynamoDB**: NoSQL database for storing sensor data and user subscriptions.  
- **Amazon API Gateway**: Secure HTTP API endpoint for the frontend app.  

### Virtual Sensor
- Node.js  
- AWS IoT Device SDK  
- Dotenv for environment variable management  

---

## Architecture

### Data Flow (Inbound)
Sensor.js → MQTT → AWS IoT Core → IoT Rule → Lambda: processSensorData → DynamoDB

### Data Flow (Outbound)
PWA/Browser → HTTPS → API Gateway → Lambda: getSensorData → DynamoDB

### Notification Flow
    1. The PWA requests permission and sends a subscription object to: API Gateway -> Lambda: subscribeUser -> DynamoDB: UserSubscriptions
    2. The processSensorData Lambda detects a low value, fetches subscriptions from DynamoDB, and sends a notification via web-push.

---

## Getting Started

### Prerequisites
- Node.js (v20+)  
- An AWS account  
- AWS CLI configured  

---

### 1. AWS Setup
Before running locally, create the following resources in AWS (region: `eu-north-1`):

#### DynamoDB
- **OdlingsData**  
  - Partition key: `sensorId` (String)  
  - Sort key: `timestamp` (String)  
- **UserSubscriptions**  
  - Partition key: `endpoint` (String)  

#### AWS IoT Core
- Create a “Thing” with certificate and policy allowing `iot:Connect` and `iot:Publish`.

#### AWS Lambda
- **processSensorData**  
  - Triggered by IoT rule  
  - IAM permissions: `dynamodb:PutItem` (OdlingsData), `dynamodb:Scan` (UserSubscriptions)  
- **getSensorData**  
  - IAM permission: `dynamodb:Query` (OdlingsData)  
- **subscribeUser**  
  - IAM permission: `dynamodb:PutItem` (UserSubscriptions)  

#### API Gateway
- HTTP API with routes:  
  - `GET /data` → `getSensorData`  
  - `POST /subscribe` → `subscribeUser`  

#### Lambda Layer
- Include `web-push` library, attached to `processSensorData`.  

---

### 2. Local Installation

```bash
# Clone project
git clone <your-repository-url>
cd grow-monitor-project

# Install dependencies for the virtual sensor
cd virtual-sensor
npm install

# Install dependencies for the frontend PWA
cd ../grow-monitor-pwa
npm install
```

---

## 3. Configuration

### Virtual Sensor
Create a .env file in virtual-sensor folder:
```bash
AWS_IOT_ENDPOINT=your-endpoint.iot.eu-north-1.amazonaws.com
```
Place the three AWS IoT certificates in virtual-sensor/certs/.

### Frontend (PWA)
Create a .env.local file in grow-monitor-pwa folder.
```bash
npx web-push generate-vapid-keys
```
Add:
```bash
VITE_API_URL=https://your-api-gateway-url.execute-api.eu-north-1.amazonaws.com
VITE_VAPID_PUBLIC_KEY=your_public_vapid_key
```
### processSensorData Lambda
In AWS Console, add the following environment variables:
```bash
VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
VAPID_MAILTO=mailto:your-email@example.com
```

---

## Usage
You need two terminals to run the system:

### Terminal 1: Start the virtual sensor
```bash
cd virtual-sensor
node sensor.js
```

### Terminal 2: Start the frontend app
```bash
cd grow-monitor-pwa
npm run dev
```
Then open http://localhost:5173 in your browser.

To test the PWA features, you must build and preview the app:
```bash
cd grow-monitor-pwa
npm run build
npm run preview
```