"use strict";

import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

async function sleep(value) {
  let path;
  if (value) {
    path = "prevent-sleep";
  } else {
    path = "allow-sleep";
  }

  const response = await api.fetchApi(`/shinich39/comfyui-prevent-sleep/${path}`);
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
}

async function screenSaver(value) {
  let path;
  if (value) {
    path = "prevent-screen-saver";
  } else {
    path = "allow-screen-saver";
  }

  const response = await api.fetchApi(`/shinich39/comfyui-prevent-sleep/${path}`);
  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
}

function wait(delay) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, delay);
  });
}

app.registerExtension({
	name: "shinich39.PreventSleep",
  settings: [
    {
      id: 'shinich39.PreventSleep.ScreenSaver',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'ScreenSaver'],
      name: 'Screen Saver',
      type: 'boolean',
      defaultValue: false,
      onChange: async (value) => {
        while(true) {
          try {
            await screenSaver(value);
            break;
          } catch(err) {
            console.error(err.message);
            await wait(1024);
          }
        }
      }
    },
    {
      id: 'shinich39.PreventSleep.Sleep',
      category: ['PreventSleep', 'The desktop screamed, Not in sound', 'Sleep'],
      name: 'Sleep',
      type: 'boolean',
      defaultValue: false,
      onChange: async (value) => {
        while(true) {
          try {
            await sleep(value);
            break;
          } catch(err) {
            console.error(err.message);
            await wait(1024);
          }
        }
      }
    },
  ]
});