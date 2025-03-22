function insertFactCheckerForm() {
  let formContainer = null; // Track the form container globally
  let isFormClosed = false; // Track if the form is manually closed

  const checkForButton = () => {
    if (isFormClosed) return;

    let subscribeButton = document.querySelector(
      "#subscribe-button ytd-subscribe-button-renderer"
    );
    let existingForm = document.getElementById("fact-check-form-container");

    if (subscribeButton && !existingForm) {
      formContainer = document.createElement("div");
      formContainer.id = "fact-check-form-container";

      let style = document.createElement("style");
      style.textContent = `
                #fact-check-form-container {
                    position: absolute;
                    padding: 15px;
                    border: 1px solid #ccc;
                    background: white;
                    color: black;
                    border-radius: 5px;
                    width: 300px;
                    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                    font-family: Arial, sans-serif;
                    z-index: 1000;
                }
                #close-button {
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    font-size: 20px;
                    cursor: pointer;
                    color: #888;
                }
                #close-button:hover {
                    color: #000;
                }
                nav ul {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                nav ul li {
                    display: inline;
                }
                nav ul li a {
                    text-decoration: none;
                    color: blue;
                    font-weight: bold;
                    cursor: pointer;
                }
                h2 {
                    font-size: 20px;
                    text-align: center;
                }
                h3 {
                    font-size: 16px;
                    margin-bottom: 8px;
                }
                input, textarea {
                    width: 100%;
                    padding: 6px;
                    margin-top: 4px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    padding: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                }
                button:hover {
                    background-color: #0056b3;
                }
                #report-container {
                    margin-top: 10px;
                    padding: 20px;
                    border-top: 1px solid #ddd;
                    display: none;
                }
                #report-form {
                    padding-right: 15px;
                }
            `;
      document.head.appendChild(style);

      formContainer.innerHTML = `
                <div id="close-button">×</div>
                <header>
                    <nav>
                        <ul>
                            <li><a href="#" id="home-link">Home</a></li>
                            <li><a href="#" id="display-link">Display</a></li>
                        </ul>
                    </nav>
                </header>
                <h2>YouTube Fact Checker</h2>
                <br>
                <form id="report-form">
                    <h3>Report Incorrect Facts</h3>
                    <label for="video-url">Video URL:</label>
                    <input type="url" id="video-url" name="video-url" required readonly>
                    <br><br>
                    <label for="issue">Describe the incorrect fact:</label>
                    <textarea id="issue" name="issue" required></textarea>
                    <br><br>
                    <label for="correct-source">Source for the correct fact:</label>
                    <input type="url" id="correct-source" name="correct-source" required>
                    <br><br>
                    <button type="submit" id="submit-btn">Submit Report</button>
                </form>
                <div id="report-container"></div>
            `;

      document.body.appendChild(formContainer);

      const rect = subscribeButton.getBoundingClientRect();
      let leftPosition = window.scrollX + rect.right + 15;
      let topPosition = window.scrollY + rect.top;

      if (leftPosition + 320 > window.innerWidth) {
        leftPosition = window.scrollX + rect.left - 320;
      }

      formContainer.style.top = `${topPosition}px`;
      formContainer.style.left = `${leftPosition}px`;

      function updateVideoUrl() {
        let videoInput = document.getElementById("video-url");
        if (videoInput) {
          videoInput.value = window.location.href;
        }
      }

      updateVideoUrl();
      setInterval(updateVideoUrl, 2000);

      // Close button functionality
      const closeButton = document.getElementById("close-button");
      if (closeButton) {
        closeButton.addEventListener("click", function (event) {
          event.stopPropagation();
          console.log("Close button clicked");
          if (formContainer && formContainer.parentNode) {
            formContainer.remove();
            isFormClosed = true;
            console.log("Form container removed");
          } else {
            console.error("Form container not found or already removed");
          }
        });
      } else {
        console.error("Close button not found!");
      }

      document
        .getElementById("report-form")
        .addEventListener("submit", function (event) {
          event.preventDefault();
          const videoUrl = document.getElementById("video-url").value.trim();
          const issue = document.getElementById("issue").value.trim();
          const correctSource = document
            .getElementById("correct-source")
            .value.trim();

          if (!videoUrl || !issue || !correctSource) {
            alert("All fields are required!");
            return;
          }

          chrome.storage.local.get({ reports: {} }, function (data) {
            let reports = data.reports;

            if (!reports[videoUrl]) {
              reports[videoUrl] = [];
            }

            // Add new report
            const report = {
              issue,
              correctSource,
              timestamp: new Date().toISOString(),
            };
            reports[videoUrl].push(report);

            chrome.runtime.sendMessage(
              {
                action: "submitReport",
                payload: {
                  videoUrl: videoUrl,
                  issue: issue,
                  correctSource: correctSource,
                },
              },
              (response) => {
                console.log("Response from background.js:", response);
                if (response && response.status === "success") {
                  alert("Report submitted successfully!");
                  document.getElementById("report-form").reset();
                  showReports();
                } else {
                  alert("Failed to submit the report.");
                }
              }
            );
          });
        });

      document
        .getElementById("display-link")
        .addEventListener("click", function (event) {
          event.preventDefault();
          document.getElementById("report-form").style.display = "none";
          document.getElementById("report-container").style.display = "block";
          showReports();
        });

      document
        .getElementById("home-link")
        .addEventListener("click", function (event) {
          event.preventDefault();
          document.getElementById("report-form").style.display = "block";
          document.getElementById("report-container").style.display = "none";
        });

      function showReports() {
        chrome.storage.local.get({ reports: {} }, function (data) {
          const reports = data.reports;
          const reportContainer = document.getElementById("report-container");
          reportContainer.innerHTML = "<h2>Submitted Reports</h2>";

          if (Object.keys(reports).length === 0) {
            reportContainer.innerHTML += "<p>No reports submitted yet.</p>";
            return;
          }

          Object.entries(reports).forEach(([videoUrl, reportList]) => {
            reportContainer.innerHTML += `
                            <hr>
                            <h3>Reports for Video: <a href="${videoUrl}" target="_blank">${videoUrl}</a></h3>
                        `;

            reportList.forEach((report, index) => {
              reportContainer.innerHTML += `
                                <p><strong>Report #${index + 1}</strong></p>
                                <p><strong>Issue:</strong> ${report.issue}</p>
                                <p><strong>Correct Source:</strong> <a href="${report.correctSource}" target="_blank">${report.correctSource}</a></p>
                                <p><strong>Submitted on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                                <hr>
                            `;
            });
          });
        });
      }
    } else if (!subscribeButton && existingForm) {
      existingForm.remove(); // Remove the form if the subscribe button disappears
    }
  };

  const observer = new MutationObserver(() => checkForButton());
  observer.observe(document.body, { childList: true, subtree: true });

  checkForButton();
}

insertFactCheckerForm();
