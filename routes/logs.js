const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3')

const db = new Database('timelogs.db');

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

router.post('/', (req, res) => {
    console.log("trying to post an entry");
    let { course, project, date, startTime, endTime, description } = req.body;

    let course_id = null;
    let project_id = null;

    const courseQuery = 'SELECT id FROM course WHERE course_name = ?';
    try {
        const course_result = db.prepare(courseQuery).get(course);
        if (course_result) {
            course_id = course_result.id;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('error fetching course id')
    }
    const projectQuery = 'SELECT id FROM project WHERE project_name = ?';

    try {
        const project_result = db.prepare(projectQuery).get(project);
        if (project_result) {
            project_id = project_result.id;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('error fetching project id')
    }

    // remove hyphens from date
    date = date.replace(/-/g, '');

    // determine elapsed time
    const total_time = elapsedTime(startTime, endTime);

    const insertQuery = `
        INSERT INTO logs (course_id, project_id, date, start_time, end_time, total_time, description)
        VALUES (${course_id ?? 'NULL'}, ${project_id ?? 'NULL'}, ${date}, '${startTime}', '${endTime}', ${total_time}, '${description}');
    `;

    try {
        db.prepare(insertQuery).run();
        res.status(201).json({success: true, message: "Entry added"});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "Error adding entry"});
    }
});

router.get('/', (req, res) => {
    const query = `
        SELECT logs.*, course.course_name AS course_name, project.project_name AS project_name
        FROM logs
        LEFT JOIN course ON logs.course_id = course.id
        LEFT JOIN project ON logs.project_id = project.id
        ORDER BY date DESC;
    `;
    try {
        const rows = db.prepare(query).all();
        res.status(200).json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json('Error fetching log data');
    }
    
});

router.get('/:id', async (req, res) => {
    console.log('trying to fetch log data');
    const entryId = req.params.id;
    const query = `
        SELECT logs.*, course.course_name AS course_name, project.project_name AS project_name
        FROM logs
        LEFT JOIN course ON logs.course_id = course.id
        LEFT JOIN project ON logs.project_id = project.id
        WHERE logs.id = ${entryId};`;
    try {
        const row = db.prepare(query).get();row.date = formatDateString(row.date);
        res.status(200).json({success: true, data: row});
    } catch (error) {
        console.log(error);
        res.status(500).json('Error fetching log data');
    }
});

router.delete('/:id', (req, res) => {
    
    const entryId = req.params.id;
    console.log(`trying to delete an entry with id: ${entryId}`);
    
    const query = `
        DELETE FROM logs
        WHERE id = ${entryId};`
    try {
        db.prepare(query).run();
        res.json({ success: true, message: `Entry deleted`});
    } catch(error) {
        console.log(error);
        res.json({ success: false, message: `Error deleting entry`});
    }
    
})

router.put('/:id', (req, res) => {
    console.log("trying to change log data");
    const entryId = req.params.id;
    
    let { course, project, date, startTime, endTime, description } = req.body;
        
    let course_id = null;
    let project_id = null;

    const courseQuery = 'SELECT id FROM course WHERE course_name = ?';
    try {
        const course_result = db.prepare(courseQuery).get(course);
        if (course_result) {
            course_id = course_result.id;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('error fetching course id')
    }
    const projectQuery = 'SELECT id FROM project WHERE project_name = ?';

    try {
        const project_result = db.prepare(projectQuery).get(project);
        if (project_result) {
            project_id = project_result.id;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('error fetching project id')
    }

    // remove hyphens from date
    date = date.replace(/-/g, '');

    // determine elapsed time
    const total_time = elapsedTime(startTime, endTime);
    const insertQuery = `
        UPDATE logs
        SET course_id = ${course_id ?? 'NULL'}, project_id = ${project_id ?? 'NULL'}, date = ${date}, start_time = '${startTime}', end_time = '${endTime}', total_time = ${total_time}, description = '${description}'
        WHERE id = ${entryId};
    `;
    try {
        db.prepare(insertQuery).run();
        res.status(200).json({success: true, message: 'Entry changed'});
    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Error changing entry'});
    }

})

module.exports = router;