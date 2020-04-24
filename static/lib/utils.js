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

function expectedScreenshotsParam()
{
  let url = new URL(window.location.href);
  return url.searchParams.get("expected") == "1";
}

function expectedScreenshotsView()
{
  let documents = [document];
  while (documents.length > 0)
  {
    let doc = documents.shift();
    doc.body.classList.add("expected");
    for (let i = 0; i < doc.defaultView.frames.length; i++)
    {
      try
      {
        documents.push(doc.defaultView.frames[i].document);
      }
      catch (e) {}
    }
  }
}

function addViewToDocuments()
{
  expectedScreenshotsView();

  for (let frame of document.getElementsByTagName("iframe"))
    frame.contentDocument.defaultView.addEventListener("DOMContentLoaded", addViewToDocuments);
}

if (expectedScreenshotsParam())
  window.addEventListener("DOMContentLoaded", addViewToDocuments);
