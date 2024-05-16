async function setup(worker_name) {
  if ('serviceWorker' in navigator) {
    console.log('setup() starts worker registration: ' + worker_name);
    try {
      await navigator.serviceWorker.register(worker_name);
    } catch (error) {
      console.log(error);
      if (error.message.startsWith('Failed to register a ServiceWorker')) {
        return 'blocked';
      } else {
        return 'unknown_error';
      }
    }
    await navigator.serviceWorker.ready;
    return 'ready';
  } else {
    const message = 'Workers not supported';
    console.error(message);
    throw message;
  }
}

function fetch_from_service_worker(url) {
  return new Promise(async resolve => {
    const registration = await navigator.serviceWorker.ready;
    const channel = new MessageChannel();
    channel.port1.onmessage = e => { resolve(e.data); };
    registration.active.postMessage({url}, [channel.port2]);
  });
}

function addChild(parent, expected_result) {
  let element = document.createElement("div");
  element.setAttribute("data-expectedresult", expected_result);
  element.innerHTML = "Target";
  document.getElementById(parent).appendChild(element);
}

function handleError() {
  addChild('blocked-target', 'fail');
  addChild('allowed-target', 'fail');
}