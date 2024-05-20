"use strict";

async function removeWorkers() {
  if (!("serviceWorker" in navigator))
    throw "Workers not supported";
  const registrations = await navigator.serviceWorker.getRegistrations();
  return new Promise(resolve => {
    for (let registration of registrations)
      registration.unregister();
    resolve(registrations.length);
  });
}

async function setup(workerName) {
  if (!("serviceWorker" in navigator))
    throw "Workers not supported";
  try {
    // Adding date param prevents from fetching worker from a cache
    await navigator.serviceWorker.register(workerName + "?" + Date.now(), {scope: location.pathname});
  }
  catch (error) {
    return "blocked";
  }
  await navigator.serviceWorker.ready;
  return "ready";
}

async function fetchFromServiceWorker(url) {
  const registration = await navigator.serviceWorker.ready;
  return new Promise(resolve => {
    const channel = new MessageChannel();
    channel.port1.onmessage = e => resolve(e.data);
    registration.active.postMessage({url}, [channel.port2]);
  });
}

function addChild(parent, expectedResult) {
  let element = document.createElement("div");
  element.setAttribute("data-expectedresult", expectedResult);
  element.innerHTML = "Target";
  document.getElementById(parent).appendChild(element);
}

function handleError() {
  addChild("blocked-target", "fail");
  addChild("allowed-target", "fail");
}
