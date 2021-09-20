const jsFx = require('../scripts/foa_node_fx');
const { SponsorsDDL, SponsorTypeCategoriesDDL } = require('../models/sequelize.js');

async function test_email() {
    let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
    let sponsorTypeCategoriesDDLRows = sponsorTypeCategoriesDDL.rows;
    console.log(sponsorTypesCategoriesDDLRows);
    console.log('Starting email');
    let emailResultError = jsFx.sendEmail('fiosjlqf@gmail.com', 'Testing Scheduler Within Node.js',
            `This is a test email sent by the Cron To Go scheduler.`);
    console.log('Finishing email');
};

module.exports = {
    test_email
};

require('make-runnable');