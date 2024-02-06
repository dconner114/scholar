const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('timelog.db');

const app = express();
const port = 5000;

app.use(express.static('public'));

// Endpoint to fetch data from the "logs" table
app.get('/api/logs', (req, res) => {
    const query = `
        SELECT logs.*, course.course_name AS course_name, project.project_name AS project_name
        FROM logs
        LEFT JOIN course ON logs.course_id = course.course_id
        LEFT JOIN project ON logs.project_id = project.project_id
        ORDER BY date DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);

    process.on('SIGINT', () => {
        db.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Database connection closed.');
            }
            process.exit();
        });
    });
})
