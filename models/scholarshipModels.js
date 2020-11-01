const Sequelize = require('sequelize');
const db = require('../db/db_config.js');

///////////////////////////////////////////////////////////////////////////////////
// a list of all active Scholarships (with Sponsor dimensional data)
///////////////////////////////////////////////////////////////////////////////////
const ScholarshipsActive = db.define('vwScholarshipsActive', {
    ScholarshipID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    ScholarshipName: {
        type: Sequelize.STRING
    },
    ScholarshipAward: {
        type: Sequelize.STRING
    },
    ScholarshipDescription: {
        type: Sequelize.STRING
    },
    ScholarshipEligibilityReqs: {
        type: Sequelize.STRING
    },
    ScholarshipApplDatesText: {
        type: Sequelize.STRING
    },
    ScholarshipContactInfoFormatted: {
        type: Sequelize.STRING
    },
    Criteria_FieldOfStudyText: {
        type: Sequelize.STRING
    },
    Criteria_FieldOfStudyMatchingText: {
        type: Sequelize.STRING
    },
    Criteria_GenderMatchingText: {
        type: Sequelize.STRING
    },
    Criteria_Gender_FemaleOnly: {
        type: Sequelize.STRING
    },
    Criteria_AgeMinimum: {
        type: Sequelize.INTEGER
    },
    Criteria_AgeMaximum: {
        type: Sequelize.INTEGER
    },
    Criteria_CitizenshipMatchingText: {
        type: Sequelize.STRING
    },
    Criteria_YearOfNeedMatchingText: {
        type: Sequelize.STRING
    },
    SponsorID: {
        type: Sequelize.INTEGER
    },
    SponsorIDMatching: {
        type: Sequelize.STRING
    },
    SponsorLogo: {
        type: Sequelize.INTEGER
    },
    SponsorName: {
        type: Sequelize.INTEGER
    }

}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all Fields of Study, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const FieldOfStudyCategoriesDDL = db.define('vwFieldOfStudyCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all Genders, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const GenderCategoriesDDL = db.define('vwGenderCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all Citizenships, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const CitizenshipCategoriesDDL = db.define('vwCitizenshipCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all Year of Need / Desired Programs, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const YearOfNeedCategoriesDDL = db.define('vwYearOfNeedCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all Enrollment Statuses, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const EnrollmentStatusCategoriesDDL = db.define('vwEnrollmentStatusCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all Military Service Types, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const MilitaryServiceCategoriesDDL = db.define('vwMilitaryServiceCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all FAA Pilot Certificates, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const FAAPilotCertificateCategoriesDDL = db.define('vwFAAPilotCertificateCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all FAA Pilot Ratings, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const FAAPilotRatingCategoriesDDL = db.define('vwFAAPilotRatingCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// a list of all FAA Mechanic Certificates, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const FAAMechanicCertificateCategoriesDDL = db.define('vwFAAMechanicCertificateCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
});

///////////////////////////////////////////////////////////////////////////////////
// export all models
///////////////////////////////////////////////////////////////////////////////////
module.exports = {
    ScholarshipsActive,
    FieldOfStudyCategoriesDDL,
    GenderCategoriesDDL,
    CitizenshipCategoriesDDL,
    YearOfNeedCategoriesDDL,
    EnrollmentStatusCategoriesDDL,
    MilitaryServiceCategoriesDDL,
    FAAPilotCertificateCategoriesDDL,
    FAAPilotRatingCategoriesDDL,
    FAAMechanicCertificateCategoriesDDL
};
