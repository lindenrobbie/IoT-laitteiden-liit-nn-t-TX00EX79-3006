# IoT-laitteiden-liit-nn-t-TX00EX79-3006
Course for school, full stack embedded / IoT, endpoint to endpoint


## EX1 answers

### Q1.1 How to open

By simpling opening the index.html file in a browser (I also used VS code local live server plugin)

### Task 6:
Test 1: 
Shows 23.4°C, low 15, high 30. NORMAL

Test 2:
Set low=24, high=30, low alarm triggers

Test 3:
Set low=15, high=22, high alarm triggers

Test 4:
Set low=25, high=22, rejected: low limit must be below high limit

Test 5:
returns to init (hardcoded values)

### Q2.1 Why is the temparature stored as a number instead of a string containing °C?
A. It can be compared ´e.g temparatureC <= lowAlarmC´
B. We can apply math to it e.g toFixed for display, range checks etc.
C. We don't need to parse a string
D. It's mutable to format into different units/types e.g Fahrenheit, integer, etc (Friendly to send to an MCU and if it has an OLED for example vice versa it sends only an integer and not a string)
E. It's technically deterministic in a "low level sense" compared to a string (°C is an extra 2 bytes (2 characters) and the size may scale depending on char count)

### Q2.2 What is the difference between changing deviceState.temperatureC and calling renderDashboard()?
      
deviceState.temparatureC updates the value, doesn't change the screen and then calling renderDashboard() updates the display (uses the value)

Decoupling keeps them explicit and let's you change data without changing the dashboard

(e.g in Grafana you can change the refresh from once every 5s or update once a day)

### Q2.3 Why must the low threshold be smaller than the high threshold?
Because it wouldn't make sense, there would be no temparature that could be "NORMAL", every reading would be low and high (at the same time). No safe zone

Validation rejects nonsense so the model wouldn't break

### Q2.4 Does clicking Apply change anything on a physical device? Why not?
Nothing, there is nothing connected, not even a web server, no MQTT, no end device, only front end code.

### Q2.5 What extra components will be required so that the webpage and Pico W eventually agree on the alarm limits?
A lot:

Frontend <-> Web Server <-> MQTT <-> WiFi <-> MCU

A. Frontend will receive temparatures and send alarm changes (thresholds) to the server via HTTP
B. Web server (Express js) holds shared state, receives alarm changes (thresholds) via HTTP
C. MQTT broker bridges server and device, topics for set/reported
D. MQTT client subscribes to alarms/set, publishes alarms/reported back as confirmation
E. WiFi as a physical network to communicate between MCU & the broker





