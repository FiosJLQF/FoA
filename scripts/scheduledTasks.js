const jsFx = require('./foa_fx_server');
const commonFx = require('../common_fx_server');

//const { SponsorsDDL, SponsorTypeCategoriesDDL } = require('../models/sequelize.js');

/**************************************************************************************************
  Create the database connection and test
**************************************************************************************************/


async function checkTasksToRun() {
//    let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
//    let sponsorTypeCategoriesDDLRows = sponsorTypeCategoriesDDL.rows;
//    let emailResultError = jsFx.sendEmail('fiosjlqf@gmail.com', 'Testing Scheduler Within Node.js', '',
//      `This is a <b>test email</b> sent by the <em>Cron To Go</em> <u>scheduler</u>. There are ${sponsorTypeCategoriesDDL.count} rows.<br><br>
//      <table style="border: 1px solid black; border-collapse: collapse;"><tr><th style="border: 1px solid black;">Description</th><th style="border: 1px solid black;">Scholarship Name</th><th style="border: 1px solid black;">Sponsor Name</th><th style="border: 1px solid black;">Recurrence</th><th style="border: 1px solid black;">List Date</th><th style="border: 1px solid black;">Start Date</th><th style="border: 1px solid black;">End Date</th></tr><tr><td style="border: 1px solid black;">Scholarships With No Application Dates</td><td style="border: 1px solid black;">Student Scholarship</td><td style="border: 1px solid black;">South Central Chapter - American Association of Airport Executives</td><td style="border: 1px solid black;">Annual</td></tr><tr><td style="border: 1px solid black;">Scholarships With No Application Dates</td><td style="border: 1px solid black;">Conference Assistance Scholarship</td><td style="border: 1px solid black;">South Central Chapter - American Association of Airport Executives</td><td style="border: 1px solid black;">Annual</td></tr><tr><td style="border: 1px solid black;">Scholarships With No Application Dates</td><td style="border: 1px solid black;">Loretta Scott, A.A.E. Accreditation/Certification Academy Scholarship</td><td style="border: 1px solid black;">South Central Chapter - American Association of Airport Executives</td><td style="border: 1px solid black;">Annual</td></tr></table>`
//    );

  ////////////////////////////////////////////
  // Get "today's" date for schedule checks
  ////////////////////////////////////////////
  var today = new Date();

  ////////////////////////////////////////////
  // Initialize the data connection for use in retrieving data for notifications
  ////////////////////////////////////////////
  const { Sequelize, Model, DataTypes } = require('sequelize');
  const sequelize = new Sequelize( process.env.DB_URI, {
      dialect: 'postgres',
      operatorsAliases: 0,
      dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
      }
  });

  ////////////////////////////////////////////
  // Check the schedules for tasks to run
  ////////////////////////////////////////////
  if ( today.getDate() === 1 ) { // Run on the 1st of the month
    let scholarshipDatesResult = scholarshipDates(today, sequelize);
  } else {
    let emailResultError = commonFx.sendEmail('fiosjlqf@gmail.com', `Today is the ${today.getDate()} day of the month`, '', '');
  };

}; // end checkTasksToRun

//////////////////////////////////////////////////////////////////////////////////////////
// Scholarship Dates (date issues, upcoming Scholarships)
//////////////////////////////////////////////////////////////////////////////////////////
function scholarshipDates(today, sequelize) {

  sequelize.query(
    `SELECT public."fnQueryToHTMLTable"('SELECT * FROM public."vwAlert_ScholarshipDates"') AS "TableDef"`,
    { type: sequelize.QueryTypes.SELECT })
  .then( async htmlTable => {
    // send the email notification
    let emailResultError = commonFx.sendEmail('fiosjlqf@gmail.com; rblackford@amcg.aero', 'Scholarship Date(s) Notifications', '',
      htmlTable[0].TableDef);
    // log the event
    let logEventResult = await commonFx.logEvent('Scheduled Task', 'scholarshipDates', 0,
      'Success', '', 0, 0, 0, process.env.EMAIL_WEBMASTER_LIST);
  });

}; // end scholarshipDates

module.exports = {
  checkTasksToRun
};

require('make-runnable');