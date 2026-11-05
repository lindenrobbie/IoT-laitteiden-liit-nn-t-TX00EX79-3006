# IoT-laitteiden-liit-nn-t-TX00EX79-3006
Course for school, full stack embedded / IoT, endpoint to endpoint


## EX1 answers

### How to open

Simply open `index.html` in a browser (I also used VS Code Live Server plugin)

### Task 6: Test results

Test 1: Initial page load

```
23.4°C, low 15, high 30, NORMAL
```

Test 2: Set low=24, high=30

```
LOW TEMPERATURE ALARM triggers
```

Test 3: Set low=15, high=22

```
HIGH TEMPERATURE ALARM triggers
```

Test 4: Set low=25, high=20

```
Rejected: "Low limit must be below high limit"
Previous valid values remain
```

Test 5: Click simulate several times

```
Temperature and alarm status change together
```

Test 6: Reload page

```
Returns to initial state (hardcoded defaults: 23.4°C, 15.0, 30.0, NORMAL)
No persistence
```

### Q2.1 Why is the temperature stored as a number instead of a string containing °C?

A. It can be compared `e.g temperatureC <= lowAlarmC`
B. We can apply math to it e.g `toFixed` for display, range checks etc.
C. We don't need to parse a string
D. It's mutable to format into different units/types e.g Fahrenheit, integer, etc (Friendly to send to an MCU and if it has an OLED for example vice versa it sends only an integer and not a string)
E. It's technically deterministic in a "low level sense" compared to a string (°C is an extra 2 bytes (2 characters) and the size may scale depending on char count)

### Q2.2 What is the difference between changing deviceState.temperatureC and calling renderDashboard()?

`deviceState.temperatureC` updates the value, doesn't change the screen. Calling `renderDashboard()` updates the display (uses the value).

Decoupling keeps them explicit and lets you change data without changing the dashboard.

(e.g in Grafana you can change the refresh from once every 5s or update once a day)

### Q2.3 Why must the low threshold be smaller than the high threshold?

Because it wouldn't make sense, there would be no temperature that could be "NORMAL", every reading would be low and high (at the same time). No safe zone.

Validation rejects nonsense so the model wouldn't break.

### Q2.4 Does clicking Apply change anything on a physical device? Why not?

Nothing, there is nothing connected, not even a web server, no MQTT, no end device, only front end code.

### Q2.5 What extra components will be required so that the webpage and Pico W eventually agree on the alarm limits?

A lot:

```
Frontend <-> Web Server <-> MQTT <-> WiFi <-> MCU
```

A. Frontend will receive temperatures and send alarm changes (thresholds) to the server via HTTP
B. Web server (Express js) holds shared state, receives alarm changes (thresholds) via HTTP
C. MQTT broker bridges server and device, topics for set/reported
D. MQTT client subscribes to alarms/set, publishes alarms/reported back as confirmation
E. WiFi as a physical network to communicate between MCU & the broker
