"use strict";

function addTarget(id, expectedResult, innerHTML) {
  let target = document.createElement("div");
  target.id = Math.random().toString(36).substring(2);
  target.setAttribute("data-expectedresult", expectedResult);
  target.setAttribute("aria-label", expectedResult);
  target.innerHTML = innerHTML;
  document.getElementById(`${id}-target`).appendChild(target);
  return target.id;
}

function verifyTargetRemainsVisible(targetNode, callWhenHidden) {
  // Observe attribute changes:
  const mutationObserverConfig = {attributes: true};

  // If the style.display changes to 'none', the snippet has
  // hidden the element. Notify callWhenHidden().
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        if (targetNode.style.display == "none") {
          callWhenHidden();
          observer.disconnect();
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, mutationObserverConfig);
}

setTimeout(() => {
  removeWaitingContent(); // eslint-disable-line no-undef

  addTarget(
    "basic",
    "fail",
    `<span>Failed. Element is not hidden.<br></span>
      <span class='label'><a href='#basic-target-ad'>basic-target-ad</a></span>`
  );
  let visibleElementId = addTarget(
    "comments",
    "pass",
    `<span>Should not be hidden</span>
      <span class='label' style='display: none'>
      <a href='#comments-target-ad'>comments-target-ad</a></span>`
  );

  // If the target that should not have been hidden was hidden,
  // insert a new "fail" element to indicate a failure.
  let targetNode = document.getElementById(visibleElementId);
  let failureCallback = () => {
    addTarget("comments", "fail", "<span>Element was hidden by snippet, despite mismatched searchStyle</span>");
  };
  verifyTargetRemainsVisible(targetNode, failureCallback);
}, 500);
