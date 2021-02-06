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

// Test the DB Connection
sequelize.authenticate().then(() => {
    console.log("Success!");
  }).catch((err) => {
    console.log(err);
});


/**************************************************************************************************
  Import all models
**************************************************************************************************/
const ScholarshipsTableModel = require('./scholarshipsTable.model');
const ScholarshipsTable = ScholarshipsTableModel(sequelize, DataTypes);
ScholarshipsTable.removeAttribute('id');  // a different, auto-populated primary key is used in the DB
const ScholarshipsActiveModel = require('./scholarshipsActiveView.model');
const ScholarshipsActive = ScholarshipsActiveModel(sequelize, DataTypes);
const ScholarshipsDDLModel = require('./scholarshipnameddl.model');
const ScholarshipsDDL = ScholarshipsDDLModel(sequelize, DataTypes);
const ScholarshipsAllDDLModel = require('./scholarshipnameallddl.model');
const ScholarshipsAllDDL = ScholarshipsAllDDLModel(sequelize, DataTypes);
const FieldOfStudyCategoriesDDLModel = require('./fieldofstudyddl.model');
const FieldOfStudyCategoriesDDL = FieldOfStudyCategoriesDDLModel(sequelize, DataTypes);
const SponsorsDDLModel = require('./sponsornameddl.model');
const SponsorsDDL = SponsorsDDLModel(sequelize, DataTypes);
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
const SponsorsModel = require('./sponsors.model');
const Sponsors = SponsorsModel(sequelize, DataTypes);
const SponsorTypeCategoriesDDLModel = require('./sponsortypeddl.model');
const SponsorTypeCategoriesDDL = SponsorTypeCategoriesDDLModel(sequelize, DataTypes);
const UsersAllDDLModel = require('./usersAllDLL.model');
const UsersAllDDL = UsersAllDDLModel(sequelize, DataTypes);
const UserPermissionsActiveModel = require('./userPermissionsActive.model');
const UserPermissionsActive = UserPermissionsActiveModel(sequelize, DataTypes);
//const UserProfilesModel = require('./userProfiles.model');
//const UserProfiles = UserProfilesModel(sequelize, DataTypes);
//UserProfiles.removeAttribute('id');  // this is an non-updatable view and does not have a PK defined


/**************************************************************************************************
  Export objects
**************************************************************************************************/
module.exports = {
  ScholarshipsTable,
  ScholarshipsActive,
  ScholarshipsDDL,
  ScholarshipsAllDDL,
  FieldOfStudyCategoriesDDL,
  SponsorsDDL,
  GenderCategoriesDDL,
  CitizenshipCategoriesDDL,
  YearOfNeedCategoriesDDL,
  EnrollmentStatusCategoriesDDL,
  MilitaryServiceCategoriesDDL,
  FAAPilotCertificateCategoriesDDL,
  FAAPilotRatingCategoriesDDL,
  FAAMechanicCertificateCategoriesDDL,
  Sponsors,
  SponsorTypeCategoriesDDL,
  UsersAllDDL,
  
  UserPermissionsActive//,
//  UserProfiles
};