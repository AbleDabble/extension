/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = `body > :not(.beastify-image) {
                    display: none;
                  }`;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {

    function newGame(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        command: "New Game",
      });
    }

    function checkMoveList(tabs){
      browser.tabs.sendMessage(tabs[0].id, {
        command: "Check Move List",
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({code: hidePage}).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "test",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    if (!e.target.closest("#popup-content")) {
      // Ignore when click is not on a button within <div id="popup-content">.
      return;
    } 

    if (e.target.textContent === "New Game") {
      console.log("Sending message");
      browser.tabs.query({active: true, currentWindow: true})
        .then(newGame)
        .catch(reportError);
    } 
    if(e.target.textContent === "Check Move List"){
      browser.tabs.query({active: true, currentWindow: true})
        .then(checkMoveList)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  console.error(`Failed to execute beastify content script: ${error.message}`);
  console.error("error:", error);
}

const slider = document.getElementById("depth");
const useTime = document.getElementById("use-time")
const time = document.getElementById("time")

slider.addEventListener("mouseup", (event) => {
  const value = event.target.value;
  browser.tabs.query({active: true, currentWindow: true}).then( (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "Depth",
        depth: value
    });
  });
  storeDepthValue(value);
  console.log(value)
});

useTime.addEventListener("change", (event) => {
  const value = event.target.checked
  browser.tabs.query({active: true, currentWindow: true}).then( (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "Use Time",
        useTime: value
    });
  });
  storeUseTimeValue(value);
});

time.addEventListener("blur", (event) => {
  const value = event.target.value;
  browser.tabs.query({active: true, currentWindow: true}).then( (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "Time",
        time: value
    });
  });
  storeTimeValue(value);
});

// Store the depth value in the browser's storage
function storeDepthValue(depth) {
  browser.storage.local.set({ depth });
}

// Retrieve the depth value from the browser's storage
function getStoredDepthValue() {
  return browser.storage.local.get("depth");
}

// Store the time value in the browser's storage
function storeTimeValue(time) {
  browser.storage.local.set({ time });
}

// Retrieve the depth value from the browser's storage
function getStoredTimeValue() {
  return browser.storage.local.get("time");
}


// Store the depth value in the browser's storage
function storeUseTimeValue(useTime) {
  browser.storage.local.set({ useTime });
}

// Retrieve the depth value from the browser's storage
function getStoredUseTimeValue() {
  return browser.storage.local.get("useTime");
}

browser.storage.local.get(["time", "depth", "useTime"]).then((storedValues) => {
  time.value = storedValues.time || 1000;
  slider.value = storedValues.depth || 12;
  useTime.checked = storedValues.useTime || false;
});

browser.tabs.executeScript({file: "/monitor.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);

