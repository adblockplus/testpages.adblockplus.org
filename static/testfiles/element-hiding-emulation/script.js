"use strict";

let HEAD = document.getElementsByTagName("head")[0];
let s = document.createElement("Link");
s.rel = "stylesheet";
s.href = "/testfiles/element-hiding-emulation/stylesheet.css";
HEAD.appendChild(s);
console.log("Done");
