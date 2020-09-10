
///////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////

const routes = require('express').Router();
const { pool } = require('../db/dbstuff.js');
const async = require('async');
const queries = require('../db/sql.js');

// Website "Home"
routes.get('/', (request, response) => {
  response.status(200).json({ message: 'Connected!' });
//  response.render('scholarshipsearch');
});

// Get all scholarships, regardless of filters
routes.get('/scholarships', (request, response, next) => {

    async function queryResults() {
//        try {
            let resSponsors = await pool.query(queries.qrySponsorsActiveDDL.text);
            const resSponsorsRows = resSponsors.rows;
            let resFieldOfStudyCategories = await pool.query(queries.qryFieldOfStudyCategoriesActiveDDL.text);
            const resFieldOfStudyCategoriesRows = resFieldOfStudyCategories.rows;
            let resCitizenships = await pool.query(queries.qryCitizenshipsActiveDDL.text);
            const resCitizenshipsRows = resCitizenships.rows;
            let resYearOfNeed = await pool.query(queries.qryYearOfNeedActiveDDL.text);
            const resYearOfNeedRows = resYearOfNeed.rows;
            let resEnrollmentStatuses = await pool.query(queries.qryEnrollmentStatusesActiveDDL.text);
            const resEnrollmentStatusesRows = resEnrollmentStatuses.rows;
            let resMilitaryServiceCategories = await pool.query(queries.qryMilitaryServiceCategoriesActiveDDL.text);
            const resMilitaryServiceCategoriesRows = resMilitaryServiceCategories.rows;
            let resFAAPilotCertificateCategories = await pool.query(queries.qryFAAPilotCertificateCategoriesActiveDDL.text);
            const resFAAPilotCertificateCategoriesRows = resFAAPilotCertificateCategories.rows;
            let resFAAPilotRatingCategories = await pool.query(queries.qryFAAPilotRatingCategoriesActiveDDL.text);
            const resFAAPilotRatingCategoriesRows = resFAAPilotRatingCategories.rows;
            let resFAAMechanicCertificateCategories = await pool.query(queries.qryFAAMechanicCertificateCategoriesActiveDDL.text);
            const resFAAMechanicCertificateCategoriesRows = resFAAMechanicCertificateCategories.rows;
            // Load all scholarships
            let resScholarships = await pool.query(queries.qryScholarships.text);
            const resScholarshipsRows = resScholarships.rows;
            // Return all data sets to the calling function
            return { resSponsorsRows, 
                     resFieldOfStudyCategoriesRows, 
                     resCitizenshipsRows, 
                     resYearOfNeedRows,
                     resEnrollmentStatusesRows,
                     resMilitaryServiceCategoriesRows,
                     resFAAPilotCertificateCategoriesRows,
                     resFAAPilotRatingCategoriesRows,
                     resFAAMechanicCertificateCategoriesRows,
                     resScholarshipsRows
            };
//        }
//        catch {
//
//        }
//        finally {
//
//        }
    }

    // Collect all data sets and render the Scholarships Search page
    queryResults().then( (result) => {
//        console.log('test3A');
//        console.log(result.resSponsorsRows);
//        console.log(result.resAreasOfInterestRows);
//        console.log('test3B');
//        console.log(Object.assign({}, ...result.resultsRows1));
//        console.log(result.resCitizenshipsRows);
        response.render('scholarshipsearch', { 
            sponsors:                         result.resSponsorsRows,
            fieldofstudycategories:           result.resFieldOfStudyCategoriesRows,
            citizenships:                     result.resCitizenshipsRows,
            yearofneed:                       result.resYearOfNeedRows,
            enrollmentstatuscategories:       result.resEnrollmentStatusesRows,
            militaryservicecategories:        result.resMilitaryServiceCategoriesRows,
            faapilotcertificatecategories:    result.resFAAPilotCertificateCategoriesRows,
            faapilotratingcategories:         result.resFAAPilotRatingCategoriesRows,
            faamechaniccertificatecategories: result.resFAAMechanicCertificateCategoriesRows,
            scholarships:                     result.resScholarshipsRows
        });
    })

/*
    let results1 = [];

        const data1 = async db.query(qryFind.text, qryFind.values, (err, res) => {
        if (err) return next(err);
        console.log('test1');
//        response.render('scholarshipsearch', { scholarships: res.rows, test: res.rows });
//        if (err) return next(err);
//        console.log('test2');
//        results1 = res.rows;
//        return res.rows;
//        callback(null, res.rows);
        setValue(res.rows);
        });
    
        function setValue(value) {
            results1 = value;
            console.log('test6');
            console.log(results1);
        }
    console.log('test4');
    console.log(results1);
    console.log('test5');
//    response.render('scholarshipsearch', { scholarships: results1.rows, test: results1.rows });


/*     db.query(qryFind.text, qryFind.values, (err, res) => {
        if (err) return next(err);
        console.log('test1');
        response.render('scholarshipsearch', { scholarships: res.rows, test: res.rows });
        if (err) return next(err);
        console.log('test2');
        results1 = res.rows;
    })
 */

 // Get a specific scholarship
 routes.get('/scholarships/:id', (request, response, next) => {
    const { id } = request.params;
    db.query('SELECT "ScholarshipName" FROM public."tblScholarships" WHERE "ScholarshipID" = $1', [id], (err, res) => {
        if (err) return next(err);
        console.log('test1');
//        console.log(res.rows[0]['ScholarshipName']);
        response.render('scholarshipsearch', { scholarshipName: res.rows[0]['ScholarshipName'] });
//        response.render('scholarshipsearch', { scholarships: res.rows });
        console.log('test2');
    })
});

//   console.log(results1);

});

module.exports = routes;
