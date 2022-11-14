/**************************************************************************************************
  Define all required libraries
**************************************************************************************************/
require("dotenv").config();  // load all ".env" variables into "process.env" for use


/**************************************************************************************************
  Create the database connection and test
**************************************************************************************************/
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

//// Test the DB Connection
//sequelize.authenticate().then(() => {
//    console.log("Database connection success!");
//  }).catch((err) => {
//    console.log(err);
//});


/********************************************
  Scholarship Models
********************************************/
const ScholarshipsTableModel = require('./scholarshipsTable.model');
const ScholarshipsTable = ScholarshipsTableModel(sequelize, DataTypes);
ScholarshipsTable.removeAttribute('id');  // a different, auto-populated primary key is used in the DB
const ScholarshipsAllMgmtViewModel = require('./scholarshipsAllMgmtView.model');
const ScholarshipsAllMgmtView = ScholarshipsAllMgmtViewModel(sequelize, DataTypes);
const ScholarshipsActiveModel = require('./scholarshipsActiveView.model');
const ScholarshipsActive = ScholarshipsActiveModel(sequelize, DataTypes);
const ScholarshipsAllDDLModel = require('./scholarshipsAllDDL.model');
const ScholarshipsAllDDL = ScholarshipsAllDDLModel(sequelize, DataTypes);
const FieldOfStudyCategoriesDDLModel = require('./fieldofstudyddl.model');
const FieldOfStudyCategoriesDDL = FieldOfStudyCategoriesDDLModel(sequelize, DataTypes);
const GenderCategoriesDDLModel = require('./genderddl.model');
const GenderCategoriesDDL = GenderCategoriesDDLModel(sequelize, DataTypes);
const CitizenshipCategoriesDDLModel = require('./citizenshipddl.model');
const CitizenshipCategoriesDDL = CitizenshipCategoriesDDLModel(sequelize, DataTypes);
const YearOfNeedCategoriesDDLModel = require('./yearofneedddl.model');
const YearOfNeedCategoriesDDL = YearOfNeedCategoriesDDLModel(sequelize, DataTypes);
const EnrollmentStatusCategoriesDDLModel = require('./enrollmentstatusddl.model');
const EnrollmentStatusCategoriesDDL = EnrollmentStatusCategoriesDDLModel(sequelize, DataTypes);
const MilitaryServiceCategoriesDDLModel = require('./militaryserviceddl.model');
const MilitaryServiceCategoriesDDL = MilitaryServiceCategoriesDDLModel(sequelize, DataTypes);
const FAAPilotCertificateCategoriesDDLModel = require('./faapilotcertificateddl.model');
const FAAPilotCertificateCategoriesDDL = FAAPilotCertificateCategoriesDDLModel(sequelize, DataTypes);
const FAAPilotRatingCategoriesDDLModel = require('./faapilotratingddl.model');
const FAAPilotRatingCategoriesDDL = FAAPilotRatingCategoriesDDLModel(sequelize, DataTypes);
const FAAMechanicCertificateCategoriesDDLModel = require('./faamechaniccertificateddl.model');
const FAAMechanicCertificateCategoriesDDL = FAAMechanicCertificateCategoriesDDLModel(sequelize, DataTypes);
const ScholarshipRecurrenceCategoriesDDLModel = require('./scholarshipRecurrenceDDL.model');
const ScholarshipRecurrenceCategoriesDDL = ScholarshipRecurrenceCategoriesDDLModel(sequelize, DataTypes);
const ScholarshipStatusCategoriesDDLModel = require('./scholarshipStatusDDL.model');
const ScholarshipStatusCategoriesDDL = ScholarshipStatusCategoriesDDLModel(sequelize, DataTypes);


/********************************************
  Sponsor Models
********************************************/
const SponsorsTableModel = require('./sponsorsTable.model');
const SponsorsTable = SponsorsTableModel(sequelize, DataTypes);
SponsorsTable.removeAttribute('id');  // The default [id] column is not used in this table
const SponsorsAllDDLModel = require('./sponsorsAllDDL.model');
const SponsorsAllDDL = SponsorsAllDDLModel(sequelize, DataTypes);
const SponsorsAllViewModel = require('./sponsorsAllView.model');
const SponsorsAllView = SponsorsAllViewModel(sequelize, DataTypes);
const SponsorTypeCategoriesDDLModel = require('./sponsorTypeCategoriesDDL.model');
const SponsorTypeCategoriesDDL = SponsorTypeCategoriesDDLModel(sequelize, DataTypes);
const SponsorStatusCategoriesDDLModel = require('./sponsorStatusDDL.model');
const SponsorStatusCategoriesDDL = SponsorStatusCategoriesDDLModel(sequelize, DataTypes);
const SponsorsActiveViewModel = require('./sponsorsActiveView.model');
const SponsorsActiveView = SponsorsActiveViewModel(sequelize, DataTypes);
const SponsorsActiveDDLModel = require('./sponsorsActiveDDL.model');
const SponsorsActiveDDL = SponsorsActiveDDLModel(sequelize, DataTypes);

/**************************************************************************************************
  Export objects
**************************************************************************************************/
module.exports = {
  ScholarshipsTable,
  ScholarshipsAllMgmtView,
  ScholarshipsActive,
  ScholarshipsAllDDL,
  ScholarshipRecurrenceCategoriesDDL,
  ScholarshipStatusCategoriesDDL,
  FieldOfStudyCategoriesDDL,
  SponsorsTable,
  SponsorsAllDDL,
  SponsorStatusCategoriesDDL,
  SponsorsActiveView,
  SponsorsActiveDDL,
  GenderCategoriesDDL,
  CitizenshipCategoriesDDL,
  YearOfNeedCategoriesDDL,
  EnrollmentStatusCategoriesDDL,
  MilitaryServiceCategoriesDDL,
  FAAPilotCertificateCategoriesDDL,
  FAAPilotRatingCategoriesDDL,
  FAAMechanicCertificateCategoriesDDL,
  SponsorsAllView,
  SponsorTypeCategoriesDDL
};