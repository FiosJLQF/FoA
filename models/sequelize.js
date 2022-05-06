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
    console.log("Database connection success!");
  }).catch((err) => {
    console.log(err);
});


/**************************************************************************************************
  Import all models
**************************************************************************************************/

/********************************************
  Administrative Models
********************************************/
const EventLogsTableModel = require('./eventLogsTable.model');
const EventLogsTable = EventLogsTableModel(sequelize, DataTypes);
EventLogsTable.removeAttribute('id');  // a different, auto-populated primary key is used in the DB

/********************************************
  Scholarship Models
********************************************/
// const ScholarshipsTableTestModel = require('./scholarshipsTableTest.model');
// const ScholarshipsTableTest = ScholarshipsTableTestModel(sequelize, DataTypes);
// ScholarshipsTableTest.removeAttribute('id');  // a different, auto-populated primary key is used in the DB
const ScholarshipsTableModel = require('./scholarshipsTable.model');
const ScholarshipsTable = ScholarshipsTableModel(sequelize, DataTypes);
ScholarshipsTable.removeAttribute('id');  // a different, auto-populated primary key is used in the DB
// const ScholarshipsAllMgmtViewTestModel = require('./scholarshipsAllMgmtView_Test.model');
// const ScholarshipsAllMgmtViewTest = ScholarshipsAllMgmtViewTestModel(sequelize, DataTypes);
const ScholarshipsAllMgmtViewModel = require('./scholarshipsAllMgmtView.model');
const ScholarshipsAllMgmtView = ScholarshipsAllMgmtViewModel(sequelize, DataTypes);
const ScholarshipsActiveModel = require('./scholarshipsActiveView.model');
const ScholarshipsActive = ScholarshipsActiveModel(sequelize, DataTypes);
// const ScholarshipsActiveDDLModel = require('./scholarshipsActiveDDL.model.js_deprecated');
// const ScholarshipsActiveDDL = ScholarshipsActiveDDLModel(sequelize, DataTypes);
const ScholarshipsAllDDLModel = require('./scholarshipsAllDDL.model');
const ScholarshipsAllDDL = ScholarshipsAllDDLModel(sequelize, DataTypes);
//const ScholarshipsAllDDLTestModel = require('./scholarshipsAllDDL_Test.model');
//const ScholarshipsAllDDLTest = ScholarshipsAllDDLTestModel(sequelize, DataTypes);
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
// const SponsorsTableTestModel = require('./sponsorsTableTest.model');
// const SponsorsTableTest = SponsorsTableTestModel(sequelize, DataTypes);
// SponsorsTableTest.removeAttribute('id');  // The default [id] column is not used in this table
const SponsorsTableModel = require('./sponsorsTable.model');
const SponsorsTable = SponsorsTableModel(sequelize, DataTypes);
SponsorsTable.removeAttribute('id');  // The default [id] column is not used in this table
const SponsorsAllDDLModel = require('./sponsorsAllDDL.model');
const SponsorsAllDDL = SponsorsAllDDLModel(sequelize, DataTypes);
// const SponsorsAllDDLTestModel = require('./sponsorsAllDDL_Test.model');
// const SponsorsAllDDLTest = SponsorsAllDDLTestModel(sequelize, DataTypes);
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

/********************************************
  User Models
********************************************/
/*****************************
  User Profiles
*****************************/
// Basic user profile information formatted for the "Select a User" SELECT object
const UsersAllDDLModel = require('./usersAllDDL.model');
const UsersAllDDL = UsersAllDDLModel(sequelize, DataTypes);
// View used to read Website User's data
const UsersAllViewModel = require('./usersAllView.model');
const UsersAllView = UsersAllViewModel(sequelize, DataTypes);
UsersAllView.removeAttribute('id');  // The default [id] column is not used in this table
// Table reference used for writing user profile data to the database
const UsersTableModel = require('./usersTable.model');
const UsersTable = UsersTableModel(sequelize, DataTypes);
UsersTable.removeAttribute('id');  // The default [id] column is not used in this table
// View used for reading user profile data
const UserProfilesModel = require('./userProfiles.model');
const UserProfiles = UserProfilesModel(sequelize, DataTypes);
UserProfiles.removeAttribute('id');  // this is an non-updatable view and does not have a PK defined
/*****************************
  User Permissions
*****************************/
// View used for reading all user permission data (for loading into the "Select a User Permission" SELECT object)
const UserPermissionsAllDDLModel = require('./userPermissionsAllDDL.model');
const UserPermissionsAllDDL = UserPermissionsAllDDLModel(sequelize, DataTypes);
UserPermissionsAllDDL.removeAttribute('id');  // this is an non-updatable view and does not have a PK defined
// Table reference used for writing user permission data to the database
const UserPermissionsTableModel = require('./userPermissionsTable.model');
const UserPermissionsTable = UserPermissionsTableModel(sequelize, DataTypes);
UserPermissionsTable.removeAttribute('id');  // The default [id] column is not used in this table
// View used for reading all user permission data (for data mgmt)
const UserPermissionsAllViewModel = require('./userPermissionsAllView.model');
const UserPermissionsAllView = UserPermissionsAllViewModel(sequelize, DataTypes);
UserPermissionsAllView.removeAttribute('id');  // this is an non-updatable view and does not have a PK defined
// View used for reading active user permission data (for authorization checking)
const UserPermissionsActiveModel = require('./userPermissionsActive.model');
const UserPermissionsActive = UserPermissionsActiveModel(sequelize, DataTypes);
UserPermissionsActive.removeAttribute('id');  // this is an non-updatable view and does not have a PK defined
// Basic user permission category information formatted for the "Select a User Permission Category" SELECT object
const UserPermissionCategoriesAllDDLModel = require('./userPermissionCategoriesAllDDL.model');
const UserPermissionCategoriesAllDDL = UserPermissionCategoriesAllDDLModel(sequelize, DataTypes);

/**************************************************************************************************
  Export objects
**************************************************************************************************/
module.exports = {
  EventLogsTable,
  // ScholarshipsTableTest,
  ScholarshipsTable,
  // ScholarshipsAllMgmtViewTest,
  ScholarshipsAllMgmtView,
  ScholarshipsActive,
  // ScholarshipsActiveDDL,
  ScholarshipsAllDDL,
  //ScholarshipsAllDDLTest,
  ScholarshipRecurrenceCategoriesDDL,
  ScholarshipStatusCategoriesDDL,
  FieldOfStudyCategoriesDDL,
  SponsorsTable,
  // SponsorsTableTest,
  SponsorsAllDDL,
  // SponsorsAllDDLTest,
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
  SponsorTypeCategoriesDDL,
  UsersAllDDL,
  UsersAllView,
  UsersTable,
  UserProfiles,
  UserPermissionsTable,
  UserPermissionCategoriesAllDDL,
  UserPermissionsActive,
  UserPermissionsAllView,
  UserPermissionsAllDDL
};