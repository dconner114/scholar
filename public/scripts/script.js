

document.addEventListener('DOMContentLoaded', function () {

    function loadChartData() {
        fetch('/api/history') 
            .then(response => response.json())
            .then(data => {
                const ctx = document.getElementById('historyChart');
                
                dateLabels = data.map(item => {
                    const dateString = String(item.date);
                    return `${dateString.substring(4, 6)}/${dateString.substring(6, 8)}`;
                })

                new Chart(ctx, {
                    type: 'line',
                    data: {
                    labels: dateLabels,
                    datasets: [{
                        label: 'minutes',
                        data: data.map(item => item.total_time),
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
            })
            .catch(error => console.error('Error fetching chart data:', error));
    }
    loadChartData()

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

                    const newRow = `<tr class="entry" id=${row.id}>
                        <td class="left">${row.course_name || ''}</td>
                        <td>${row.project_name || ''}</td>
                        <td>${formattedDate}</td>
                        <td>${row.start_time}</td>
                        <td>${row.end_time}</td>
                        <td>${row.description || ''}</td>
                        <td>${formatTime(row.total_time)}</td>
                        <td class="right">
                            <button class="delete-btn" data-entry-id="${row.id}">Del</button>
                            <button class="edit-btn" data-entry-id="${row.id}">Edit</button>
                        </td>
                    </tr>`;
                    table.querySelector('tbody').insertAdjacentHTML('beforeend', newRow);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    loadLogsData();

    function loadCourseData() {
        fetch('/api/courses')
            .then(response => response.json())
            .then(data => {
                const table = document.getElementById('courseTable');
                table.querySelector('tbody').innerHTML = '';
                data.forEach(row => {
                    const newRow = `<tr class="entry">
                    <td class="left">${row.course_name}</td>
                    <td>${formatTime(row.total_time)}</td>
                    <td class="right">
                            <button class="delete-btn course-btn" id="confirm-req" data-entry-id="${row.id}">Del</button>
                            <button class="edit-btn course-btn" data-entry-id="${row.id}">Edit</button>
                        </td>
                    </tr>`
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
                const table = document.getElementById('projectTable');
                table.querySelector('tbody').innerHTML = '';
                data.forEach(row => {
                    const newRow = `<tr class="entry">
                    <td class="left">${row.project_name}</td>
                    <td>${formatTime(row.total_time)}</td>
                    <td class="right">
                            <button class="delete-btn project-btn" id="confirm-req" data-entry-id="${row.id}">Del</button>
                            <button class="edit-btn project-btn" data-entry-id="${row.id}">Edit</button>
                        </td>
                    <tr>`
                    table.querySelector('tbody').insertAdjacentHTML('beforeend', newRow);
                })
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    loadProjectData()

    function displayEntryModal() {
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
        hideModals();
        entryModal.style.display = "block";
        overlay.style.display = "block";
    }

    function displayCourseModal() {
        if (courseForm) {
            courseForm.reset();
        }

        // Display the overlay and modal
        hideModals();
        courseModal.style.display = "block";
        overlay.style.display = "block";
    }

    function displayProjectModal() {
        if (projectForm) {
            projectForm.reset();
        }

        // Display the overlay and modal
        hideModals();
        projectModal.style.display = "block";
        overlay.style.display = "block";
    }

    function displayConfirmationModal() {
        confirmationModal.style.display = "block";
        overlay.style.display = "block";
    }

    function hideModals() {
        modalElements.forEach(modal => {
            modal.style.display = "none";
        })
    }

    // Add event listener for the escape key
    document.addEventListener("keydown", handleEscapeKey);

    // Function to handle the escape key press and add entry shortcuts
    function handleEscapeKey(event) {
        if (event.key === "Escape") {
            hideModals()
        }
        // } else if ((event.key === 'a' || event.key ==='A') && !modalVisibility) {
        //     displayEntryModal();
        // }
    }

    function confirmDelete(button) {
        displayConfirmationModal()
    }

    // Add listener for entry modal functionality
    const entryButton = document.getElementById("newEntryButton");
    const courseButton = document.getElementById("newCourseButton");
    const projectButton = document.getElementById("newProjectButton");

    const entryModal = document.getElementById("entryModal");
    const courseModal = document.getElementById("courseModal");
    const projectModal = document.getElementById("projectModal");
    const confirmationModal = document.getElementById("confirmationModal");
    const overlay = document.getElementById("overlay");

    modalElements = [
        entryModal,
        courseModal,
        projectModal,
        confirmationModal,
        overlay,
    ]
    hideModals();
    
    const closeButtons = document.querySelectorAll('#close');
    closeButtons.forEach(button => {
        button.addEventListener('click', hideModals);
    });

    entryButton.addEventListener("click", displayEntryModal);
    courseButton.addEventListener("click", displayCourseModal);
    projectButton.addEventListener("click", displayProjectModal);

    // Display time in HhrMM format
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

    entryForm = document.getElementById('entryForm');
    entryForm.addEventListener('submit', function (event) {
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

            hideModals();
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

    courseForm = document.getElementById('courseForm');
    courseForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var formData = new FormData(this);

        var formDataObject = {};
        formData.forEach(function(value, key){
            formDataObject[key] = value;
        });
        fetch('/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => response.json())
        .then(data => {

            hideModals();
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
    })

    projectForm = document.getElementById('projectForm');
    projectForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var formData = new FormData(this);

        var formDataObject = {};
        formData.forEach(function(value, key){
            formDataObject[key] = value;
        });
        fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => response.json())
        .then(data => {

            hideModals();
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
    })

    // button styling script
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(0)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
    });

    document.body.addEventListener('click', function (event) {
        const target = event.target;

        // Check if the clicked element is a delete button with id "confirm-req"
        if (target.classList.contains('delete-btn')) {
            // Display the confirmation modal when the delete button is clicked
            displayConfirmationModal();

            // Add a click event listener to the confirm button in the confirmation modal
            const confirmButton = document.getElementById('confirm');
            confirmButton.addEventListener('click', function() {
                // Get the entry ID from the data-entry-id attribute
                const entryId = target.getAttribute('data-entry-id');

                if (target.classList.contains('course-btn')) {
                    // Send a request to the server to delete the item with the specified ID
                    fetch(`/api/courses/${entryId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the server response if needed
                        console.log(data);
                        location.reload();
                    })
                    .catch(error => {
                        console.error('Error deleting item:', error);
                    });
                } else if (target.classList.contains('project-btn')) {
                    // Send a request to the server to delete the item with the specified ID
                    fetch(`/api/projects/${entryId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the server response if needed
                        console.log(data);
                        location.reload();
                    })
                    .catch(error => {
                        console.error('Error deleting item:', error);
                    });
                } else {
                    fetch(`/api/logs/${entryId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the server response if needed
                        console.log(data);
                        location.reload();
                    })
                    .catch(error => {
                        console.error('Error deleting item:', error);
                    });
                }
                    
                // Hide the confirmation modal after deletion
                hideModals();
            });
        } 
    });
});