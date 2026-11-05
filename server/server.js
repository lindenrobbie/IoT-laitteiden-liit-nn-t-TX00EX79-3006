import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const state = {
  temperatureC: 23.4,
  lowAlarmC: 15.0,
  highAlarmC: 30.0,
  updatedAt: new Date().toISOString()
};

// TODO 1: Implement GET /api/state returning state as JSON.

// TODO 2: Implement PUT /api/alarms. Read lowAlarmC and highAlarmC
// from req.body. Validate finite numbers and lowAlarmC < highAlarmC.
// For invalid input, return HTTP 400 with { error: '...' }.
// For valid input, update both thresholds and updatedAt, then return state.

// TODO 3: Implement POST /api/simulate to create a simulated
// temperature in the 10.0–40.0 °C range and return state.

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
