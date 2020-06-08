"use strict";

function removeWaitingContent()
{
  let className = "testcase-waiting-content";
  let elements = document.getElementsByClassName(className);
  while (elements.length > 0)
  {
    elements[0].remove();
    elements = document.getElementsByClassName(className);
  }
}

function expectedParameter()
{
  let url = new URL(window.location.href);
  return url.searchParams.get("expected") == "1";
}

function expectedPageView()
{
  let documents = [document];
  while (documents.length > 0)
  {
    let doc = documents.shift();
    doc.body.classList.add("expected-view");
    for (let i = 0; i < doc.defaultView.frames.length; i++)
    {
      try
      {
        documents.push(doc.defaultView.frames[i].document);
      }
      catch (e) {}
    }
  }

  for (let frame of document.getElementsByTagName("iframe"))
    frame.contentDocument.defaultView.addEventListener("DOMContentLoaded", expectedPageView);
}

window.addEventListener("DOMContentLoaded", () =>
{
  if (expectedParameter())
    expectedPageView();
});
