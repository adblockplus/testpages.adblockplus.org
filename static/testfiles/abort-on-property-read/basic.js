aoprb = false;

setTimeout(() =>
{
  let target = document.getElementById("basic-target");
  target.querySelector(".testcase-waitingcontent").remove();

  if (!aoprb)
  {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    target.appendChild(failElement);
    console.log("Failed. Script ran and was applied to the page. (basic)");
    aoprb = true;
  }
},
500);
