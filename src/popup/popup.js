document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("report-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        const videoUrl = document.getElementById("video-url").value;
        const issue = document.getElementById("issue").value;
        const correctSource = document.getElementById("correct-source").value;

        // Prepare the data to send
        const reportData = {
            videoUrl: videoUrl,
            issue: issue,
            correctSource: correctSource
        };

        try {
            const response = await fetch("http://localhost:3000/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reportData),
            });

            // Ensure the response is parsed correctly
            const result = await response.json();

            if (response.ok) {
                alert("Report submitted successfully!");
                form.reset(); // Clear the form after successful submission
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Failed to submit the report. Please try again.");
        }
    });
});
