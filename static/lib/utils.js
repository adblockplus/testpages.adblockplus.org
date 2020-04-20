"use strict";

function removeWaitingElements()
{
  for (let className of ["testcase-waitingcontent", "testcase-output-expected"])
  {
    let elements = document.getElementsByClassName(className);
    while (elements.length > 0)
    {
      elements[0].remove();
      elements = document.getElementsByClassName(className);
    }
  }
}
