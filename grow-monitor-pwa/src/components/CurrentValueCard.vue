<template>
  <div class="value-card" :class="statusClass">
    <div class="icon-container">
      <img :src="icon" :alt="title + ' icon'" class="icon" />
    </div>
    <div class="text-container">
      <p class="title">{{ title }}</p>
      <p class="value">{{ formattedValue }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  value: Number,
  unit: String,
  icon: String,
  thresholds: {
    type: Object,
    default: () => ({ warning: null, critical: null })
  }
});

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return '---';
  }
  return `${props.value.toFixed(1)} ${props.unit}`;
});

const statusClass = computed(() => {
  // Om inga trösklar finns, returnera ingen extra klass (neutral färg)
  if (props.thresholds.warning === null && props.thresholds.critical === null) {
    return '';
  }

  if (props.value === null || props.value === undefined) {
    return '';
  }
  if (props.thresholds.critical !== null && props.value < props.thresholds.critical) {
    return 'status-critical';
  }
  if (props.thresholds.warning !== null && props.value < props.thresholds.warning) {
    return 'status-warning';
  }
  return 'status-good';
});
</script>

<style scoped>
.value-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-grow: 1;
  transition: all 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.icon-container {
  background-color: #f0f4f8; /* Neutral grå färg som standard */
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.icon {
  width: 32px;
  height: 32px;
}

.text-container {
  text-align: left;
}

.title {
  margin: 0;
  color: var(--secondary-text);
  font-size: 1rem;
  font-weight: 400;
}

.value {
  margin: 0;
  color: var(--primary-text);
  font-size: 2.25rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

/* Röd för kritiska värden */
.status-critical .icon-container {
  background-color: #fee2e2;
}
.status-critical .value {
  color: #b91c1c;
}

/* Gul för varningsvärden */
.status-warning .icon-container {
  background-color: #fef3c7;
}
.status-warning .value {
  color: #a16207;
}

/* Grön för bra värden */
.status-good .icon-container {
  background-color: #dcfce7;
}
.status-good .value {
  color: #166534;
}
</style>