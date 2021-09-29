"use strict";

const propertiesToUse = '{"jsonprune": "true", "data-expectedresult": "fail"}';
const propertiesObject = JSON.parse(propertiesToUse);

setTimeout(() =>
{
  removeWaitingContent(); // eslint-disable-line no-undef
  let targetTestCase = document.getElementById("testcase-area");
  let divToManipulate = document.createElement("div");
  divToManipulate.id = "fail";
  targetTestCase.appendChild(divToManipulate);

  if (propertiesToUse)
  {
    for (let property in propertiesObject)
    {
      let attr = document.createAttribute(property);
      attr.value = propertiesObject[property];
      document.getElementById("fail").setAttributeNode(attr);
    }
  }
}, 500);
