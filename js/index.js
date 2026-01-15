"use strict";

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

let initialized = false,
    timer;

function getSettingValue(id) {
  return app.extensionManager.setting.get(`shinich39.PreventSleep.${id}`);
}

function wait(delay) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, delay);
  });
}

async function chkDependencies() {
  const response = await api.fetchApi(`/shinich39/comfyui-prevent-sleep/check-dependencies`);
  return response.status === 200;
}

async function update(mode) {
  const url = mode !== "none" 
    ? `/shinich39/comfyui-prevent-sleep/enable`
    : `/shinich39/comfyui-prevent-sleep/disable`

  const response = await api.fetchApi(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", },
    body: JSON.stringify({ mode }),
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
}

async function prevent() {
  if (!initialized) {
    console.warn("[comfyui-prevent-sleep] not intialized yet");
    return;
  }

  const mode = getSettingValue("Mode");
  const duration = getSettingValue("Duration");

  await update(mode);

  // console.log(`[comfyui-prevent-sleep] options`, { mode, duration });
}

function clearTimer() {
  clearTimeout(timer);
}

function setTimer() {
  const mode = getSettingValue("Mode");
  const duration = getSettingValue("Duration");

  if (mode === "none" || duration <= 0) {
    return;
  }

  // console.log(`[comfyui-prevent-sleep] timer: ${duration} seconds`);

  timer = setTimeout(() => {
    update("none");
    // console.log(`[comfyui-prevent-sleep] sleep enabled`);
  }, 1000 * duration);
}

app.registerExtension({
	name: "shinich39.PreventSleep",
  settings: [
    {
      id: 'shinich39.PreventSleep.Duration',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'Duration'],
      name: 'Duration',
      type: 'number',
      tooltip: 'When generating image ended, it will allow prevented options after set time has passed, value is seconds, 0 is infinite',
      defaultValue: 0,
      onChange: (value) => {
        setTimeout(async () => {
          clearTimer();
          await prevent();
          setTimer();
        }, 256);
      }
    },
    {
      id: 'shinich39.PreventSleep.Mode',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'Mode'],
      name: 'Mode',
      type: "combo",
      defaultValue: "none",
      options: [
        { text: "None", value: "none" },
        { text: "Sleep", value: "sleep" },
        { text: "Screen Saver", value: "screen_saver" },
      ],
      onChange: (value) => {
        setTimeout(async () => {
          clearTimer();
          await prevent();
          setTimer();
        }, 256);
      }
    },
  ],

  setup() {
    api.addEventListener("execution_start", function(...args) {
      clearTimer();
      prevent();
    });

    api.addEventListener("execution_interrupted", function(...args) {
      setTimer();
    });

    api.addEventListener("execution_success", function(...args) {
      setTimer();
    });

    api.addEventListener("execution_error", function(...args) {
      setTimer();
    });

    setTimeout(async () => {
      let retry = 39;
      initialized = await chkDependencies();
      while(!initialized && retry > 0) {
        await wait(1024);
        retry--;
        initialized = await chkDependencies();
      }

      if (retry > 0) {
        console.log("[comfyui-prevent-sleep] Initialized");
        clearTimer();
        await prevent();
        setTimer();
      } else {
        console.error(new Error("[comfyui-prevent-sleep] Failed to initialize"));
      }
    }, 1024);
  },
});