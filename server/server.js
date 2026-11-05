  import express from 'express';
  import mqtt from 'mqtt';

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.static('app/frontend'));

  const state = {
      temperatureC: null,
      lowAlarmC: 15.0,
      highAlarmC: 30.0,
      alarmStatus: null,
      updatedAt: null,
      mqttConnected: false,
      pendingAlarms: null
  };

  // MQTT client

  const client = mqtt.connect('mqtt://127.0.0.1:1883');

  client.on('connect', () => {
      console.log('MQTT connected');
      state.mqttConnected = true;
      client.subscribe(['iot/pico1/telemetry', 'iot/pico1/alarms/reported'], (err) => {
          if (err) {
              console.error('Subscribe error:', err.message);
          }
      });
  });

  client.on('reconnect', () => {
      console.log('MQTT reconnecting...');
  });

  client.on('close', () => {
      console.log('MQTT disconnected');
      state.mqttConnected = false;
  });

  client.on('error', (err) => {
      console.error('MQTT error:', err.message);
  });

  client.on('message', (topic, payload) => {
      let msg;
      try {
          msg = JSON.parse(payload.toString());
      } catch (e) {
          console.warn('Bad JSON:', e.message);
          return;
      }

      if (topic === 'iot/pico1/telemetry') {
          if (Number.isFinite(msg.temperatureC) === false) {
              console.warn('Invalid temperatureC');
              return;
          }
          if (msg.alarmStatus !== 'LOW' &&
              msg.alarmStatus !== 'NORMAL' &&
              msg.alarmStatus !== 'HIGH') {
              console.warn('Invalid alarmStatus');
              return;
          }
          state.temperatureC = msg.temperatureC;
          state.alarmStatus = msg.alarmStatus;
          state.updatedAt = new Date().toISOString();
          console.log('Telemetry:', state.temperatureC, state.alarmStatus);
      }

      if (topic === 'iot/pico1/alarms/reported') {
          if (Number.isFinite(msg.lowAlarmC) === false ||
              Number.isFinite(msg.highAlarmC) === false ||
              msg.lowAlarmC >= msg.highAlarmC) {
              console.warn('Invalid reported alarms');
              return;
          }
          state.lowAlarmC = msg.lowAlarmC;
          state.highAlarmC = msg.highAlarmC;
          if (state.pendingAlarms !== null &&
              state.pendingAlarms.lowAlarmC === msg.lowAlarmC &&
              state.pendingAlarms.highAlarmC === msg.highAlarmC) {
              state.pendingAlarms = null;
          }
          console.log('Reported alarms:', state.lowAlarmC, state.highAlarmC);
      }
  });

  // TODO 1: Implement GET /api/state returning state as JSON.
  app.get('/api/state', (req, res) => {
      res.json(state);
  });

  // TODO 2: Implement PUT /api/alarms. Read lowAlarmC and highAlarmC
  // from req.body. Validate finite numbers and lowAlarmC < highAlarmC.
  // For invalid input, return HTTP 400 with { error: '...' }.
  // For valid input, update both thresholds and updatedAt, then return state.
  // Exercise 3: publish to MQTT alarms/set, return 202, wait for alarms/reported.
  app.put('/api/alarms', (req, res) => {
      if (state.mqttConnected === false) {
          return res.status(503).json({ error: 'MQTT not connected' });
      }

      if (req.body === undefined) {
          return res.status(400).json({ error: 'Request body is required' });
      }

      const { lowAlarmC, highAlarmC } = req.body;

      if (Number.isFinite(lowAlarmC) === false ||
          Number.isFinite(highAlarmC) === false ||
          lowAlarmC >= highAlarmC) {
          return res.status(400).json({
              error: 'Limits must be numbers, with low below high'
          });
      }

      const payload = JSON.stringify({ lowAlarmC, highAlarmC });

      client.publish('iot/pico1/alarms/set', payload, (err) => {
          if (err) {
              return res.status(500).json({ error: 'Publish failed' });
          }
          state.pendingAlarms = { lowAlarmC, highAlarmC };
          res.status(202).json({
              message: 'Pending device confirmation',
              pendingAlarms: state.pendingAlarms
          });
      });
  });

  // TODO 3: POST /api/simulate removed in Exercise 3.
  // Temperature readings now arrive via MQTT from simulated-device.js.

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));