const awsIot = require('aws-iot-device-sdk');
require('dotenv').config();

const device = awsIot.device({
  keyPath: './certs/99b4ca667062f763fbf1597cae4976a17bd7d6a07db42ce9762767dcd6a34fbf-private.pem.key',
  certPath: './certs/99b4ca667062f763fbf1597cae4976a17bd7d6a07db42ce9762767dcd6a34fbf-certificate.pem.crt',
  caPath: './certs/AmazonRootCA1.pem',
  clientId: 'VirtualGrowSensor',
  host: process.env.AWS_IOT_ENDPOINT
});

// Simulera initiala värden för sensorerna
let soilMoisture = 85.0;
let temperature = 22.0;
let lightLevel = 0;

// Funktion för att generera mer realistisk data
function generateSensorData() {
  // Jordfuktigheten minskar långsamt och lite slumpmässigt
  soilMoisture = Math.max(0, soilMoisture - (0.2 + Math.random() * 0.3));

  // Temperatur och ljus följer en påhittad dygnsrytm
  const hour = new Date().getHours();
  // Sinuskurva för att efterlikna dagsljus (max ljus ca kl 14)
  lightLevel = Math.max(0, Math.sin((hour - 8) * (Math.PI / 12)) * 5000 + Math.random() * 100);
  // Temperaturen är lite högre under dagen
  temperature = 22 + Math.sin((hour - 8) * (Math.PI / 12)) * 4 + (Math.random() - 0.5);

  // Returnera ett JSON-objekt med datan
  return {
    timestamp: new Date().toISOString(),
    soilMoisture: parseFloat(soilMoisture.toFixed(2)),
    temperature: parseFloat(temperature.toFixed(2)),
    lightLevel: parseFloat(lightLevel.toFixed(2))
  };
}

// Händelsehanterare: körs när enheten lyckats ansluta till AWS
device.on('connect', function() {
  console.log('Ansluten till AWS IoT Core!');
  
  // Starta en loop som skickar data var 15:e sekund
  setInterval(function() {
    const data = generateSensorData();
    const topic = 'odling/data'; // Samma topic som i din AWS IoT Rule

    console.log(`Skickar data till topic "${topic}":`, JSON.stringify(data, null, 2));
    
    // Publicera datan som en JSON-sträng
    device.publish(topic, JSON.stringify(data));
  }, 30000); // 30000 ms = 30 sekunder
});

// Händelsehanterare för fel
device.on('error', function(error) {
  console.error('Anslutningsfel:', error);
});

console.log('Försöker ansluta till AWS IoT Core...');