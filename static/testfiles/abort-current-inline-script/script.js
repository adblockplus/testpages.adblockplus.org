function injectScript(id, code)
{
  let script = document.createElement('script');
  script.textContent = `
    (function()
    {
      ${code}
      let failElement = document.createElement("div");
      failElement.textContent = "Failed. Script ran and was applied to the page.";
      failElement.className = "testcase-bad-element blocked";
      document.getElementById("${id}-target").appendChild(failElement);
      console.log('Failed. Script "${id}" ran completely and was applied to the page.');
    })();`;
  document.body.appendChild(script);
}

injectScript("basic", 'console.group("abort-current-inline-script");');
injectScript("search", 'console.info("acis-search");');
injectScript("regex", 'console.warn("acis-regex1");');
