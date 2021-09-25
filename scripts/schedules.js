const jsFx = require('../scripts/foa_node_fx');
const { SponsorsDDL, SponsorTypeCategoriesDDL } = require('../models/sequelize.js');

async function test_email() {
//    let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
//    let sponsorTypeCategoriesDDLRows = sponsorTypeCategoriesDDL.rows;
//    let emailResultError = jsFx.sendEmail('fiosjlqf@gmail.com', 'Testing Scheduler Within Node.js', '',
//      `This is a <b>test email</b> sent by the <em>Cron To Go</em> <u>scheduler</u>. There are ${sponsorTypeCategoriesDDL.count} rows.<br><br>
//      <table style="border: 1px solid black; border-collapse: collapse;"><tr><th style="border: 1px solid black;">Description</th><th style="border: 1px solid black;">Scholarship Name</th><th style="border: 1px solid black;">Sponsor Name</th><th style="border: 1px solid black;">Recurrence</th><th style="border: 1px solid black;">List Date</th><th style="border: 1px solid black;">Start Date</th><th style="border: 1px solid black;">End Date</th></tr><tr><td style="border: 1px solid black;">Scholarships With No Application Dates</td><td style="border: 1px solid black;">Student Scholarship</td><td style="border: 1px solid black;">South Central Chapter - American Association of Airport Executives</td><td style="border: 1px solid black;">Annual</td></tr><tr><td style="border: 1px solid black;">Scholarships With No Application Dates</td><td style="border: 1px solid black;">Conference Assistance Scholarship</td><td style="border: 1px solid black;">South Central Chapter - American Association of Airport Executives</td><td style="border: 1px solid black;">Annual</td></tr><tr><td style="border: 1px solid black;">Scholarships With No Application Dates</td><td style="border: 1px solid black;">Loretta Scott, A.A.E. Accreditation/Certification Academy Scholarship</td><td style="border: 1px solid black;">South Central Chapter - American Association of Airport Executives</td><td style="border: 1px solid black;">Annual</td></tr></table>`
//    );
    sequelize.query(
        `SELECT public."fnQueryToHTMLTable"('SELECT * FROM public."vwScholarships_DateProblems_Alert"') AS "TableDef"`,
        { type: sequelize.QueryTypes.SELECT })
    .then( htmlTable => {
        let emailResultError = jsFx.sendEmail('fiosjlqf@gmail.com', 'Scholarship Records with Application Date Issues', '',
          htmlTable[0].TableDef);
    });

  };

module.exports = {
    test_email
};

require('make-runnable');