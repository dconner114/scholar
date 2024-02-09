function showTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const entryForm = document.getElementById("entryForm");
    // Function to fetch and display logs data
    function displayLogsData() {
        fetch('/api/logs')
            .then(response => response.json())
            .then(data => {
                // Assuming your table has an id of 'logsTable'
                const table = document.getElementById('logsTable');

                // Clear existing rows
                table.querySelector('tbody').innerHTML = '';

                // Append new rows with formatted date
                data.forEach(row => {
                    const formattedDate = formatDate(row.date);

                    const newRow = `<tr>
                        <td>${row.course_name || ''}</td>
                        <td>${row.project_name || ''}</td>
                        <td>${formattedDate}</td>
                        <td>${row.start_time}</td>
                        <td>${row.end_time}</td>
                        <td>${row.description || ''}</td>
                        <td>${row.total_time}</td>
                    </tr>`;
                    table.querySelector('tbody').insertAdjacentHTML('beforeend', newRow);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Call the function when the page loads
    displayLogsData();

    function displayModal() {
        if (entryForm) {
            entryForm.reset();
        }

        // Fetch data for populating select elements
        fetch('/api/options') // Replace with your actual API endpoint
        .then(response => response.json())
        .then(data => {
            // Assuming you have 'course' and 'project' select elements
            const courseSelect = document.getElementById('course');
            const projectSelect = document.getElementById('project');

            // Clear existing options
            courseSelect.innerHTML = '';
            projectSelect.innerHTML = '';

            // Append default
            const option = document.createElement('option');
            option.value = "none";
            option.textContent = "none";
            courseSelect.appendChild(option);
            projectSelect.appendChild(option);

            // Populate options
            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course; // Replace with your actual value property
                option.textContent = course; // Replace with your actual text property
                courseSelect.appendChild(option);
            });

            data.projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id; // Replace with your actual value property
                option.textContent = project; // Replace with your actual text property
                projectSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching options:', error));
        
        // Add event listener for the escape key
        document.addEventListener("keydown", handleEscapeKey);

        // Display the overlay and modal
        entryModal.style.display = "block";
        overlay.style.display = "block";
    }

    function hideModal() {
        entryModal.style.display = "none";
        overlay.style.display = "none";
    }

    // Function to handle the escape key press
    function handleEscapeKey(event) {
        if (event.key === "Escape") {
            hideModal();
        }
    }

    // Add listener for entry modal functionality
    const entryButton = document.getElementById("newEntryButton");
    const closeButton = document.getElementById("close");
    const entryModal = document.getElementById("entryModal");
    entryModal.style.display = "none";
    const overlay = document.getElementById("overlay");

    if (entryButton && entryModal) {
        entryModal.style.display = "none";
        entryButton.addEventListener("click", displayModal);
        closeButton.addEventListener("click", hideModal);
    }

    // Function to format the date as mm-dd-yyyy
    function formatDate(rawDate) {
        const dateString = rawDate.toString(); // Convert to string
        const year = dateString.substring(2, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${month}-${day}-${year}`;
    }

    function submitForm(event) {
        event.preventDefault();
        console.log('submitting');
        // Get form data
        const formData = new FormData(entryForm);

        // Fetch POST request to your backend endpoint
        fetch('/api/submit', {
            method: 'POST',
            'Content-Type': 'application/json', // Adjust the content type based on your backend requirements
            body: JSON.stringify(Object.fromEntries(formData)), // Convert FormData to JSON
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle the response from the server if needed
            console.log('Server response:', data);
            // After processing the form data, you may want to hide the modal
            hideModal();
        })
        .catch(error => {
            console.error('Error sending data to the server:', error);
        });
    }

    function newCourse(event) {
        event.preventDefault();
        return;
    }
    function newProject(event) {
        event.preventDefault();
        return;
    }
});