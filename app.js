const { countReset } = require('console');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('timelog.db');

const app = express();
const port = 5000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

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

app.post('/api/submit', (req, res) => {
    console.log("trying to post");
    try {
        const { course, project, date, startTime, endTime, description } = req.body;
        console.log(`start time: ${startTime}`);
        console.log(`end time: ${endTime}`)
        
        db.get('SELECT course_id FROM course WHERE course_name = ?', [course], function (err, row) {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                // Access the result in the callback function
                const course_id = row ? row.course_id : null;
                console.log('Retrieved course_id:', course_id);
            }
        })
        db.get('SELECT project_id FROM project WHERE project_name = ?', [project], function (err, row) {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                // Access the result in the callback function
                const project_id = row ? row.project_id : null;
                console.log('Retrieved project_id:', project_id);
            }
        })

        const insertQuery = `
            INSERT INTO logs (course_id, project_id, date, start_time, end_time, total_time, description)
            VALUES (?, ?, ?, ?, ?)
        `;

        // db.run(insertQuery, [course_id, project_id, date, startTime, endTime, total_time, description], (err) => {
        //     if (err) {
        //         console.error(err.message);
        //         res.status(500).json({ error: 'Internal Server Error' });
        //     } else {
        //         // Return success response or any relevant data
        //         res.json({ success: true, message: 'Form data submitted successfully' });
        //     }
        // })
        res.json({success: true, message: "testing"});


        // add validation here

    } catch (error) {
        console.error(error);
        res.status(400).json({error: 'Bad Request' });
    }
});


app.get('/api/options', (req, res) => {
    const courseQuery = `
        SELECT course_name FROM course;
    `;
    const projectQuery = `
        SELECT project_name FROM project;
    `;  
    var data = {};

    Promise.all([
        new Promise((resolve, reject) => {
            db.all(courseQuery, [], (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(rows.map(course => course.course_name));
                }
            });
        }),
        new Promise((resolve, reject) => {
            db.all(projectQuery, [], (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(rows.map(project => project.project_name));
                }
            });
        })
    ]).then(([courses, projects]) => {
        const data = { courses, projects };
        res.json(data);
    }).catch(error => {
        res.status(500).json({ error: 'Internal Server Error' });
    });
    
});

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
