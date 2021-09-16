"use strict";
var testCases = ["div", "p", "input", "img"];

testCases.forEach(elementType => {
    let target = document.getElementById(`${elementType}-script-target`);
    let newElement = document.createElement(elementType);
    newElement.innerHTML = "Failed. Script ran and was applied to the page.";
    newElement.setAttribute("data-expectedresult", "fail");
    newElement.setAttribute("aria-label", "script-fail");
    newElement.id = `${elementType}-eh`;
    target.appendChild(newElement);
});



