import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('app/frontend'));

const state = {
  temperatureC: 23.4,
  lowAlarmC: 15.0,
  highAlarmC: 30.0,
  updatedAt: new Date().toISOString()
};

// TODO 1: Implement GET /api/state returning state as JSON.
app.get('/api/state', (req, res) => 
{
  res.json(state);
});

// TODO 2: Implement PUT /api/alarms. Read lowAlarmC and highAlarmC
// from req.body. Validate finite numbers and lowAlarmC < highAlarmC.
// For invalid input, return HTTP 400 with { error: '...' }.
// For valid input, update both thresholds and updatedAt, then return state.
app.put('/api/alarms', (req, res) =>
{
    const { lowAlarmC, highAlarmC } = req.body;

    if (
        !Number.isFinite(lowAlarmC) ||
        !Number.isFinite(highAlarmC) ||
        lowAlarmC >= highAlarmC
    )
    {
        return res.status(400).json(
        {
            error: 'Limits must be numbers, with low below high'
        });
    }

    state.lowAlarmC = lowAlarmC;
    state.highAlarmC = highAlarmC;
    state.updatedAt = new Date().toISOString();

    res.json(state);
});


// TODO 3: Implement POST /api/simulate to create a simulated
// temperature in the 10.0–40.0 °C range and return state.
app.post('/api/simulate', (req, res) =>
{
    const minTemperature = 10;
    const maxTemperature = 40;

    const temperature = minTemperature +
        Math.random() * (maxTemperature - minTemperature);

    state.temperatureC = Number(temperature.toFixed(1));
    state.updatedAt = new Date().toISOString();

    res.json(state);
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
