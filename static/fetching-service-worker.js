async function handleEvent(event) {
  const responder = event.ports[0];
  try {
    console.log('Worker fetches: ' + event.data.url);
    const response = await fetch(event.data.url);
    if (!response.ok) {
      responder.postMessage('bad response');
      return;
    }
    const text = await response.text();
    responder.postMessage('fetch completed');
  } catch (error) {
    responder.postMessage(`${error}`);
  }
}

self.addEventListener('message', event => {
  event.waitUntil(handleEvent(event));
});