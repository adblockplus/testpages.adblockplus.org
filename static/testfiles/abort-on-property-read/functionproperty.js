aoprf = {fp: function () {}};

setTimeout(() =>
{
  let target = document.getElementById("functionproperty-target");
  target.querySelector(".testcase-waitingcontent").remove();

  if (!aoprf.fp())
  {
    let target = document.getElementById("functionproperty-target");
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    target.appendChild(failElement);
    console.log("Failed. Script ran and was applied to the page. (functionproperty)");
  }
},
500);
