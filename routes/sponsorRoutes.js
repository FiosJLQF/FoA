const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('./../db/db_config.js');
const Sponsors = require(path.join(__dirname, '../models/', 'sponsorModels2.js'));
//const Sponsors = require('./../models/sponsorModels');
const Scholarships = require(path.join(__dirname, '../models/', 'scholarshipModels2.js'));
//const Scholarships = require('./../models/scholarshipModels');

// All routes that start with "/sponsorsearch"; since this is part of the definition in app.js
// the "/" implies "/sponsorsearch".

///////////////////////////////////////////////////////////////////////////////////
// get all Sponsors (i.e., https://.../sponsorsearch/)
///////////////////////////////////////////////////////////////////////////////////
router.get('/', async (request, response) => {

    try {
        // get a distinct list of Sponsors
        const sponsorsAll = await Sponsors.SponsorsAll.findAll();
        console.log(`Sponsors Count: ${sponsorsAll.length}`);

        // get a distinct list of Sponsors for the Search Criteria DDL
        const sponsorsDDL = await Sponsors.SponsorsDDL.findAll();
        console.log(`Sponsors Count: ${sponsorsDDL.length}`);

        // get a distinct list of Sponsor Type(s) for the Search Criteria DDL
        const sponsortypesDDL = await Sponsors.SponsorTypeCategoriesDDL.findAll();
        console.log(`Sponsors Count: ${sponsortypesDDL.length}`);

        // get a distinct list of active Scholarships, ordered by Sponsor Name, Scholarship Name
        const scholarshipsActive = await Scholarships.ScholarshipsActive.findAll(
//             {
//            order: [
//                ['ScholarshipName', 'ASC'],
//                ['SponsorName', 'ASC'],
//            ]
//        }
        );
        console.log(`Scholarships (Active) Count: ${scholarshipsActive.length}`);

        return response.render('sponsorsearch', {
            sponsors:        sponsorsAll,
            sponsorsddl:     sponsorsDDL,
            sponsortypesddl: sponsortypesDDL,
            scholarships:    scholarshipsActive
        })
    } catch(err) {
        console.log('Error:' + err);
    }
});

///////////////////////////////////////////////////////////////////////////////////
// export all routes
///////////////////////////////////////////////////////////////////////////////////
module.exports = router;