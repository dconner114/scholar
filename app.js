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

function formatDateString(inputDate) {
    // Ensure the inputDate is a string
    inputDate = inputDate.toString();

    // Add hyphens in the required positions
    const formattedDate = `${inputDate.slice(0, 4)}-${inputDate.slice(4, 6)}-${inputDate.slice(6)}`;
    return formattedDate;
}

// function deFormatDateString(inputDate) {
//     inputDate = inputDate.toString();
// }

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

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
        ORDER BY date DESC;
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

app.get('/api/logs/:id', async (req, res) => {
    console.log('trying to fetch log data');
    const entryId = req.params.id;
    const query = `
        SELECT logs.*, course.course_name AS course_name, project.project_name AS project_name
        FROM logs
        LEFT JOIN course ON logs.course_id = course.id
        LEFT JOIN project ON logs.project_id = project.id
        WHERE logs.id = ${entryId};`;

    db.get(query, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({success: false, message: err.message});
        } else {
            rows.date = formatDateString(rows.date);
            res.json({success: true, data: rows});
        }
    })
});

app.delete('/api/logs/:id', (req, res) => {
    console.log("trying to delete an entry");
    const entryId = req.params.id;
    
    const query = `
        DELETE FROM logs
        WHERE id = ${entryId};`
    db.run(query)

    res.json({ success: true, message: `Entry with ID ${entryId} deleted successfully` });
})

app.put('/api/logs/:id', (req, res) => {
    console.log("trying to change log data");
    const entryId = req.params.id;
    try {
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
                UPDATE logs
                SET course_id = ${course_id ?? 'NULL'}, project_id = ${project_id ?? 'NULL'}, date = ${date}, start_time = '${startTime}', end_time = '${endTime}', total_time = ${total_time}, description = '${description}'
                WHERE id = ${entryId};
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

app.get('/api/history', (req, res) => {
    
    const query = `
        SELECT 
            date,
            SUM(total_time) AS total_time
        FROM 
            logs
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
            
            let data = {}

            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let currentDate = new Date();

            // populate object for hours in current week
            let thisWeek = daysOfWeek.reduce((acc, day) => {
                acc[day] = 0;
                return acc;
            }, {});

            let cumulative_time = 0;
            rows_chronological = rows.reverse();
            let cumulative = rows_chronological.map(({ date, total_time }) => ({
                "date": date,
                "time": cumulative_time += total_time
            }));
            

            data.cumulative_time = `${Math.floor(cumulative_time / 60)}hr ${cumulative_time % 60}m`;
            data.cumulative = cumulative;
        

            
            
            const monthsToTrack = 6;
            let startDate = new Date(currentDate);
            startDate.setMonth(currentDate.getMonth() - (monthsToTrack - 1))

            let startYear = startDate.getFullYear();
            let startMonth = startDate.getMonth() + 1;
            let startDateInt = parseInt(`${startYear}${String(startMonth).padStart(2, '0')}00`);

            let endYear = currentDate.getFullYear();
            let endMonth = currentDate.getMonth() + 1;
            let endDateInt = parseInt(`${endYear}${String(endMonth).padStart(2, '0')}31`);

            console.log(`Start: ${startDateInt} \nEnd: ${endDateInt}`)

            const monthQuery = `
                SELECT 
                    date,
                    total_time
                FROM 
                    logs
                WHERE  
                    date BETWEEN ${startDateInt} AND ${endDateInt}
                GROUP BY 
                    date
                ORDER BY 
                    date ASC;
            `;

            var monthTracker = {}

            db.all(monthQuery, [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    rows.forEach(row => {
                        var month = String(row.date).substring(0,6);
                        var total_time = row.total_time;

                        if (monthTracker.hasOwnProperty(month)) {
                            monthTracker[month] += total_time / 60;
                        } else {
                            monthTracker[month] = total_time / 60;
                        }
                    })

                    data.monthTracker = monthTracker;

                    const daysToTrack = 6;
                    let startDate = new Date(currentDate);
                    startDate.setDate(currentDate.getDate() - (daysToTrack))

                    let startYear = startDate.getFullYear();
                    let startMonth = startDate.getMonth() + 1;
                    let startDateInt = parseInt(`${startYear}${String(startMonth).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}`);

                    let endYear = currentDate.getFullYear();
                    let endMonth = currentDate.getMonth() + 1;
                    let endDateInt = parseInt(`${endYear}${String(endMonth).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`);
                    var dayTracker = {}

                    // for (let i = daysToTrack; i >= 0; i--) {
                    //     let temp_date = new Date(currentDate)
                    //     temp_date.setDate(currentDate.getDate() - i);
                    //     dayTracker[temp_date] = 0;
                    // }

                    console.log(dayTracker);
                    const dayQuery = `
                        SELECT 
                            SUM(total_time) as total
                        FROM 
                            logs
                        WHERE  
                            date BETWEEN ${startDateInt} AND ${endDateInt};
                    `;

                    console.log(dayQuery);

                    db.get(dayQuery, [], (err, rows) => {
                        if (err) {
                            console.error(err.message);
                            res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            console.log(rows);
                            data.hoursThisWeek = `${Math.floor(rows.total / 60)}hr ${rows.total % 60}m`
                            res.json(data)
                        }});
                }
            });            
        } 
    });
    return 0;
})

    
    // let pastDates = [];
    
    // for(let i = 365; i >= 0; i--) {
    //     let temp = new Date(currentDate)
    //     temp.setDate(currentDate.getDate() - i)
    //     pastDates.push(temp);
    // }

    // const intDates = pastDates.map(item => {
    //     let year = String(item.getFullYear());
    //     let month = (String(item.getMonth() + 1)).padStart(2, '0');
    //     let day = (String(item.getDate())).padStart(2, '0');
        
    //     return parseInt(year + month + day, 10);
    // });



    // const query = `
    //     SELECT 
    //         date,
    //         SUM(total_time) AS total_time
    //     FROM 
    //         logs
    //     WHERE 
    //         date BETWEEN ${intDates[0]} AND ${intDates[intDates.length - 1]}
    //     GROUP BY 
    //         date
    //     ORDER BY 
    //         date DESC;
    // `;

    // db.all(query, [], (err, rows) => {
    //     if (err) {
    //         console.error(err.message);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     } else {
    //         const results = {};

    //         // Organize data by day
    //         results.day_results = intDates.map(date => {
    //             const matchingRow = rows.find(row => row.date === date);
    //             return {
    //                 date,
    //                 total_time: matchingRow ? matchingRow.total_time : 0
    //             };
    //         });

            
    //         // Organize data by week
    //         // ... similar logic as above ...

    //         // Organize data by month
    //         // ... similar logic as above ...

    //         // Now you can log the result and send the response
    //         console.log(results);
    //         res.json(results);
    //     }
    // });

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
        
        let { course, description } = req.body;

        course = course.toUpperCase();

        const mainFunction = async () => {    
            const insertQuery = `
                INSERT INTO course (course_name, description)
                VALUES ('${course}','${description}');
            `;
            
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

app.delete('/api/courses/:id', (req, res) => {
    console.log("trying to delete a course");
    const courseId = req.params.id;
    
    const query = `
        DELETE FROM course
        WHERE id = ${courseId};`
    db.run(query)

    res.json({ success: true, message: `Course with ID ${courseId} deleted successfully` });
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
        
        let { project, description } = req.body;

        const mainFunction = async () => {    
            const insertQuery = `
                INSERT INTO project (project_name, description)
                VALUES ('${project}','${description}');
            `;
            
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

app.delete('/api/projects/:id', (req, res) => {
    console.log("trying to delete a project");
    const projectId = req.params.id;
    
    const query = `
        DELETE FROM project
        WHERE id = ${projectId};`
    db.run(query)

    res.json({success: true, message: `Project with ID ${projectId} deleted successfully` });
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
