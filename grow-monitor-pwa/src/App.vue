<template>
  <div id="app-container">
    <header class="app-header">
      <img src="/plant-icon.svg" alt="Plant Icon" class="header-icon" />
      <h1>Virtuell Hemodling</h1>
      <button @click="subscribeUserToPush" class="push-button">
        Få notiser
      </button>
    </header>
    <main class="content-card">
      <div class="cards-container" v-if="!loading && sensorData.length > 0">
        <CurrentValueCard
          title="Jordfuktighet"
          :value="latestMoisture"
          unit="%"
          icon="/water-icon.svg"
          :thresholds="{ warning: 40, critical: 25 }"
        />
        <CurrentValueCard
          title="Temperatur"
          :value="latestTemperature"
          unit="°C"
          icon="/thermometer-icon.svg"
        />
      </div>
      <div v-if="loading" class="status-indicator">
        <p>Hämtar färsk data från AWS...</p>
      </div>
      <div v-else-if="error" class="status-indicator error">
        <h2>Ett fel har uppstått</h2>
        <p>Kunde inte hämta data: {{ error }}</p>
        <small
          >Kontrollera att din virtuella sensor är igång och att API-URL:en är
          korrekt.</small
        >
      </div>
      <div v-else-if="sensorData.length > 0" class="chart-container">
        <DataChart :sensor-data="sensorData" />
      </div>
      <div v-else class="status-indicator">
        <p>Väntar på data från sensorn...</p>
      </div>
    </main>
    <footer class="app-footer">
      <p>Data uppdateras automatiskt var 30:e sekund.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { subscribeUserToPush } from './push-notifications.js';
import DataChart from "./components/DataChart.vue";
import CurrentValueCard from "./components/CurrentValueCard.vue";

// Reaktiva variabler för att hålla appens state
const sensorData = ref([]);
const loading = ref(true);
const error = ref(null);

const apiUrl = `${import.meta.env.VITE_API_URL}/data`;

const latestSensorReading = computed(() => {
  return sensorData.value.length > 0 ? sensorData.value[0] : null;
});

const latestMoisture = computed(() => {
  return latestSensorReading.value
    ? latestSensorReading.value.soilMoisture
    : null;
});

const latestTemperature = computed(() => {
  return latestSensorReading.value
    ? latestSensorReading.value.temperature
    : null;
});

// Funktion för att hämta data från API:et
async function fetchData() {
  error.value = null; // Återställ eventuella gamla fel
  try {
    const response = await axios.get(apiUrl);
    // Vi vill bara ha data som har en giltig timestamp
    sensorData.value = response.data.filter((item) => item.timestamp);
  } catch (err) {
    console.error("API-fel:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Denna funktion körs en gång när komponenten laddas
onMounted(() => {
  fetchData(); // Hämta data direkt när sidan laddas

  // Sätt upp en timer som hämtar ny data var 30:e sekund
  setInterval(fetchData, 30000);
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap");

:root {
  --background-color: #f0f4f8;
  --card-background: #ffffff;
  --primary-text: #2c3e50;
  --secondary-text: #5a7d9a;
  --accent-color: #34495e;
  --error-color: #e74c3c;
  --shadow: 0 10px 20px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.08);
}

body {
  margin: 0;
  font-family: "Roboto", sans-serif;
  background-color: var(--background-color);
  color: var(--primary-text);
}

#app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-icon {
  width: 48px;
  height: 48px;
}

.app-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--accent-color);
}

.content-card {
  background: var(--card-background);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 2rem;
  width: 100%;
  max-width: 1000px;
  box-sizing: border-box;
}

.status-indicator {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--secondary-text);
  font-size: 1.2rem;
}

.status-indicator.error {
  color: var(--error-color);
  background-color: rgba(231, 76, 60, 0.05);
  border-radius: 8px;
}

.app-footer {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.cards-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.push-button {
  margin-left: auto; 
  padding: 0.5rem 1rem;
  border: 1px solid var(--accent-color);
  background-color: transparent;
  color: var(--accent-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.push-button:hover {
  background-color: var(--accent-color);
  color: white;
}
</style>
