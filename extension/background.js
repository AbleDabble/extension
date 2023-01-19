// browser.tabs.reload();
function listenForClicks(){
    document.addEventListener("click", (e) => {
        
    })
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

browser.tabs.executeScript({file: "/fen.js"}).then(listenForClicks).catch(reportExecuteScriptError);