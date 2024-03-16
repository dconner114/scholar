
const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3')

const db = new Database('timelogs.db');

router.get('/', async (req, res) => {
    try {
        const cumulativeData = await getCumulativeData();
        const monthTrackerData = await getMonthTrackerData();
        const hoursThisWeekData = await getHoursThisWeekData();

        const responseData = {
            cumulative: cumulativeData,
            monthTracker: monthTrackerData,
            hoursThisWeek: hoursThisWeekData
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function getCumulativeData() {
    return new Promise((resolve, reject) => {
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

        const rows = db.prepare(query).all();

        if (!rows) {
            reject("Error fetching cumulative data from database.");
            return;
        }

        let cumulativeData = {};

        let cumulative_time = 0;
        rows_chronological = rows.reverse();
        let cumulative = rows_chronological.map(({ date, total_time }) => ({
            "date": date,
            "time": cumulative_time += total_time
        }));
        
        cumulativeData.cumulative_time = `${Math.floor(cumulative_time / 60)}hr ${cumulative_time % 60}m`;
        cumulativeData.cumulative = cumulative;

        resolve(cumulativeData);
    });
}

function getMonthTrackerData() {
    return new Promise((resolve, reject) => {
        const monthsToTrack = 6;
        let currentDate = new Date();
        let startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - (monthsToTrack - 1))

        let startYear = startDate.getFullYear();
        let startMonth = startDate.getMonth() + 1;
        let startDateInt = parseInt(`${startYear}${String(startMonth).padStart(2, '0')}00`);

        let endYear = currentDate.getFullYear();
        let endMonth = currentDate.getMonth() + 1;
        let endDateInt = parseInt(`${endYear}${String(endMonth).padStart(2, '0')}31`);
        
        const query = `
            SELECT 
                date,
                SUM(total_time) AS total_time
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

        const rows = db.prepare(query).all();

        if (!rows) {
            reject("Error fetching month data from database.");
            return;
        }
        rows.forEach(row => {
            var month = String(row.date).substring(0,6);
            var total_time = row.total_time;
            if (monthTracker.hasOwnProperty(month)) {
                monthTracker[month] += total_time / 60;
            } else {
                monthTracker[month] = total_time / 60;
            }
        })
        resolve(monthTracker);
    });
}

function getHoursThisWeekData() {
    return new Promise((resolve, reject) => {
        const daysToTrack = 6;
        let currentDate = new Date();
        let startDate = new Date();
        startDate.setDate(currentDate.getDate() - (daysToTrack))

        let startYear = startDate.getFullYear();
        let startMonth = startDate.getMonth() + 1;
        let startDateInt = parseInt(`${startYear}${String(startMonth).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}`);

        let endYear = currentDate.getFullYear();
        let endMonth = currentDate.getMonth() + 1;
        let endDateInt = parseInt(`${endYear}${String(endMonth).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`);

        const query = `
            SELECT 
                SUM(total_time) as total
            FROM 
                logs
            WHERE  
                date BETWEEN ${startDateInt} AND ${endDateInt};
        `;

        const rows = db.prepare(query).get();
        if (!rows) {
            reject("Error fetching daily data from database.");
            return;
        }
        
        resolve(`${Math.floor(rows.total / 60)}hr ${rows.total % 60}m`)            
    });
}

module.exports = router;