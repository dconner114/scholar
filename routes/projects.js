const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3')

const db = new Database('timelogs.db');

router.get('/', (req,res) => {
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
            project.id
        ;
    `
    try {
        const rows = db.prepare(query).all();
        res.status(200).json(rows);
    } catch(error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Error fetching project data'});
    }
});

router.post('/', (req, res) => {
    console.log("trying to post a project");
    let { project, description } = req.body;

    const query = `
        INSERT INTO project (project_name, description)
        VALUES ('${project}','${description}');
    `;
            
    try {
        db.prepare(query).run();
        res.status(201).json({success: true, message: "Project added"});

    } catch (error) {
        console.error(error);
        res.status(500).json({success: 'false', message: 'Error adding new course'});
    }
})

router.delete('/:id', (req, res) => {
    console.log("trying to delete a course");
    const projectId = req.params.id;
    
    const projectQuery = `
        DELETE FROM project
        WHERE id = ${projectId};`

    const entryQuery = `
        DELETE FROM logs 
        WHERE project_id = ${projectId};`

        try {
            db.prepare(entryQuery).run();
            db.prepare(projectQuery).run();
            res.status(200).json({success: true, message: 'Project deleted'});
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
})

module.exports = router;
