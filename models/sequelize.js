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
const ScholarshipsTableTestModel = require('./scholarshipsTableTest.model');
const ScholarshipsTableTest = ScholarshipsTableTestModel(sequelize, DataTypes);
ScholarshipsTableTest.removeAttribute('id');  // a different, auto-populated primary key is used in the DB
const ScholarshipsAllMgmtViewTestModel = require('./scholarshipsAllMgmtView_Test.model');
const ScholarshipsAllMgmtViewTest = ScholarshipsAllMgmtViewTestModel(sequelize, DataTypes);
const ScholarshipsActiveModel = require('./scholarshipsActiveView.model');
const ScholarshipsActive = ScholarshipsActiveModel(sequelize, DataTypes);
const ScholarshipsDDLModel = require('./scholarshipnameddl.model');
const ScholarshipsDDL = ScholarshipsDDLModel(sequelize, DataTypes);
const ScholarshipsAllDDLModel = require('./scholarshipnameallddl.model');
const ScholarshipsAllDDL = ScholarshipsAllDDLModel(sequelize, DataTypes);
const ScholarshipsAllDDLTestModel = require('./scholarshipsAllDDL_Test.model');
const ScholarshipsAllDDLTest = ScholarshipsAllDDLTestModel(sequelize, DataTypes);
const FieldOfStudyCategoriesDDLModel = require('./fieldofstudyddl.model');
const FieldOfStudyCategoriesDDL = FieldOfStudyCategoriesDDLModel(sequelize, DataTypes);
const SponsorsTableTestModel = require('./sponsorsTableTest.model');
const SponsorsTableTest = SponsorsTableTestModel(sequelize, DataTypes);
SponsorsTableTest.removeAttribute('id');  // The default [id] column is not used in this table
const SponsorsAllDDLModel = require('./sponsorsAllDDL.model');
const SponsorsAllDDL = SponsorsAllDDLModel(sequelize, DataTypes);
const SponsorsAllDDLTestModel = require('./sponsorsAllDDL_Test.model');
const SponsorsAllDDLTest = SponsorsAllDDLTestModel(sequelize, DataTypes);
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
UserPermissionsActive.removeAttribute('id');  // this is an non-updatable view and does not have a PK defined
const UserProfilesModel = require('./userProfiles.model');
const UserProfiles = UserProfilesModel(sequelize, DataTypes);
UserProfiles.removeAttribute('id');  // this is an non-updatable view and does not have a PK defined
const ScholarshipRecurrenceCategoriesDDLModel = require('./scholarshipRecurrenceDDL.model');
const ScholarshipRecurrenceCategoriesDDL = ScholarshipRecurrenceCategoriesDDLModel(sequelize, DataTypes);
const ScholarshipStatusCategoriesDDLModel = require('./scholarshipStatusDDL.model');
const ScholarshipStatusCategoriesDDL = ScholarshipStatusCategoriesDDLModel(sequelize, DataTypes);


/**************************************************************************************************
  Export objects
**************************************************************************************************/
module.exports = {
  ScholarshipsTableTest,
  ScholarshipsAllMgmtViewTest,
  ScholarshipsActive,
  ScholarshipsDDL,
  ScholarshipsAllDDL,
  ScholarshipsAllDDLTest,
  FieldOfStudyCategoriesDDL,
  SponsorsTableTest,
  SponsorsAllDDL,
  SponsorsAllDDLTest,
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
  UserPermissionsActive,
  UserProfiles,
  ScholarshipRecurrenceCategoriesDDL,
  ScholarshipStatusCategoriesDDL
};