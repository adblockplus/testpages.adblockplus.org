/* eslint-disable strict */

function maybeDelayedTest(callback) {
  let params = new URLSearchParams(location.search);
  let ms = params.has("delay") ? parseInt(params.get("delay"), 10) : 0;
  if (ms)
    setTimeout(callback, ms);
  else
    callback();
}
