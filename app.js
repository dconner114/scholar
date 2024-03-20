const express = require('express');
const path = require('path');
const Database = require('better-sqlite3')
const fs = require('fs');

const app = express();
const port = 8000;

const databasePath = 'timelogs.db';

// initialize a new database if it doesn't exist
if (!fs.existsSync(databasePath)) {
    const db = new Database(databasePath);

    // Create the tables based on your schema
   
    db.exec(`
        CREATE TABLE IF NOT EXISTS course (
            id INTEGER PRIMARY KEY,
            course_name TEXT NOT NULL,
            description TEXT
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS project (
            id INTEGER PRIMARY KEY,
            project_name TEXT NOT NULL,
            description TEXT
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY,
            course_id INTEGER REFERENCES course(id),
            project_id INTEGER REFERENCES project(id),
            date INTEGER,
            start_time TEXT,
            end_time TEXT,
            total_time INTEGER,
            description TEXT
        );
    `);
    

    // Close the database connection after initialization
    db.close();
}

// connect to database
const db = new Database(databasePath);

app.use(express.urlencoded({extended: false}))
app.use(express.json());
app.use(express.static('public'));

// directory routes
const logsRoutes = require('./routes/logs');
const coursesRoutes = require('./routes/courses');
const projectsRoutes = require('./routes/projects');
const historyRoutes = require('./routes/history');
const choiceRoutes = require('./routes/choices');

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

// assign routes
app.use('/api/logs', logsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/choices', choiceRoutes)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})


