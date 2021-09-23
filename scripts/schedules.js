const jsFx = require('../scripts/foa_node_fx');
const { SponsorsDDL, SponsorTypeCategoriesDDL } = require('../models/sequelize.js');

async function test_email() {
    let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
    let sponsorTypeCategoriesDDLRows = sponsorTypeCategoriesDDL.rows;
    // console.log(sponsorTypeCategoriesDDLRows);
    //console.log('Starting email');
    let emailResultError = jsFx.sendEmail('fiosjlqf@gmail.com', 'Testing Scheduler Within Node.js', '',
            `This is a <bold>test email</bold> sent by the <em>Cron To Go</em> <u>scheduler</u>. There are ${sponsorTypeCategoriesDDL.count} rows.`);
    //console.log('Finishing email');
};

module.exports = {
    test_email
};

require('make-runnable');