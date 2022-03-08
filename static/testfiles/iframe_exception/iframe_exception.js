"use strict";

let parentFrame = document.getElementById("script-target");
let iframe = document.createElement("iframe");
iframe.src = "https://allowed.abptestpages.org/testfiles/iframe_exception/parent.html";
iframe.width = "300";
iframe.height = "300";
parentFrame.appendChild(iframe);
