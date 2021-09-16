"use strict";

const delayInMilliseconds = 1000;

setTimeout(() =>
{
  const testCases = ["aside", "input", "img"];
  testCases.forEach(elementType =>
  {
    let target = document.getElementById(`${elementType}-script-target`);
    let newElement = document.createElement(elementType);
    newElement.innerHTML = "Failed.";
    newElement.setAttribute("data-expectedresult", "fail");
    newElement.setAttribute("aria-label", "script-fail");
    newElement.id = `${elementType}-eh`;
    target.appendChild(newElement);
  });
}, delayInMilliseconds);
