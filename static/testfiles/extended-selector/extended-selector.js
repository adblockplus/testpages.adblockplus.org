"use strict";

// Simple closed shadow root with hide-if-contains
const hicSimpleShTarget = document.getElementById("hic-simple-sh-id");
const hicSimpleShRoot = hicSimpleShTarget.attachShadow({mode: "closed"});
const child = document.createElement("span");
child.innerHTML = "hic-simple-sh <br> Failed. Element is not hidden.";
hicSimpleShRoot.appendChild(child);

// Wrapping shadow root with hide-if-contains
const hicNestedShTarget = document.getElementById("hic-nested-sh-id");
const shadowRoot1 = hicNestedShTarget.attachShadow({mode: "closed"});
const parentElem = document.createElement("div");
shadowRoot1.appendChild(parentElem);
const nestedChild = document.createElement("span");
nestedChild.innerHTML = "hic-nested-sh <br> Failed. Element is not hidden.";
const shadowRoot2 = parentElem.attachShadow({mode: "closed"});
shadowRoot2.appendChild(nestedChild);

// Closed shadow root wraps several elements with hide-if-contains
const wrappingElem = document.getElementById("wrapping-sh-root");
const wrappingShadowRoot = wrappingElem.attachShadow({mode: "closed"});
const hicWrappingShStyle = document.createElement("style");
hicWrappingShStyle.textContent = `
    :host .testcase-examplecontent,
    :host .testcase-expected-view,
    [data-expectedresult="pass"] {
        flex-grow: 1;
        padding: 0.5em;
        color: #fff;
        background-color: #0dc74b;
    }

    :host [data-expectedresult="fail"] {
        flex-grow: 1;
        padding: 0.5em;
        color: #fff;
        background-color: #c70d2c;
    }
`;
wrappingShadowRoot.appendChild(hicWrappingShStyle);

const testcaseExamplecontent = document.createElement("div");
testcaseExamplecontent.classList.add("testcase-examplecontent");
testcaseExamplecontent.textContent = "Example Content";
wrappingShadowRoot.appendChild(testcaseExamplecontent);

const testcaseContent = document.createElement("div");
testcaseContent.classList.add("testcase-content");
testcaseContent.setAttribute("data-expectedresult", "fail");
testcaseContent.innerHTML = "hic-wrapping-sh <br> Failed. Element is not hidden.";
wrappingShadowRoot.appendChild(testcaseContent);

const testcaseExpectedView = document.createElement("div");
testcaseExpectedView.setAttribute("data-expectedresult", "pass");
testcaseExpectedView.textContent = "Should not be hidden";
wrappingShadowRoot.appendChild(testcaseExpectedView);

// Closed shadow root with hide-if-contains-visible-text
const label = document.getElementById("label");
const labelShRoot = label.attachShadow({mode: "closed"});

const styleHicvt = document.createElement("style");
styleHicvt.innerHTML = `
    :host .transparent {
        opacity: 0;
        position: absolute;
        display: block;
        color: transparent;
    }

    :host .zerosize {
        font-size: 0;
    }

    :host div {
        display: block;
    }

    :host .a {
        display: inline-block;
        white-space: pre-wrap;
    }
`;
labelShRoot.appendChild(styleHicvt);

const textWrapper = document.createElement("div");

const child1 = document.createElement("div");
child1.classList.add("a", "transparent");
child1.textContent = "hi";
textWrapper.appendChild(child1);

const child2 = document.createElement("div");
child2.classList.add("a");
child2.textContent = "hi";
textWrapper.appendChild(child2);

const child3 = document.createElement("div");
child3.classList.add("a", "zerosize");
child3.textContent = "hi";
textWrapper.appendChild(child3);

const child4 = document.createElement("div");
child4.classList.add("a", "transparent");
child4.textContent = "cvt";
textWrapper.appendChild(child4);

const child5 = document.createElement("div");
child5.classList.add("a");
child5.textContent = "cvt-test";
textWrapper.appendChild(child5);

const child6 = document.createElement("div");
child6.classList.add("a", "zerosize");
child6.textContent = "cvt";
textWrapper.appendChild(child6);

labelShRoot.appendChild(textWrapper);

// Simple closed shadow root with hide-if-contains-and-matches-style
const labelTarget = document.getElementById("hicamss-target");
const hicamssShRoot = labelTarget.attachShadow({mode: "closed"});
const hicamssLabel = document.createElement("span");
hicamssLabel.textContent = "hicamss. Failed. Element not hidden";
hicamssLabel.className = "label";
hicamssShRoot.appendChild(hicamssLabel);

// Simple closed shadow root with hide-if-has-and-matches-style
const spanTargetHihamss = document.getElementById("hihamss-target");
const hihamssShRoot = spanTargetHihamss.attachShadow({mode: "closed"});
const hihamssSpan = document.createElement("span");
const hihamssA = document.createElement("a");
hihamssA.setAttribute("href", "#hihamss");
hihamssA.setAttribute("style", "color: inherit; text-decoration: none;");
hihamssA.textContent = "hihamss";
hihamssSpan.innerHTML += "Failed. Element should be hidden.<br>";
hihamssSpan.appendChild(hihamssA);
hihamssShRoot.appendChild(hihamssSpan);

// Handle expected views for test screenshots
const isExpectedMode = window.location.search.indexOf("expected=1") >= 0;
if (isExpectedMode) {
  testcaseContent.style.display = "none";
  testcaseExpectedView.classList.add("testcase-expected-view");
  document.getElementById("hicams-sh-fake-target").classList.add("testcase-expected-view");
  document.getElementById("hihams-sh-fake-target").classList.add("testcase-expected-view");
}
