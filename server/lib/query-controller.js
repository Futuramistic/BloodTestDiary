const databaseController = require('./db_controller/db-controller.js');
const dateformat = require("dateformat");

/**
 * Get the patient given its patient number
 * @param {string} patient_no the patient number
 */
async function getPatient(patient_no) {
  const sql = `SELECT * FROM Patient WHERE patient_no = '${patient_no}';`
  return await selectQueryDatabase(sql);
}

/**
 * Get the carer given its carer id
 * @param {string} carerID the carer id
 */
async function getCarer(carerID) {
  const sql = `SELECT * FROM Carer WHERE carer_id = '${carerID}';`
  return await selectQueryDatabase(sql);
}

/**
 * Get the hospital given its hospital id
 * @param {string} hospital_id the hospital id
 */
async function getHospital(hospital_id) {
  const sql = `SELECT * FROM Hospital WHERE hospital_id = '${hospital_id}';`
  return await selectQueryDatabase(sql);
}

/**
 * Get the test given its test id
 * @param {string} test_id the test id
 */
async function getTest(test_id) {
  const sql = `SELECT * FROM Test WHERE test_id = '${test_id}';`
  return await selectQueryDatabase(sql);
}

/**
* Get all the patients from the database
* @return {JSON} result of the query
**/
async function getAllPatients() {
  let sql = "Select * From Patient;";
  return await selectQueryDatabase(sql)
}

async function getUser(username) {
  let sql = `Select * From User Where username='${username}' Limit 1;`;
  return await selectQueryDatabase(sql)
}

/**
*Get all the tests from the database
* @return {JSON} result of the query
**/
async function getAllTests() {
  let sql = "Select * From Test ORDER BY due_date ASC;";
  return await selectQueryDatabase(sql)
}

/**
* Get all the tests from a specific patient from the database
* @param {String} patientId - id of a patient
* @return {JSON} result of the query
**/
async function getTestsOfPatient(patientId) {
  let sql = `Select * From Test Where patient_no = ${patientId}`;
  return await selectQueryDatabase(sql)
}

/**
* Get all the tests on specific date from the database
* @param {String} date - date (format: "YYYY-MM-DD")
* @return {JSON} result of the query
**/
async function getAllTestsOnDate(date) {
  let sql = `Select * From Test Where due_date = '${date}';`;
  return await selectQueryDatabase(sql)
}

/**
* Get all the overdue tests from the database
* @return {JSON} result of the query
**/
async function getOverdueTests() {
  let sql = `Select * From Test Join Patient On Patient.patient_no=Test.patient_no Where completed_date IS NULL AND due_date < CURDATE() AND completed_status='no' ORDER BY due_date ASC;`;
  return await selectQueryDatabase(sql);
}

/**
* Get all the overdue tests from the database plus additional info about time difference
* @return {JSON} result of the query
**/
async function getOverdueTestsExtended() {
  let sql = `Select *, DATEDIFF(CURDATE(),due_date) AS difference From Test NATURAL JOIN Patient where completed_date IS NULL AND due_date < CURDATE() AND completed_status='no' ORDER BY due_date ASC;`;
  return await selectQueryDatabase(sql);
}

async function getOverdueGroups() {
  const today = new Date();
  let tests = await getOverdueTestsExtended();
  let sortedTests = tests.response;
  let groups = [{ class: "Year+", tests: [] }, { class: "6+ months", tests: [] }, { class: "1-6 months", tests: [] },
  { class: "2-4 weeks", tests: [] }, { class: "Less than 2 weeks", tests: [] }];

  var i = 0;
  while (i < sortedTests.length && (Math.floor(sortedTests[i].difference - 365)) >= 0) {
    groups[0].tests = groups[0].tests.concat(sortedTests[i]);
    i++;
  }
  while (i < sortedTests.length && (Math.floor(sortedTests[i].difference - 365 / 2)) >= 0) {
    groups[1].tests = groups[1].tests.concat(sortedTests[i]);
    i++;
  }
  while (i < sortedTests.length && (Math.floor(sortedTests[i].difference - 30)) >= 0) {
    groups[2].tests = groups[2].tests.concat(sortedTests[i]);
    i++;
  }
  while (i < sortedTests.length && (Math.floor(sortedTests[i].difference - 14)) >= 0) {
    groups[3].tests = groups[3].tests.concat(sortedTests[i]);
    i++;
  }
  while (i < sortedTests.length) {
    groups[4].tests = groups[4].tests.concat(sortedTests[i]);
    i++;
  }
  return groups;
}

async function addTest(patient_no, date, notes, frequency, occurrences = 1) {
  date = (date) ? date : new Date();
  date = dateformat(date, "yyyymmdd");
  let values = ``;
  console.log({ date });
  let sql = `INSERT INTO Test(patient_no, due_date, frequency, occurrences, completed_status, completed_date, notes) VALUES('${patient_no}', ${date}, 'weekly', ${occurrences}, 'no', NULL, '${notes}');`;
  console.log(sql);
  let response = await databaseController.insertQuery(sql);
  console.log(response);
  if (response.status == "OK") {
    return { success: true };
  } else {
    return { success: false };
  }
}

/**
* Change the status of the test in the database
* @param {String} testId - id of a test to change
* @param {String} newStatus - new status of a test {enum: "completed"/"late"}
* @return {JSON} result of the query
**/
async function changeTestStatus(testId, newStatus) {
  //console.log("STATUS:" + newStatus);
  var data = await databaseController.requestEditing("Test", testId).then(data => { return data; });
  var token = data.response.token
  //console.log(token);
  if (token != undefined) {
    switch (newStatus) {
      case "completed": { status = "yes"; date = `CURDATE()`; break; }
      case "late": { status = "no"; date = `NULL`; break; }
      default: return { success: false, response: data.response }
    }
    let sql = `UPDATE Test SET completed_status='${status}', completed_date=${date} WHERE test_id = ${testId};`;
    //console.log(sql);
    return { success: true, response: await databaseController.updateQuery(sql, "Test", testId, token).then(result => { return result.response }) }
  }
  else {
    return { success: false, response: data.response }
  }
}

/**
* Get all tests within the week from the database
* @param {String} date - any date (from Monday to Friday) within the week to retrieve (format: "YYYY-MM-DD")
* @return {JSON} result of the query
**/
async function getTestWithinWeek(date) {
  var response = await Promise.all(getTestsDuringTheWeek(date))
    .then(days => { return checkMultipleQueriesStatus(days) })
    .then(data => { return data })
  return response;
}

//=====================================
//  HELPER FUNCTIONS BELOW:
//=====================================

/**
* Produce multiple gueries on the database to retrieve test within the week
* @param {String} date - date in the week to retrieve tests (format: "YYYY-MM-DD")
* @return {Array} array of queries to run
**/
function getTestsDuringTheWeek(date) {
  var weekDay = new Date(date).getDay();
  var daysInWeek = []
  var sql;
  var i = 0;
  while (i < 5) {
    day = -1 * (weekDay - 1) + i;
    sql = `Select * From Test Join Patient on Test.patient_no=Patient.patient_no Where due_date = DATE_ADD('${date}', INTERVAL ${day} DAY);`;
    daysInWeek.push(databaseController.selectQuery(sql));
    i++;
  }
  day = -1 * (weekDay - 1) + i;
  sql = `Select * From Test Join Patient on Test.patient_no=Patient.patient_no Where due_date = DATE_ADD('${date}', INTERVAL ${day} DAY) OR due_date = DATE_ADD('${date}', INTERVAL ${day + 1} DAY);`;
  daysInWeek.push(databaseController.selectQuery(sql));
  return daysInWeek;
}

/**
* Run multiple gueries on the database
* @param {Array} queries - array of queries to run
* @return {Array} if no error: array of the results of the query
* @return {JSON} if error: result of the faulty query
**/
function checkMultipleQueriesStatus(queries) {
  var data = [];
  var error = false;
  queries.forEach(query => {
    if (query.status === "OK") {
      data.push(query.response.rows)
    }
    else {
      error = true;
    }
  })
  if (error) {
    return { success: false, response: "One query failed" };
  }
  return { success: true, response: data };
}

/**
* Run SELECT query on the database
* @param {String} sql - SQL query
* @return {JSON} result of the query
**/
async function selectQueryDatabase(sql) {
  var response = await databaseController.selectQuery(sql).then((queryResponse) => {
    if (queryResponse.status === "OK") {
      data = queryResponse.response.rows;
      return { success: true, response: data }
    }
    else {
      return { success: false, response: queryResponse.err }
    }
  });
  return response;
}

module.exports = {
  getPatient,
  getTest,
  getHospital,
  getCarer,
  getOverdueTestsExtended,
  getOverdueGroups,
  getUser,
  getAllPatients,
  getAllTests,
  getTestsOfPatient,
  getAllTestsOnDate,
  getOverdueTests,
  addTest,
  changeTestStatus,
  getTestWithinWeek,
};
