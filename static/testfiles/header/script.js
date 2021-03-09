"use strict";

let newElement = document.createElement("div");
newElement.innerHTML = "Failed. Script ran and was applied to the page.";
newElement.setAttribute("data-expectedresult", "fail");
document.getElementById("script-target").appendChild(newElement);
