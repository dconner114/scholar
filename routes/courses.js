const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3')

const db = new Database('timelogs.db');

router.get('/', (req,res) => {
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
            course.id
        ;
    `
    const rows = db.prepare(query).all();

    if (!rows) {
        console.log(err.message);
        res.status(500).json({error: 'Internal Server Error'});
        return;
    }

    res.json(rows)
});

router.post('/', (req, res) =>{
    console.log("trying to post a course");
    let { course, description } = req.body;
    course = course.toUpperCase();
    const query = `
        INSERT INTO course (course_name, description)
        VALUES ('${course}','${description}');
    `;

    try {
        db.prepare(query).run();
        res.status(201).json({success: true, message: "Course added"});

    } catch (error) {
        console.error(error);
        res.status(500).json({success: 'false', message: 'Error adding new course'});
    }
})

router.delete('/:id', (req, res) => {
    console.log("trying to delete a course");
    const courseId = req.params.id;
    
    const courseQuery = `
        DELETE FROM course
        WHERE id = ${courseId};`

    const entryQuery = `
        DELETE FROM logs 
        WHERE course_id = ${courseId};`

    try {
        db.prepare(entryQuery).run();
        db.prepare(courseQuery).run();
        res.status(200).json({success: true, message: 'Course deleted'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;