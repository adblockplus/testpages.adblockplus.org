"use strict";

let target = document.getElementById("script-target");
let newElement = document.createElement("div");
newElement.innerHTML = "Failed. Script ran and was applied to the page.";
newElement.className = "testcase-trigger-failed blocked";
target.appendChild(newElement);
console.log( "Failed. Script ran and was applied to the page." );
