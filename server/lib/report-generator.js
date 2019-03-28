/**
 * This module provides function for reports generation.
 * 
 * @author Luka Kralj
 * @version 1.0
 * @module report-generator 
 */

module.exports = {
    getReport
}

const queryController = require('./query-controller');
const dateformat = require('dateformat');
const actionLogger = require('./action-logger');

/**
 * Generate monthly report for a particular month.
 *
 * @param {string} month
 * @param {string} actionUsername User who requested the report
 * @returns {JSON} {success:Boolean, html: string} 
 */
async function getReport(month, year, actionUsername) {
    if (!Number.isInteger(year)) {
        try {
            year = Number.parseInt(year);
        }
        catch (err) {
            return { success: false, response: "Report could not be generated." };
        }
    }
    const date = getDate(month, year);
    const isMonthly = month != null;
    if (date === undefined) {
        return { success: false, response: "Report could not be generated." };
    }
    const res = await queryController.getReport(isMonthly, date);
    console.log(res)
    if (!res.success) {
        return { success: false, response: "Report could not be generated." };
    }
    // Log to keep track of who generated the files.
    actionLogger.logOther(actionUsername, "User", actionUsername,
        "This user requested a monthly report.")

    const timestamp = dateformat(new Date(), "d mmmm yyyy, 'at' HH:MM:ss");
    const data = res.response;
    data.timestamp = timestamp;
    data.username = actionUsername;
    data.month = month;
    data.year = year;

    let html = "";
    if (isMonthly) {
        html = getMonthlyReport(data);
    }
    else {
        html = getYearlyReport(data);
    }

    return { success: true, html: html };
}

/**
 * Transforms string into a valid date in that month.
 *
 * @param {string} month
 * @returns {Date}
 */
function getDate(month, year) {
    const date = new Date();

    switch (month) {
        case null: 
        case "January": date.setMonth(0); break;
        case "February": date.setMonth(1); break;
        case "March": date.setMonth(2); break;
        case "April": date.setMonth(3); break;
        case "May": date.setMonth(4); break;
        case "June": date.setMonth(5); break;
        case "July": date.setMonth(6); break;
        case "August": date.setMonth(7); break;
        case "September": date.setMonth(8); break;
        case "October": date.setMonth(9); break;
        case "November": date.setMonth(10); break;
        case "December": date.setMonth(11); break;
        default: return undefined;
    }
    date.setFullYear(year);
    return date;
}

/**
 * Generate HTML for a monthly report with the given data.
 *
 * @param {JSON} data - Report specific data.
 * @returns {string} HTML formatted string.
 */
function getMonthlyReport(data) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Monthly report - Blood Test Diary</title>
            <style>
                h1 {
                    text-align: center;
                }
                h3 {
                    text-align: center;
                }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    padding: 5px 0 10px 0;
                }
                th, td {
                    padding: 10px 0 0 0;
                    border-bottom: 1px solid black;
                }
                .rtd {
                    text-align: right;
                }
                main {
                    width: 90%;
                    margin-left: 5%;
                    margin-right: 5%;
                }
                p {
                    padding: 5px 0 10px 0;
                }
                #end {
                    text-align: right;
                    padding: 10px 0 5px 0;
                }
            </style>
        </head>
        <body>
            <h3>King's College Hospital</h3>
            <h1>Blood Test Diary<br>-<br>MONTHLY REPORT</h1>
            <br>
            Generated on: ${data.timestamp}<br>
            Generated by: ${data.username}
            <hr>
            <main>
                <p>This is an automatically generated report for ${data.month} ${data.year}.</p>
                <table>
                    <tr>
                        <td>Number of tests, due in this month:</td>
                        <td class='rtd'>${data.thisMonth == null ? "0" : data.thisMonth}</td>
                    </tr>
                    <tr>
                        <td>Tests, completed on time in this month:</td>
                        <td class='rtd'>${data.completedOnTime == null ? "0" : data.completedOnTime}</td>
                    </tr>
                    <tr>
                        <td>Tests, completed late in this month:</td>
                        <td class='rtd'>${data.completedLate == null ? "0" : data.completedLate}</td>
                    </tr>
                    <tr>
                        <td>Number of reminders sent in this month:</td>
                        <td class='rtd'>${data.remindersSent == null ? "0" : data.remindersSent}</td>
                    </tr>
                </table>
                <p>In the system, there is currently ${data.children == null ? "0" : data.children} patients under 12 years old 
                    and ${data.adults == null ? "0" : data.adults} patient that are 12 years old or older.
                </p>
                <div id='end'><b>End of report.</b></div>
            </main>
            <hr>
            <p><i>This document may contain confidential information.<br>Please
                take caution who you share this information with.</i>
            </p>
        </body>
    </html>
    `;
    return html;
}

/**
 * Generate HTML for a yearly report with the given data.
 *
 * @param {JSON} data - Report specific data.
 * @returns {string} HTML formatted string.
 */
function getYearlyReport(data) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Monthly report - Blood Test Diary</title>
            <style>
                h1 {
                    text-align: center;
                }
                h3 {
                    text-align: center;
                }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    padding: 5px 0 10px 0;
                }
                th, td {
                    padding: 10px 0 0 0;
                    border-bottom: 1px solid black;
                }
                .rtd {
                    text-align: right;
                }
                main {
                    width: 90%;
                    margin-left: 5%;
                    margin-right: 5%;
                }
                p {
                    padding: 5px 0 10px 0;
                }
                #end {
                    text-align: right;
                    padding: 10px 0 5px 0;
                }
            </style>
        </head>
        <body>
            <h3>King's College Hospital</h3>
            <h1>Blood Test Diary<br>-<br>YEARLY REPORT</h1>
            <br>
            Generated on: ${data.timestamp}<br>
            Generated by: ${data.username}
            <hr>
            <main>
                <p>This is an automatically generated report for ${data.year}.</p>
                <table>
                    <tr>
                        <td>Number of tests, due in this year:</td>
                        <td class='rtd'>${data.thisMonth == null ? "0" : data.thisMonth}</td>
                    </tr>
                    <tr>
                        <td>Tests, completed on time in this year:</td>
                        <td class='rtd'>${data.completedOnTime == null ? "0" : data.completedOnTime}</td>
                    </tr>
                    <tr>
                        <td>Tests, completed late in this year:</td>
                        <td class='rtd'>${data.completedLate == null ? "0" : data.completedLate}</td>
                    </tr>
                    <tr>
                        <td>Number of reminders sent in this year:</td>
                        <td class='rtd'>${data.remindersSent == null ? "0" : data.remindersSent}</td>
                    </tr>
                </table>
                <p>In the system, there is currently ${data.children == null ? "0" : data.children} patients under 12 years old 
                    and ${data.adults == null ? "0" : data.adults} patient that are 12 years old or older.
                </p>
                <div id='end'><b>End of report.</b></div>
            </main>
            <hr>
            <p><i>This document may contain confidential information.<br>Please
                take caution who you share this information with.</i>
            </p>
        </body>
    </html>
    `;
    return html;
}