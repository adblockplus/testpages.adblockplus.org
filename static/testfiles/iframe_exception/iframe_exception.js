"use strict";

let parentFrame = document.getElementById("script-target");
let iframe = document.createElement("iframe");
//iframe.src = "https://allowed.abptestpages.org/static/testfiles/iframe_exception/parent.html";
iframe.src = "/testfiles/iframe_exception/parent.html";
iframe.width = "620";
iframe.height = "620";
parentFrame.appendChild(iframe);
