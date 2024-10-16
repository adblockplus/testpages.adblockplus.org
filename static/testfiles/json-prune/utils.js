"use strict";

(function() {
  // Function 1: Initialize the base JSON string
  function initialize() {
    return `{
      "toBeDeletedIfStackNeedle": "delete-me"
    }`;
  }

  // Function 2: Add more properties to the JSON string
  function addProperties(baseJson) {
    let jsonObject = JSON.parse(baseJson);
    jsonObject.a = "a";  // Add new property
    return JSON.stringify(jsonObject);
  }

  // Function 3: Finalize the JSON string
  function finalize(jsonString) {
    return jsonString;
  }

  // Create the JSON string step by step
  let testProp = finalize(addProperties(initialize()));

  // Attach the final JSON string to the window object
  window.needleFunction = testProp;  // Now globally available as a JSON string
})();
