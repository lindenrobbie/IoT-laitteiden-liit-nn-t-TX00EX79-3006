
  # IoT-laitteiden-liit-nn-t-TX00EX79-3006
  Course for school, full stack embedded / IoT, endpoint to endpoint


  ## Ex3 answers

  ### Test 1: Start broker, Express, and simulated device

  All connect: device prints readings

  ### Test 2: Open YOUR dashboard at http://localhost:3000/

  Yes, it changes from the device simulation's sent values:

  ```
  ...
  Sent 23.7 °C
  Sent 26.6 °C
  Sent 19.9 °C
  Sent 21.2 °C
  Sent 24.5 °C
  Sent 21.2 °C
  Sent 28 °C
  Sent 27.7 °C
  ...
  ```

  ### Test 3: GET /api/state

  Yes:

  ```json
  {
    "temperatureC": 27.7,
    "lowAlarmC": 15,
    "highAlarmC": 30,
    "alarmStatus": "NORMAL",
    "updatedAt": "2026-11-05T15:36:12.109Z",
    "mqttConnected": true,
    "pendingAlarms": null
  }
  ```

  ### Test 4: Valid alarm form submission

  low=18, high=32:

  ```
  "pending form submission"
  3s later:
  "alarm limits confirmed"
  threshold updated to 18/32
  HTTP 202 returned
  ```

  ### Test 5: Invalid lowAlarmC >= highAlarmC

  Frontend denies it, also tested curl put change to invalid, backend also denies it

  ### Test 6: Publish malformed telemetry JSON

  Input:

  ```bash
  mosquitto_pub -h 127.0.0.1 -t 'iot/pico1/telemetry' -m 'not json'
  ```

  Output:

  ```
  "Bad JSON: Unexpected token o in JSON at position 1"
  ```

  ### Test 7: Stop simulated device, then change alarms

  Input:

  ```
  Ctrl+C (kill)
  ```

  Output:

  ```
  "Pending device confirmation" (in frontend)
  ```

  ### Test 8: Stop broker, then change alarms

  Input(s):

  ```bash
  sudo systemctl stop mosquitto
  ```

  Submitted new alarm values in browser

  Output(s):

  ```
  Server returned 503 "MQTT not connected"
  No false claim of success
  ```

  ### Test 9: Open two browsers

  Both tabs polled `/api/state` every 3s
  Both showed the same server-reported values
  Up to 3s delay between tabs (polling offset), but sync eventually


### Q1: What is the difference between an MQTT broker and the Express backend?
MQTT broker handles the connection between MCU and web server, web server handles both ways

Browser <-HTTP-> Express server <-MQTT-> Mosquitto Broker <-MQTT-> Simulated device

### Q2: Why does the browser still use HTTP rather than talking directly to the broker?
Because the broker cannot handle HTTP requests, it uses it's own minimal protocol meant for IoT devices (MQTT) 

AND browsers don't natively understand MQTT. 

AND the server needs to validate, log, control a device.

### Q3: How is an MQTT topic different from an HTTP URL path?

HTTP URL: locates resource from server (Universal Resoure Locator), response/request

MQTT topic: a publish/subscribe channel (not youtube). Publisher sends, anyone subbed receives. (like a radio, anyone can join in but broadcaster doesn't know who be listenin)

### Q4: What does QoS 1 promise, and what does it not prove about an alarm change?
QoS 1 = Quality of Service level 1

Proves:
It guarantees the broker delivers the message at least once. The publisher gets a confirmation from the broker

Not proves:
Device actually applied the thresholds. The device might be offline busy, or reject the values

### Q5: Why should the backend wait for alarms/reported before declaring an alarm value applied?

Because alarms/set is a one way request, the server publishes and hopes the device gets it. But if the device is offline, busy, or reject the values for its own reasons. (A heartbeat check might be kinda cool for this)

### Q6: Why should a dashboard show timestamps or connection status for old readings?

A temperature from 5 minutes ago is useless if the device is offline. No timestamp? User sees 23.4°C and may assume it's up2date (when its not)

### Q7: What would happen if the same MQTT telemetry payload arrived twice?

Nothing bad, server (should) parse it, validate it, etc. Same temperature, same alarmStatus, updatedAt gets a new timestamp.

### Q8: Why does the simulated device calculate alarmStatus instead of maintaining independent alarm states in the browser and server?

Device has the real sensor and the actually-applied thresholds. It all would cause big disagreement if browser and server each computed their own.

