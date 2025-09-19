<template>
  <div style="height: 450px; position: relative;">
    <Line v-if="chartData.labels" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

const props = defineProps({
  sensorData: {
    type: Array,
    required: true
  }
});

const chartData = computed(() => {
  if (!props.sensorData || props.sensorData.length === 0) {
    return {};
  }
  
  const sortedData = [...props.sensorData].reverse();
  const labels = sortedData.map(d => new Date(d.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }));
  const moisture = sortedData.map(d => d.soilMoisture);
  const temperature = sortedData.map(d => d.temperature);

  return {
    labels,
    datasets: [
      {
        label: 'Jordfuktighet (%)',
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        data: moisture,
        yAxisID: 'yMoisture',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Temperatur (°C)',
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        data: temperature,
        yAxisID: 'yTemperature',
        tension: 0.3,
        fill: true,
      }
    ]
  };
});

// Avancerade inställningar för att göra grafen snygg och lättläst
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    yMoisture: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'Fuktighet (%)', color: '#0ea5e9' },
      ticks: { color: '#0ea5e9' },
      grid: { drawOnChartArea: false }
    },
    yTemperature: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: 'Temperatur (°C)', color: '#f97316' },
      ticks: { color: '#f97316' },
      grid: { drawOnChartArea: false }
    }
  }
};
</script>