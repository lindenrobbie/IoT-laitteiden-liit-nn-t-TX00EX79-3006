# IoT-laitteiden-liit-nn-t-TX00EX79-3006
Course for school, full stack embedded / IoT, endpoint to endpoint


## EX2 answers

### Task 6: Test results

Test 1: Open http://localhost:3000/

```
Dashboard loads and inits in default values
```

Test 2: GET /api/state

```
HTTP 200
```

```json
{
    "temperatureC": 23.4,
    "lowAlarmC": 15,
    "highAlarmC": 30,
    "updatedAt": "2026-11-05T13:35:14.445Z"
}
```

Test 3: Valid PUT /api/alarms with:

```json
{
    "lowAlarmC": 18,
    "highAlarmC": 32
}
```

```
HTTP 200
State updated
```

Test 4: Invalid PUT /api/alarms with:

```json
{
    "lowAlarmC": 35,
    "highAlarmC": 20
}
```

```
HTTP 400
"Limits must be numbers, with low below high"
Old values remain
```

Test 5: POST /api/simulate

```
HTTP 200
Successfully simulated new values
```

Test 6: Two-browser sync

```
Changed alarm in tab A, refresh tab B
Tab B showed same accepted values from tab A
```

Test 7: Kill server, do thing

```
"Fetch failed"
No false success
```

Test 8: Restart node

```
Returned to default values
No persistence
```

### Q1 What problem does sharing state through a server solve vs browser-only?

Without a server each browser has its own isolated state, multiple users can't share data. A shared server holds one source of truth that everyone fetches from, so all clients agree on the same values.

### Q2 Why must the backend check alarm thresholds even though your form also checks them?

Client side validation is convenience, server side validation is enforcement. Users can bypass front end checks, but they can't bypass the server, so the backend must validate on it's own.

### Q3 Difference between GET /api/state, PUT /api/alarms, POST /api/simulate?

`GET /api/state`: reads, server returns current state, no side effects, can be called as many times as we want

`PUT /api/alarms`: sends new thresholds to server, server validates, then applies alarm limits, idempotent, BOOM

`POST /api/simulate`: triggers an action, tells server to do any action basically e.g generate a new reading now (my favorite, i believe everything should just be explicit POST + GET)

### Q4 Why check response.ok and use await response.json()?

`response.ok`: checks the server accepted the request (status 200-299)

`response.json()`: parses the response as JSON (it's async cause it arrives as a stream)

### Q5 Why can two browser tabs temporarily show different temperatures?

Because 2 sessions can fetch at different times (When the values may be different) so the state changes.

### Q6 If server returns 200 after changing thresholds, does that prove the Pico W applied them?

No:

A. We don't have a pico yet lol
B. It's only the web server saying it accepted the request

### Q7 What happens to server values when Node restarts? How to preserve them later?

If the server restarts, the state is byebye, it's only stored in memory (Not disk).

To fix, either get a file or a database (I would pick DB because I want to refresh my DB "skills").
