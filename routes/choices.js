const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3')

const db = new Database('timelogs.db');

router.get('/', (req, res) => {
    const courseQuery = `
        SELECT course_name FROM course;
    `;
    const projectQuery = `
        SELECT project_name FROM project;
    `;  

    try {
        courses = db.prepare(courseQuery).all();
        projects = db.prepare(projectQuery).all();
        courses = courses.map(course => course.course_name);
        projects = projects.map(project => project.project_name);

        res.status(200).json({ courses, projects });
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;