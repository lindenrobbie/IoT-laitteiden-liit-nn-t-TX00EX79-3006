"use strict";

// elements

const temperature_el = document.querySelector("#temperature");
const alarm_status_el = document.querySelector("#alarm-status");
const low_value_el = document.querySelector("#low-value");
const high_value_el = document.querySelector("#high-value");
const low_input_el = document.querySelector("#low-input");
const high_input_el = document.querySelector("#high-input");
const message_el = document.querySelector("#message");
const refresh_button = document.querySelector("#refresh");
const alarm_form = document.querySelector("#alarm-form");

// ddisplay

function alarm_status(state)
{
    if (state.temperatureC <= state.lowAlarmC)
    {
        return "LOW TEMPERATURE ALARM";
    }

    if (state.temperatureC >= state.highAlarmC)
    {
        return "HIGH TEMPERATURE ALARM";
    }

    return "NORMAL";
}

function render_dashboard(state)
{
    temperature_el.textContent = state.temperatureC.toFixed(1);
    low_value_el.textContent = state.lowAlarmC.toFixed(1);
    high_value_el.textContent = state.highAlarmC.toFixed(1);

    const status = alarm_status(state);

    alarm_status_el.textContent = status;
    alarm_status_el.dataset.status = status;
}

function show_message(text, kind)
{
    message_el.textContent = text;
    message_el.dataset.kind = kind;
}

// API(s)
// Shared request handling for all three endpoints.

async function request_state(path, options)
{
    const response = await fetch(path, options);
    const result = await response.json();

    if (!response.ok)
    {
        throw new Error(result.error || `Request failed: HTTP ${response.status}`);
    }

    return result;
}

// Actions

async function load_state()
{
    try
    {
        const state = await request_state("/api/state");

        low_input_el.value = state.lowAlarmC.toFixed(1);
        high_input_el.value = state.highAlarmC.toFixed(1);

        render_dashboard(state);
    }
    catch (error)
    {
        show_message(error.message, "error");
    }
}

async function simulate_reading()
{
    try
    {
        const state = await request_state("/api/simulate",
        {
            method: "POST"
        });

        render_dashboard(state);
        show_message("Reading updated", "success");
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

    if (!Number.isFinite(low) || !Number.isFinite(high))
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
        const state = await request_state("/api/alarms",
        {
            method: "PUT",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
            {
                lowAlarmC: low,
                highAlarmC: high
            })
        });

        render_dashboard(state);
        show_message("Alarm limits updated", "success");
    }
    catch (error)
    {
        show_message(error.message, "error");
    }
}

// Startup

function initialise()
{
    refresh_button.addEventListener("click", simulate_reading);
    alarm_form.addEventListener("submit", apply_alarm_limits);

    load_state();
}

initialise();