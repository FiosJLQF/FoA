const jsFx = require('../scripts/foa_node_fx');
const { SponsorsDDL, SponsorTypeCategoriesDDL } = require('../models/sequelize.js');

async function test_email() {
    let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
    let sponsorTypeCategoriesDDLRows = sponsorTypeCategoriesDDL.rows;
    // console.log(sponsorTypeCategoriesDDLRows);
    //console.log('Starting email');
    let emailResultError = jsFx.sendEmail('fiosjlqf@gmail.com', 'Testing Scheduler Within Node.js', '',
            `This is a <b>test email</b> sent by the <em>Cron To Go</em> <u>scheduler</u>. There are ${sponsorTypeCategoriesDDL.count} rows.<br><br>
            <table style="border: 1px solid black; border-collapse: collapse;">
              <tr>
                <th style="border: 1px solid black;">GenderCategory</th>
                <th style="border: 1px solid black;">GenderCategoryID</th>
                <th style="border: 1px solid black;">RecordID</th>
                <th style="border: 1px solid black;">GenderCategorySortOrder</th>
              </tr>
              <tr>
                <td style="border: 1px solid black;>Yes</td>
                <td style="border: 1px solid black;>919001</td>
                <td style="border: 1px solid black;>1</td>
                <td style="border: 1px solid black;>1</td>
              </tr>
              <tr>
                <td style="border: 1px solid black;>No</td>
                <td style="border: 1px solid black;>919002</td>
                <td style="border: 1px solid black;>2</td>
                <td style="border: 1px solid black;>2</td>
              </tr>
            </table>`);
    //console.log('Finishing email');
};

module.exports = {
    test_email
};

require('make-runnable');