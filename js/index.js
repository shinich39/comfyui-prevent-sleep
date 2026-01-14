"use strict";

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

let initialized = false,
    timer;

function getSettingValue(id) {
  return app.extensionManager.setting.get(`shinich39.PreventSleep.${id}`);
}

async function chkDependencies() {
  const response = await api.fetchApi(`/shinich39/comfyui-prevent-sleep/check-dependencies`);
  return response.status === 200;
}

async function update(type) {
  const url = type !== "none" 
    ? `/shinich39/comfyui-prevent-sleep/enable`
    : `/shinich39/comfyui-prevent-sleep/disable`

  const response = await api.fetchApi(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", },
    body: JSON.stringify({ type }),
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  return type !== "none";
}

function wait(delay) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, delay);
  });
}

function clearTimer() {
  clearTimeout(timer);
}

function setTimer() {
  setTimeout(async () => {
    clearTimer();

    if (!initialized) {
      console.warn("[comfyui-prevent-sleep] not intialized yet");
      return;
    }

    const type = getSettingValue("Type");
    // console.log(`[comfyui-prevent-sleep] type:`, type);

    const enabled = await update(type);

    if (!enabled) {
      return;
    }

    const duration = getSettingValue("Duration");
    // console.log(`[comfyui-prevent-sleep] duration:`, duration);
    
    if (duration > 0) {
      timer = setTimeout(() => {
        update("none");
      }, 1000 * duration);
    }
  }, 256);
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
      onChange: async (value) => {
        setTimer();
      }
    },
    {
      id: 'shinich39.PreventSleep.Type',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'Type'],
      name: 'Type',
      type: "combo",
      defaultValue: "none",
      options: [
        { text: "None", value: "none" },
        { text: "Sleep", value: "sleep" },
        { text: "Screen Saver", value: "screen_saver" },
      ],
      onChange: async (value) => {
        setTimer();
      }
    },
  ],

  setup() {
    // api.addEventListener("promptQueued", function(...args) {
    //   setTimer();
    // });

    api.addEventListener("executed", function(...args) {
      setTimer();
    });

    ;(async () => {
      let retry = 39;
      initialized = await chkDependencies();
      while(!initialized && retry > 0) {
        await wait(1024);
        retry--;
        initialized = await chkDependencies();
      }

      if (retry > 0) {
        console.log("[comfyui-prevent-sleep] Initialized");
        setTimer();
      } else {
        console.log("[comfyui-prevent-sleep] Failed to initialize");
      }
    })();
  },
});