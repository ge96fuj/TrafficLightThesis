const mqtt = require('mqtt');
const { TrafficLightStatus } = require('../core/TrafficLight');

// Connect to  MQTT broker
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
  console.log('📡 Connected to MQTT broker (localhost:1883)');
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT connection error:', err);
});

const STATUS_MAP = {
  [TrafficLightStatus.RED]: "RED",
  [TrafficLightStatus.YELLOW_TO_G]: "YELLOW",
  [TrafficLightStatus.GREEN]: "GREEN",
  [TrafficLightStatus.YELLOW_TO_R]: "YELLOW"
};

// Publishes current traffic light statuses 
function publishTrafficLightStatuses() {
  if (!global.lights) return;

  for (const [id, light] of Object.entries(global.lights)) {
    if (!light || !light.isConnected()) continue;

    const payload = JSON.stringify({
      status: STATUS_MAP[light.status] || "UNKNOWN",
      timestamp: Date.now()
    });

    mqttClient.publish(`detection/traffic_lights/${id}`, payload);
    console.log(`✅ Publishing in  detection/status/${id}` , payload);
  }
}
// Every 4 sec
setInterval(publishTrafficLightStatuses, 2000); 

module.exports = mqttClient;


