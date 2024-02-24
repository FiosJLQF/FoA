//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

const { ScholarshipsAllDDL, ScholarshipsAllMgmtView, SponsorsAllView, SponsorsAllDDL
    } = require('../models/sequelize_foa.js');
//const { UserPermissionsAllDDL, UserPermissionsAllView
//    } = require('../models/sequelize_common.js');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const nodemailer = require('nodemailer');  // allows SMPT push emails to be sent
const commonFx = require('./common_fx_server');


//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Sponsor permissions
// Notes:  Input parameters are validated prior to this function call.
//////////////////////////////////////////////////////////////////////////////////////////
async function getSponsorPermissionsForCurrentUser( currentUserID, sponsorIDRequested ) {

    // declare and set local variables
    let userCanReadSponsorsDDL = false;
    let sponsorsAllowedToUser = '';
    let sponsorsAllowedToUserArray = [];
    let userCanCreateSponsors = false;
    let sponsorsAllowedDDL = [];
    let sponsorDetails = [];
    let doesSponsorExist = false;
    let userCanReadSponsor = false;
    let userCanUpdateSponsor = false;
    let userCanDeleteSponsor = false;

    // Get the generic sponsor-related permissions for the current user
    userCanReadSponsorsDDL = await commonFx.checkUserPermission( currentUserID, '923003', 'CanRead' );
    sponsorsAllowedToUser = await commonFx.checkUserPermission( currentUserID, '923006', 'ObjectValues' );
    sponsorsAllowedToUserArray = sponsorsAllowedToUser.split('|').slice(1, -1);
    userCanCreateSponsors = await commonFx.checkUserPermission( currentUserID, '923003', 'CanCreate' );

    // Can the current user view the Sponsors DDL?
    if ( userCanReadSponsorsDDL ) {

        // Find the list of Sponsors the current user is allowed to see (for loading into the DDL)
        if ( sponsorsAllowedToUser === '*' ) {
            sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll({});
        } else {  // Current user can only see specific Sponsor(s)
            sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll({ where: { optionid: sponsorsAllowedToUserArray } });
        };

        // If a querystring request was made for a specific Sponsor's data, find and validate it
        if ( sponsorIDRequested.toString().length > 0 ) {
            // Does the requested Sponsor exist? Retrieve the Sponsor's details from the database.
            sponsorDetails = await SponsorsAllView.findAll({ where: { SponsorID: sponsorIDRequested }});
            if ( typeof sponsorDetails[0] === 'undefined' ) {  // Sponsor ID does not exist
                doesSponsorExist = false;
            } else { // Sponsor ID does exist
                doesSponsorExist = true;
                // Can current user view requested sponsor?
                if ( sponsorsAllowedToUserArray.indexOf(sponsorIDRequested.toString()) > -1 || (sponsorsAllowedToUser === '*') ) {
                    userCanReadSponsor = await commonFx.checkUserPermission( currentUserID, '923006', 'CanRead' );
                    userCanUpdateSponsor = await commonFx.checkUserPermission( currentUserID, '923006', 'CanUpdate' );
                    userCanDeleteSponsor = await commonFx.checkUserPermission( currentUserID, '923006', 'CanDelete' );
                };
            };
        };

    } else { // populate a blank data set
        sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll( { where: { optionid: 0 } } );
    }; // End: Current User can read the Website Users DDL

    return { userCanReadSponsorsDDL, userCanCreateSponsors, sponsorsAllowedDDL,
             sponsorDetails, doesSponsorExist, userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor };
};


//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Scholarship permissions
// Notes:  Input parameters are validated prior to this function call.
//         Current User has permission to see Sponsor ID.
//////////////////////////////////////////////////////////////////////////////////////////
async function getScholarshipPermissionsForCurrentUser( currentUserID, sponsorIDRequested, scholarshipIDRequested ) {

    console.log(`sponsorIDRequested at Scholarships fx: ${sponsorIDRequested}`);
    console.log(`sponsorIDRequested.length at Scholarships fx: ${sponsorIDRequested.toString().length}`);

    // declare and set local variables
    let userCanReadScholarshipsDDL = false;
    let scholarshipsAllowedToUser = '';
    let scholarshipsAllowedToUserArray = [];
    let scholarshipsAllowedDDL = [];
    let scholarshipDetails = [];
    let doesScholarshipExist = false;
    let userCanCreateScholarships = false;
    let userCanReadScholarship = false;
    let userCanUpdateScholarship = false;
    let userCanDeleteScholarship = false;

    // Get the generic scholarship-related permissions for the current user
    userCanReadScholarshipsDDL = await commonFx.checkUserPermission( currentUserID, '923002', 'CanRead' );
    scholarshipsAllowedToUser = await commonFx.checkUserPermission( currentUserID, '923005', 'ObjectValues' );
    scholarshipsAllowedToUserArray = scholarshipsAllowedToUser.split('|').slice(1, -1);
    userCanCreateScholarships = await commonFx.checkUserPermission( currentUserID, '923002', 'CanCreate' );

    // Can the current user view the Scholarships DDL?
    if ( userCanReadScholarshipsDDL ) {

        // If a SponsorID was requested, find the list of Scholarships the current user is allowed to see (for loading into the DDL)
        // Note: If no SponsorID was requested, then the Scholarships DDL is not populated or enabled
        if ( sponsorIDRequested.toString().length > 0 ) {
            if ( scholarshipsAllowedToUser === '*' ) {
                scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
            } else {  // Current user can only see specific scholarships
                scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( {
                    where: {
                        optionid: scholarshipsAllowedToUserArray,
                        SponsorID: sponsorIDRequested
                    } } );
            };
        } else { // populate a blank data set
            scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( { where: { SponsorID: 0 } } );
        };

        // If a querystring request was made for a specific Scholarship's data, find and validate it
        if ( scholarshipIDRequested.toString().length > 0 ) {
            // Does the requested Scholarship exist? Retrieve the Scholarship's details from the database.
            scholarshipDetails = await ScholarshipsAllMgmtView.findAll({ where: { ScholarshipID: scholarshipIDRequested }});
            if ( typeof scholarshipDetails[0] === 'undefined' ) {  // Scholarship ID does not exist
                doesScholarshipExist = false;
            } else { // Scholarship ID does exist
                doesScholarshipExist = true;
                // Can current user view requested scholarship?
                if ( scholarshipsAllowedToUserArray.indexOf(scholarshipIDRequested.toString()) > -1 || (scholarshipsAllowedToUser === '*') ) {
                    userCanReadScholarship = await commonFx.checkUserPermission( currentUserID, '923005', 'CanRead' );
                    userCanUpdateScholarship = await commonFx.checkUserPermission( currentUserID, '923005', 'CanUpdate' );
                    userCanDeleteScholarship = await commonFx.checkUserPermission( currentUserID, '923005', 'CanDelete' );
                };
            };
        };

    } else { // populate a blank data set
        scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( { where: { optionid: 0 } } );
    }; // End: User can read the Scholarships DDL (no "else" as the variable defaults above are set to this condition)

    return { userCanReadScholarshipsDDL, userCanCreateScholarships, scholarshipsAllowedDDL,
             scholarshipDetails, doesScholarshipExist,
             userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship };
};


module.exports = {
    getSponsorPermissionsForCurrentUser,
    getScholarshipPermissionsForCurrentUser,
};