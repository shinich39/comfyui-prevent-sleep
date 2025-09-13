"use strict";

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const Settings = {
  Duration: 0, // infinite
  ScreenSaver: false,
  Sleep: true,
}

let initialized = false,
    timer;

async function chkDependencies() {
  const response = await api.fetchApi(`/shinich39/comfyui-prevent-sleep/check-dependencies`);
  return response.status === 200;
}

async function setSleep(value) {
  const url = value 
    ? `/shinich39/comfyui-prevent-sleep/prevent-sleep`
    : `/shinich39/comfyui-prevent-sleep/allow-sleep`;

  const response = await api.fetchApi(url);
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
}

async function setScreenSaver(value) {
  const url = value 
    ? `/shinich39/comfyui-prevent-sleep/prevent-screen-saver`
    : `/shinich39/comfyui-prevent-sleep/allow-screen-saver`;

  const response = await api.fetchApi(url);
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
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
  clearTimer();

  if (!initialized) {
    console.warn("[comfyui-prevent-sleep] not intialized yet");
    return;
  }

  if (Settings.ScreenSaver) {
    setScreenSaver(true);
  }

  if (Settings.Sleep) {
    setSleep(true);
  }

  const duration = Settings.Duration;
  if (duration < 1) {
    return;
  }

  timer = setTimeout(async () => {
    setSleep(false);
    setScreenSaver(false);
  }, 1000 * duration);
}

app.registerExtension({
	name: "shinich39.PreventSleep",
  settings: [
    {
      id: 'shinich39.PreventSleep.Timeout',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'Duration'],
      name: 'Duration',
      type: 'number',
      tooltip: 'When generating image ended, it will allow prevented options after set time has passed, value is seconds, 0 is infinite',
      defaultValue: Settings.Duration,
      onChange: async (value) => {
        Settings.Duration = value;
        setTimer();
      }
    },
    {
      id: 'shinich39.PreventSleep.ScreenSaver',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'ScreenSaver'],
      name: 'Screen Saver',
      type: 'boolean',
      defaultValue: Settings.ScreenSaver,
      onChange: async (value) => {
        Settings.ScreenSaver = value;
        setTimer();
      }
    },
    {
      id: 'shinich39.PreventSleep.Sleep',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'Sleep'],
      name: 'Sleep',
      type: 'boolean',
      defaultValue: false,
      onChange: async (value) => {
        Settings.Sleep = value;
        setTimer();
      }
    },
  ],

  setup() {
    api.addEventListener("promptQueued", function(...args) {
      setTimer();
    });

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
        console.log("[comfyui-prevent-sleep] initialized");
        setTimer();
      } else {
        console.log("[comfyui-prevent-sleep] failed to initialize");
      }
    })();
  },
});