"use strict";

let target = document.getElementById("script-target");
let newElement = document.createElement("div");
newElement.innerHTML = "Failed. Script ran and was applied to the page.";
newElement.setAttribute("data-expectedresult", "fail");
target.appendChild(newElement);
