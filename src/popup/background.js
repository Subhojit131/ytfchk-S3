chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openPopup") {
    chrome.action.openPopup();
    sendResponse({ status: "popup opened" });
  } else if (message.action === "submitReport") {
    console.log("Received report data from content.js:", message.payload);

    // Send data to your backend API
    fetch("http://localhost:3000/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Report sent to backend:", data);
        sendResponse({ status: "success", response: data });
      })
      .catch((error) => {
        console.error("Error sending report:", error);
        sendResponse({ status: "error", error: error.message });
      });

    // Return true to keep sendResponse open for async operations
    return true;
  }
});
