"use strict";

let target = document.getElementById("rewrite-target");
let newElement = document.createElement("div");
newElement.innerHTML = "Failed. Script ran and was applied to the page.";
newElement.setAttribute("data-expectedresult", "fail");
newElement.id = "script-fail-1";
target.appendChild(newElement);
