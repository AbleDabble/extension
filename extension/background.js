// browser.tabs.reload();
function listenForClicks(){
    document.addEventListener("click", (e) => {
        console.log("Copnnaskldfja");
        // function newGame(tabs) {
        //     console.log("new game sending message")
        //     browser.tabs.sendMessage(tabs[0].id, {
        //         command: "new",
        //     });
        // }

        // function reportError(error) {
        //     console.error(`Could not beastify: ${error}`);
        // }

        // /**
        //  * Remove the page-hiding CSS from the active tab,
        //  * send a "reset" message to the content script in the active tab.
        //  */
        // if(e.target.type === 'new'){
        //     console.log("New game calling function  ")
        //     browser.tabs.query({active: true, currentWindow: true})
        //     .then(newGame)
        //     .catch(reportError);
        // }
        
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