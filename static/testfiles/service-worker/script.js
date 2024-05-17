"use strict";

async function setup(workerName) {
  if (!("serviceWorker" in navigator))
    throw "Workers not supported";
  try {
    await navigator.serviceWorker.register(workerName, {scope: location.pathname});
  }
  catch (error) {
    if (error.message.startsWith("Failed to register a ServiceWorker"))
      return "blocked";
    return "unknown_error";
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
