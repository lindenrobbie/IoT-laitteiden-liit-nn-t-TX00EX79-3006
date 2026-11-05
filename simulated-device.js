import mqtt from 'mqtt';
const broker = process.env.MQTT_URL || 'mqtt://127.0.0.1:1883';
const client = mqtt.connect(broker, { reconnectPeriod: 1000 });
let lowAlarmC = 15;
let highAlarmC = 30;
let currentTemperatureC = null;
function alarmStatus(temperatureC) {
  if (temperatureC <= lowAlarmC) return 'LOW';
  if (temperatureC >= highAlarmC) return 'HIGH';
  return 'NORMAL';
}
function publishTelemetry(temperatureC) {
  client.publish('iot/pico1/telemetry',
    JSON.stringify({ temperatureC, alarmStatus: alarmStatus(temperatureC) }),
    { qos: 0 });
}
function publishReported() {
  client.publish('iot/pico1/alarms/reported',
    JSON.stringify({ lowAlarmC, highAlarmC }), { qos: 1, retain: true });
}
client.on('connect', () => {
  console.log('Simulated Pico connected');
  client.subscribe('iot/pico1/alarms/set', { qos: 1 }, error => {
    if (!error) publishReported();
  });
});
client.on('message', (topic, data) => {
  if (topic !== 'iot/pico1/alarms/set') return;
  try {
    const msg = JSON.parse(data.toString());
    if (!Number.isFinite(msg.lowAlarmC) || !Number.isFinite(msg.highAlarmC) ||
        msg.lowAlarmC >= msg.highAlarmC) return;
    lowAlarmC = msg.lowAlarmC;
    highAlarmC = msg.highAlarmC;
    console.log('Applied settings:', lowAlarmC, highAlarmC);
    publishReported();
    if (currentTemperatureC !== null) publishTelemetry(currentTemperatureC);
  } catch (e) { console.warn('Invalid request:', e.message); }
});
setInterval(() => {
  if (!client.connected) return;
  const temperatureC = Math.round((19 + Math.random() * 12) * 10) / 10;
  currentTemperatureC = temperatureC;
  publishTelemetry(temperatureC);
  console.log('Sent', temperatureC, '°C');
}, 3000);//every 3 seconds
