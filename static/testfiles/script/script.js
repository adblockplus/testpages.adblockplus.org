"use strict";

let target = document.getElementById("script-target");
let newElement = document.createElement("div");
newElement.innerHTML = "Failed. Script ran and was applied to the page.";
newElement.setAttribute("data-expectedresult", "fail");
newElement.setAttribute("aria-label", "script-fail");
target.appendChild(newElement);
