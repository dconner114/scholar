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
                        <td>${row.total_time}<td>
                    </tr>`;
                    table.querySelector('tbody').insertAdjacentHTML('beforeend', newRow);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Call the function when the page loads
    displayLogsData();

    // Function to format the date as mm-dd-yyyy
    function formatDate(rawDate) {
        const dateString = rawDate.toString(); // Convert to string
        const year = dateString.substring(2, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${month}-${day}-${year}`;
    }
});