document.addEventListener('DOMContentLoaded', function () {

    const notificationBar = document.querySelector('.notification-bar');
    notificationBar.style.display = 'none';
    var notificationText = notificationBar.querySelector('h5');
    const notificationClose = document.querySelector('.close-notification-button')


    notificationClose.addEventListener('click', () => notificationBar.style.display = 'none');

    function displayNotification(success, message) {
        notificationText.innerHTML = message;
        notificationBar.style.display = 'flex';

    }
    function loadChartData() {
        fetch('/api/history') 
            .then(response => response.json())
            .then(data => {
                
                const ctx_week = document.getElementById('weekChart');
                const ctx_month = document.getElementById('monthChart');
                const cumulative_time = document.getElementById('cumulative_time');
                cumulative_time.innerHTML = `Total time: ${data.cumulative_time}`
                const ctx_cumulative = document.getElementById('cumulative');
                

                // dateLabels = data.day_results.map(item => {
                //     const dateString = String(item.date);
                //     return `${dateString.substring(4, 6)}/${dateString.substring(6, 8)}`;
                // })

                new Chart(ctx_cumulative, {
                    type: 'line',
                    data: {
                    labels: data.cumulative.map(item => `${String(item.date).substring(4, 6)}/${String(item.date).substring(2, 4)}`),
                    datasets: [{
                        data: data.cumulative.map(item => item.time / 60.0),
                        borderWidth: 1
                    }]
                    },
                    options: {
                        autoPadding: true,
                        plugins: {
                            legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                        beginAtZero: true
                        }
                    }
                    }
                });
                
                // weekLabels = data.week_results.map(item => {
                //     const dateString = String(item.date);
                //     return `${dateString.substring(4, 6)}/${dateString.substring(6, 8)}`;
                // })

                // new Chart(ctx_month, {
                //     type: 'bar',
                //     data: {
                //     labels: weekLabels,
                //     datasets: [{
                //         data: data.week_results.map(item => item.total_time / 60.0),
                //         borderWidth: 1
                //     }]
                //     },
                //     options: {
                //         autoPadding: true,
                //         plugins: {
                //             legend: {
                //             display: false
                //         }
                //     },
                //     scales: {
                //         y: {
                //         beginAtZero: true
                //         }
                //     }
                //     }
                // });

                // monthLabels = data.month_results.map(item => {
                //     const dateString = String(item.date);
                //     return `${dateString.substring(4, 6)}/${dateString.substring(6, 8)}`;
                // })

                // new Chart(ctx_year, {
                //     type: 'bar',
                //     data: {
                //     labels: monthLabels,
                //     datasets: [{
                //         data: data.month_results.map(item => item.total_time / 60.0),
                //         borderWidth: 1
                //     }]
                //     },
                //     options: {
                //         autoPadding: true,
                //         plugins: {
                //             legend: {
                //             display: false
                //         }
                //     },
                //     scales: {
                //         y: {
                //         beginAtZero: true
                //         }
                //     }
                //     }
                // });


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
                        <td class="description">${row.description || ''}</td>
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
                        </td>
                    <tr>`
                    table.querySelector('tbody').insertAdjacentHTML('beforeend', newRow);
                })
            })
            .catch(error => console.error('Error fetching data:', error));
    }
    loadProjectData()

    function displayEntryModal(entryId) {
        entryForm.reset();
        // Fetch data for populating select elements
        fetch('/api/options') // Replace with your actual API endpoint
            .then(response => response.json())
            .then(data => {
            
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
            if (entryId > -1) {
                fetch(`/api/logs/${entryId}`)
                    .then(response => response.json())
                    .then(entryData => {
                        // Assuming your server response provides data in the expected format
                        data = entryData.data;
                        entryForm.elements['course'].value = data.course_name;
                        entryForm.elements['project'].value = data.project_name;
                        entryForm.elements['date'].value = data.date;
                        entryForm.elements['startTime'].value = data.start_time;
                        entryForm.elements['endTime'].value = data.end_time;
                        entryForm.elements['description'].value = data.description;

                        entryFormSubmit.innerHTML = 'Save';
                    })
                    .catch(error => console.error('Error fetching entry data:', error));
            } else {
                entryFormSubmit.innerHTML = 'Submit';
            }

        })
        .catch(error => console.error('Error fetching options:', error))
        .finally(() => {
            entryForm.removeEventListener('submit', createNewEntry);
            entryForm.removeEventListener('submit', event => editEntry(event, entryId));

            if (entryId > -1) {
                entryForm.addEventListener('submit', event => editEntry(event, entryId));
            } else {
                entryForm.addEventListener('submit', createNewEntry);
            }
            // Display the overlay and modal
            hideModals();
            entryModal.style.display = "block";
            overlay.style.display = "block";
        });
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

    const entryFormSubmit = document.getElementById('entryFormSubmit');

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
    function createNewEntry(event) {
        event.preventDefault();
        console.log(new FormData(this))
        // Serialize the form data
        var formData = new FormData(this);
    
        // Convert FormData to an object
        var formDataObject = {};
        formData.forEach(function (value, key) {
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
                console.log(data.success, data.message);
                loadLogsData();
                loadCourseData();
                loadProjectData();
                displayNotification(data.success, data.message);
            })
            .catch(error => {
                console.error('Error submitting form', error);
                displayNotification(false, 'Error submitting form');
            });
    }
    
    function editEntry(event, entryId) {
        event.preventDefault();
        // Serialize the form data
        var formData = new FormData(document.getElementById('entryForm'));
    
        // Convert FormData to an object
        var formDataObject = {};
        formData.forEach(function (value, key) {
            formDataObject[key] = value;
        });
    
        // Send a standard form submission
        fetch(`/api/logs/${entryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
            .then(response => response.json())
            .then(data => {
                hideModals();
                console.log(data.success, data.message);
                loadLogsData();
                loadCourseData();
                loadProjectData();
                displayNotification(data.success, data.message);
            })
            .catch(error => {
                console.error('Error submitting form', error);
                displayNotification(false, 'Error submitting form');
            });
    }

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
            // location.reload();

            // Display a success message on the index page
            console.log(data.success, data.message);
            loadCourseData();
            // Display a success message on the index page
            displayNotification(data.success, data.message)
        })
        .catch(error => {
            // Handle errors if needed
            console.error('Error submitting form', error);
            console.log(data.success, data.message);
            // Display a success message on the index page
            displayNotification(data.success, data.message)
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
            // location.reload();

            // Display a success message on the index page
            console.log(data.success, data.message);
            loadProjectData();
            // Display a success message on the index page
            displayNotification(data.success, data.message)
        })
        .catch(error => {
            // Handle errors if needed
            console.error('Error submitting form', error);
            console.log(data.success, data.message);
            // Display a success message on the index page
            displayNotification(data.success, data.message)
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
                        loadCourseData();
                        loadCourseData();
                        loadProjectData();
                        displayNotification(data.success, data.message)
                        
                    })
                    .catch(error => {
                        console.error('Error deleting item:', error);
                        displayNotification(data.success, data.message)
                    });
                } else if (target.classList.contains('project-btn')) {
                    // Send a request to the server to delete the item with the specified ID
                    fetch(`/api/projects/${entryId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the server response if needed
                        loadProjectData()
                        displayNotification(data.success, data.message)
                    })
                    .catch(error => {
                        console.error('Error deleting item:', error);
                        displayNotification(data.success, data.message)
                    });
                } else {
                    fetch(`/api/logs/${entryId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the server response if needed
                        console.log(data);
                        loadLogsData();
                        displayNotification(data.success, data.message)
                    })
                    .catch(error => {
                        console.error('Error deleting item:', error);
                        displayNotification(data.success, data.message)
                    });
                }
                    
                // Hide the confirmation modal after deletion
                hideModals();
            });
        } else if (target.classList.contains('edit-btn')) {
            const entryId = target.getAttribute('data-entry-id');
            displayEntryModal(entryId)
        }
    });
});