aopr = {sp: false};

setTimeout(() =>
{
  let target = document.getElementById("subproperty-target");
  target.querySelector(".testcase-waitingcontent").remove();
  
  if (!aopr.sp)
  {
    let target = document.getElementById("subproperty-target");
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    target.appendChild(failElement);
    console.log("Failed. Script ran and was applied to the page. (subproperty)");
    aopr.sp = true;
  }
},
500);
