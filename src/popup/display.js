
document.addEventListener("DOMContentLoaded", function () {
    const reportContainer = document.getElementById("report-container");

    chrome.storage.local.get({ reports: [] }, function (data) {
        const reports = data.reports;
        if (reports.length === 0) {
            reportContainer.innerHTML = "<p>No reports submitted yet.</p>";
            return;
        }

        reports.forEach((report, index) => {
            const reportElement = document.createElement("div");
            reportElement.innerHTML = `
                <hr>
                <h3>Report #${index + 1}</h3>
                <p><strong>Video URL:</strong> <a href="${report.videoUrl}" target="_blank">${report.videoUrl}</a></p>
                <p><strong>Issue:</strong> ${report.issue}</p>
                <p><strong>Correct Source:</strong> <a href="${report.correctSource}" target="_blank">${report.correctSource}</a></p>
                <p><strong>Submitted on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
            `;
            reportContainer.appendChild(reportElement);
        });
    });
});
