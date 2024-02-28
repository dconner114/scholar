const { time } = require('console');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('timelogs.db');

const app = express();
const port = 5000;

app.use(express.urlencoded({extended: false}))
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

function elapsedTime (startTime, endTime) {
    try {
        let start = startTime.split(":");
        let end = endTime.split(":");
        let startHour = start[0];
        let startMin = start[1];
        let endHour = end[0];
        let endMin = end[1];

        startHour = parseInt(startHour);
        startMin = parseInt(startMin);
        endHour = parseInt(endHour);
        endMin = parseInt(endMin);
    
        return (endHour * 60 + endMin) - (startHour * 60 + startMin);
    } catch (error) {
        console.error("Error parsing time values", error.message);
        return null;
    }
}

app.post('/', (req, res) => {
    console.log("trying to post an entry");
    try {
        console.log(req.body);
        let { course, project, date, startTime, endTime, description } = req.body;
        
        let project_id = null;
        let course_id = null;

        const getCourseId = () => {
            return new Promise((resolve, reject) => {
                db.get('SELECT id FROM course WHERE course_name = ?', [course], function (err, row) {
                    if (err) {
                        console.error(err.message);
                        reject('Internal Server Error');
                    } else {
                        course_id = row ? row.id : null;
                        resolve();
                    }
                });
            });
        };
        const getProjectId = () => {
            return new Promise((resolve, reject) => {
                db.get('SELECT id FROM project WHERE project_name = ?', [project], function (err, row) {
                    if (err) {
                        console.error(err.message);
                        reject('Internal Server Error');
                    } else {
                        project_id = row ? row.id : null;
                        resolve();
                    }
                });
            });
        };

        const mainFunction = async () => {
            // Wait for both queries to complete
            await Promise.all([getCourseId(), getProjectId()]);
    
            // remove hyphens from date
            date = date.replace(/-/g, '');
    
            // determine elapsed time
            const total_time = elapsedTime(startTime, endTime);
    
            const insertQuery = `
                INSERT INTO logs (course_id, project_id, date, start_time, end_time, total_time, description)
                VALUES (${course_id ?? 'NULL'}, ${project_id ?? 'NULL'}, ${date}, '${startTime}', '${endTime}', ${total_time}, '${description}');
            `;
            console.log(insertQuery)
            db.run(insertQuery);
        };
    
        // Call the async function
        mainFunction();

        res.status(201).json({success: true, message: "Your entry has been successfully added"});


        // add validation here

    } catch (error) {
        console.error(error);
        res.status(400).json({error: 'Bad Request' });
    }
});

// Endpoint to fetch data from the "logs" table
app.get('/api/logs', (req, res) => {
    const query = `
        SELECT logs.*, course.course_name AS course_name, project.project_name AS project_name
        FROM logs
        LEFT JOIN course ON logs.course_id = course.id
        LEFT JOIN project ON logs.project_id = project.id
        ORDER BY date DESC
        LIMIT 12;
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

app.get('/api/history', (req, res) => {
    let currentDate = new Date();
    console.log(currentDate);

    let year = String(currentDate.getFullYear());
    let month = (String(currentDate.getMonth() + 1)).length > 1 ? String(currentDate.getMonth() + 1) : ('0' + String(currentDate.getMonth() + 1));
    let day = (String(currentDate.getDate() + 1)).length > 1 ? String(currentDate.getDate()) : ('0' + String(currentDate.getDate()));;

    let pastDates = [];
    
    for(let i = 6; i >= 0; i--) {
        let temp = new Date(currentDate)
        temp.setDate(currentDate.getDate() - i)
        pastDates.push(temp);
    }

    const intDates = pastDates.map(item => {
        let year = String(item.getFullYear());
        let month = (String(item.getMonth() + 1)).padStart(2, '0');
        let day = (String(item.getDate())).padStart(2, '0');
        
        return parseInt(year + month + day, 10);
    })

    console.log(intDates);

    const query = `
        SELECT 
            date,
            SUM(total_time) AS total_time
        FROM 
            logs
        WHERE 
            date BETWEEN ${intDates[0]} AND ${intDates[intDates.length - 1]}
        GROUP BY 
            date
        ORDER BY 
            date DESC;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const serverResponseMap = new Map(rows.map(item => [item.date, item]));
            const result = intDates.map(date => {
                if (serverResponseMap.has(date)) {
                  return serverResponseMap.get(date); // Do nothing, return the existing object
                } else {
                  return { date, total_time: 0 }; // Add a new object with total_time: 0
                }
              });
            console.log(result);
            res.json(result);
        }
    });
    
})

app.get('/api/courses', (req,res) => {
    const query = `
        SELECT 
            course.id,
            course.course_name,
            course.description,
            COALESCE(SUM(logs.total_time), 0) AS total_time
        FROM
            course
        LEFT JOIN
            logs ON course.id = logs.course_id
        GROUP BY 
            course.id;
    `

    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err.message);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/courses', (req, res) =>{
    console.log("trying to post a course");
    try {
        console.log(req.body);
        let { course, description } = req.body;

        course = course.toUpperCase();

        const mainFunction = async () => {    
            const insertQuery = `
                INSERT INTO course (course_name, description)
                VALUES ('${course}','${description}');
            `;
            console.log(insertQuery)
            db.run(insertQuery);
        };
    
        // Call the async function
        mainFunction();

        res.status(201).json({success: true, message: "Your entry has been successfully added"});


        // add validation here

    } catch (error) {
        console.error(error);
        res.status(400).json({error: 'Bad Request' });
    }
})

app.get('/api/projects', (req,res) => {
    const query = `
        SELECT 
            project.id,
            project.project_name,
            project.description,
            COALESCE(SUM(logs.total_time), 0) AS total_time
        FROM
            project
        LEFT JOIN
            logs ON project.id = logs.project_id
        GROUP BY 
            project.id;
    `

    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err.message);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/projects', (req, res) => {
    console.log("trying to post a project");
    try {
        console.log(req.body);
        let { project, description } = req.body;

        const mainFunction = async () => {    
            const insertQuery = `
                INSERT INTO project (project_name, description)
                VALUES ('${project}','${description}');
            `;
            console.log(insertQuery)
            // db.run(insertQuery);
        };
    
        // Call the async function
        mainFunction();

        res.status(201).json({success: true, message: "Your entry has been successfully added"});


        // add validation here

    } catch (error) {
        console.error(error);
        res.status(400).json({error: 'Bad Request' });
    }
})

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
})
