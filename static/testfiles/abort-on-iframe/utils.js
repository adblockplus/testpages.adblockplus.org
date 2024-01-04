"use strict";

// eslint-disable-next-line no-var
var [testAbortOnIframePropertyRead, testAbortOnIframePropertyWrite] = (function() {
  function insertFailElement(targetId) {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById(targetId).appendChild(failElement);
  }

  function appendIframe(id) {
    let iframeRef = document.createElement("iframe");
    iframeRef.id = id;
    iframeRef.style.display = "none";
    document.body.appendChild(iframeRef);
  }

  function getSubProperty(iframeWindow, path) {
    let object = iframeWindow;
    let chain = path.split(".");

    if (chain.length === 0)
      return;

    for (let i = 0; i < chain.length - 1; i++) {
      let prop = chain[i];
      if (!window.Object.prototype.hasOwnProperty.call(object, prop))
        return;

      object = object[prop];

      if (!(object instanceof window.Object))
        return;
    }

    let prop = chain[chain.length - 1];
    if (window.Object.prototype.hasOwnProperty.call(object, prop))
      return [object, prop];
  }

  function testAbortOnIframe(testName, properties, initializeIframe, isRead) {
    let iframeId = testName + "-iframe";
    let target = testName + "-target";
    try {
      appendIframe(iframeId);
      let iframe = document.querySelector("#" + iframeId);
      initializeIframe && initializeIframe(iframe);

      setTimeout(() => {
        try {
          let testPassed;
          removeWaitingContent(target); // eslint-disable-line no-undef

          for (let property of properties) {
            let propertyTestPassed = false;
            try {
              let [o, p] = getSubProperty(iframe.contentWindow, property);
              if (isRead)
                o[p];
              else
                o[p] = true;
            }
            catch (e) {
              if (e.name === "ReferenceError")
                propertyTestPassed = true;
              else
                throw e;
            }
            if (typeof testPassed === "undefined") // first property tested
              testPassed = propertyTestPassed;
            else
              testPassed = testPassed && propertyTestPassed;
          }

          if (!testPassed)
            insertFailElement(target);
        }
        catch (e) {
          insertFailElement(target);
        }
      }, 500);
    }
    catch (e) {
      insertFailElement(target);
    }
  }

  function testRead(testName, properties, initializeIframe) {
    testAbortOnIframe(testName, properties, initializeIframe, true);
  }

  function testWrite(testName, properties, initializeIframe) {
    testAbortOnIframe(testName, properties, initializeIframe, false);
  }

  return [testRead, testWrite];
})();
