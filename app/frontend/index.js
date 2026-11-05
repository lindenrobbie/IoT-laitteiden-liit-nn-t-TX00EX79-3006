"use strict";

  // elements

  const temperature_el = document.querySelector("#temperature");
  const alarm_status_el = document.querySelector("#alarm-status");
  const low_value_el = document.querySelector("#low-value");
  const high_value_el = document.querySelector("#high-value");
  const low_input_el = document.querySelector("#low-input");
  const high_input_el = document.querySelector("#high-input");
  const message_el = document.querySelector("#message");
  const alarm_form = document.querySelector("#alarm-form");
  const mqtt_status_el = document.querySelector("#mqtt-status");

  // display

  function alarm_status(state)
  {
      if (state.alarmStatus === null)
      {
          return "Waiting for a reading";
      }
      return state.alarmStatus;
  }

  function render_dashboard(state)
  {
      if (state.temperatureC === null)
      {
          temperature_el.textContent = "Waiting for a reading";
      }
      else
      {
          temperature_el.textContent = state.temperatureC.toFixed(1);
      }

      low_value_el.textContent = state.lowAlarmC.toFixed(1);
      high_value_el.textContent = state.highAlarmC.toFixed(1);

      const status = alarm_status(state);
      alarm_status_el.textContent = status;
      alarm_status_el.dataset.status = status;

      if (mqtt_status_el !== null)
      {
          if (state.mqttConnected === true)
          {
              mqtt_status_el.textContent = "MQTT: connected";
              mqtt_status_el.dataset.connected = "true";
          }
          else
          {
              mqtt_status_el.textContent = "MQTT: disconnected";
              mqtt_status_el.dataset.connected = "false";
          }
      }

      if (state.pendingAlarms !== null)
      {
          show_message("Pending device confirmation", "pending");
      }
  }

  function show_message(text, kind)
  {
      message_el.textContent = text;
      message_el.dataset.kind = kind;
  }

  // API

  async function request_state(path, options)
  {
      const response = await fetch(path, options);
      const result = await response.json();

      if (response.ok === false)
      {
          throw new Error(result.error || `Request failed: HTTP ${response.status}`);
      }

      return { response, result };
  }

  // Actions

  async function load_state()
  {
      try
      {
          const { result } = await request_state("/api/state");
          low_input_el.value = result.lowAlarmC.toFixed(1);
          high_input_el.value = result.highAlarmC.toFixed(1);
          render_dashboard(result);

          if (result.pendingAlarms === null)
          {
              if (message_el.dataset.kind === "pending")
              {
                  show_message("Alarm limits confirmed", "success");
              }
          }
      }
      catch (error)
      {
          show_message(error.message, "error");
      }
  }

  async function apply_alarm_limits(event)
  {
      event.preventDefault();

      if (low_input_el.value === "" || high_input_el.value === "")
      {
          show_message("Enter both low and high limits", "error");
          return;
      }

      const low = Number(low_input_el.value);
      const high = Number(high_input_el.value);

      if (Number.isFinite(low) === false || Number.isFinite(high) === false)
      {
          show_message("Both limits must be finite numbers", "error");
          return;
      }

      if (low >= high)
      {
          show_message("Low limit must be below high limit", "error");
          return;
      }

      try
      {
          const { response, result } = await request_state("/api/alarms", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lowAlarmC: low, highAlarmC: high })
          });

          if (response.status === 202)
          {
              await load_state();
              show_message("Pending device confirmation", "pending");
          }
          else
          {
              render_dashboard(result);
              show_message("Alarm limits updated", "success");
          }
      }
      catch (error)
      {
          show_message(error.message, "error");
      }
  }

  // Startup

  function initialise()
  {
      alarm_form.addEventListener("submit", apply_alarm_limits);
      load_state();
      setInterval(load_state, 3000);
  }

  initialise();