

document.addEventListener('DOMContentLoaded', function () {

    const ctx = document.getElementById('historyChart');

    new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
    });

    let modalVisibility = false;

    // Function to fetch and display logs data
    function loadLogsData() {
        fetch('/api/logs')
            .then(response => response.json())
            .then(data => {
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
    loadLogsData();

    // function to load 
    function loadCourseData() {
        fetch('/api/courses')
            .then(response => response.json())
            .then(data => {
                const table = document.getElementById('courseTable');

                table.querySelector('tbody').innerHTML = '';

                data.forEach(row => {
                    const newRow = `<tr>
                    <td>${row.course_name}</td>
                    <td>${row.description || ''}</td>
                    <td>${formatTime(row.total_time)}</td>
                    <tr>`
                    table.querySelector('tbody').insertAdjacentHTML('beforeend', newRow);
                })
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    loadCourseData()

    function loadProjectData() {
        fetch('/api/projects')
            .then(response => response.json())
            .then(data => {
                data.forEach(row => {

                })
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    loadProjectData()


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

            // Append default "none" option to both select elements
            const noneOption = document.createElement('option');
            noneOption.value = "none";
            noneOption.textContent = "none";
            courseSelect.appendChild(noneOption.cloneNode(true));
            projectSelect.appendChild(noneOption.cloneNode(true));

            // Populate options
            data.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course; 
                option.textContent = course; 
                courseSelect.appendChild(option);
            });

            data.projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project; 
                option.textContent = project; 
                projectSelect.appendChild(option);
            });

            modalVisibility = true;
        })
        .catch(error => console.error('Error fetching options:', error));

        // Display the overlay and modal
        entryModal.style.display = "block";
        overlay.style.display = "block";
    }

    function hideModal() {
        entryModal.style.display = "none";
        overlay.style.display = "none";
        modalVisibility = false;
    }

    // Add event listener for the escape key
    document.addEventListener("keydown", handleEscapeKey);

    // Function to handle the escape key press and add entry shortcuts
    function handleEscapeKey(event) {
        if (event.key === "Escape") {
            hideModal();
        } else if ((event.key === 'a' || event.key ==='A') && !modalVisibility) {
            displayModal();
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

    function formatTime(minutes) {
        if (typeof minutes !== 'number' || isNaN(minutes)) {
            return 'Invalid input';
        }
    
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

    
        const formattedTime = `${hours}hr ${remainingMinutes > 0 ? remainingMinutes + 'm': ''}`;
    
        return formattedTime;
    }

    // Function to format the date as mm-dd-yyyy
    function formatDate(rawDate) {
        const dateString = rawDate.toString(); // Convert to string
        const year = dateString.substring(2, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${month}-${day}-${year}`;
    }

    function newCourse(event) {
        event.preventDefault();
        return;
    }
    
    function newProject(event) {
        event.preventDefault();
        return;
    }

    document.getElementById('entryForm').addEventListener('submit', function (event) {
        event.preventDefault();
    
        // Serialize the form data
        var formData = new FormData(this);
    
        // Convert FormData to an object
        var formDataObject = {};
        formData.forEach(function(value, key){
            formDataObject[key] = value;
        });
    
        // Send a standard form submission
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => response.json())
        .then(data => {

            hideModal();
            // Reload the page after displaying the alert
            location.reload();

            // Display a success message on the index page
            alert(data.message);
        })
        .catch(error => {
            // Handle errors if needed
            console.error('Error submitting form', error);
            alert('Error submitting form');
        });
    });
});