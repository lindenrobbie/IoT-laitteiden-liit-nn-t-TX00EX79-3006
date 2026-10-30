"use strict";

// ---------------------------------------------------------------------------
// model
// store plain numbers here, add units only when displaying
// later this object gets filled from the backend instead of the simulation
// ---------------------------------------------------------------------------

const deviceState = 
{
  temperatureC: 23.4,
  lowAlarmC: 15.0,
  highAlarmC: 30.0
};

// simulated reading range, one decimal stepp (see simulate_reading)
const MIN_TEMP_C = 10.0;
const MAX_TEMP_C = 40.0;
const TEMP_STEP_C = 0.1;

// ---------------------------------------------------------------------------
// elements
// grabbed once, defer in the html makes sure they exist before this runs
// ---------------------------------------------------------------------------

const temperature_el = document.querySelector("#temperature");
const alarm_status_el = document.querySelector("#alarm-status");
const low_value_el = document.querySelector("#low-value");
const high_value_el = document.querySelector("#high-value");
const low_input_el = document.querySelector("#low-input");
const high_input_el = document.querySelector("#high-input");
const message_el = document.querySelector("#message");
const refresh_button = document.querySelector("#refresh");
const alarm_form = document.querySelector("#alarm-form");

// ---------------------------------------------------------------------------
// view
// read from the model, write to the page, never read state back out of the dom
// ---------------------------------------------------------------------------

function alarm_status() 
{
  if (deviceState.temperatureC <= deviceState.lowAlarmC) 
  {
    return "LOW TEMPERATURE ALARM";
  } 
  
  else if (deviceState.temperatureC >= deviceState.highAlarmC) 
  {
    return "HIGH TEMPERATURE ALARM";
  } 
  
  else 
  {
    return "NORMAL";
  }
}

function render_dashboard() 
{

  temperature_el.textContent = deviceState.temperatureC.toFixed(1);
  low_value_el.textContent = deviceState.lowAlarmC.toFixed(1);
  high_value_el.textContent = deviceState.highAlarmC.toFixed(1);

  const status = alarm_status();
  alarm_status_el.textContent = status;
  alarm_status_el.dataset.status = status;
}

function show_message(text, kind) 
{
  message_el.textContent = text;
  message_el.dataset.kind = kind;
}

// ---------------------------------------------------------------------------
// actions
// each handler mutates the model, then calls render_dashboard
// ---------------------------------------------------------------------------

function simulate_reading() 
{
  const range = MAX_TEMP_C - MIN_TEMP_C;
  const steps = Math.floor(Math.random() * (range / TEMP_STEP_C + 1));
  deviceState.temperatureC = MIN_TEMP_C + steps * TEMP_STEP_C;

  render_dashboard();
}

function apply_alarm_limits(event) 
{

  event.preventDefault();

  const low = Number(low_input_el.value);
  const high = Number(high_input_el.value);
  const both_filled = low_input_el.value !== "" && high_input_el.value !== "";

  if (both_filled === false) 
  {
    show_message("rejected: enter both low and high limits", "error");
    return;
  }

  const both_numbers = Number.isNaN(low) === false && Number.isNaN(high) === false;

  if (both_numbers === false) 
  {
    show_message("rejected: both limits must be numbers", "error");
    return;
  }

  if (low >= high) 
  {
    show_message("rejected: low limit must be below high limit", "error");
    return;
  }

  deviceState.lowAlarmC = low;
  deviceState.highAlarmC = high;

  render_dashboard();
  show_message("accepted locally", "success");

}

// ---------------------------------------------------------------------------
// startup
// seed inputs from the model, wire events, draw the first frame
// ---------------------------------------------------------------------------

low_input_el.value = deviceState.lowAlarmC.toFixed(1);
high_input_el.value = deviceState.highAlarmC.toFixed(1);

refresh_button.addEventListener("click", simulate_reading);
alarm_form.addEventListener("submit", apply_alarm_limits);

render_dashboard();
