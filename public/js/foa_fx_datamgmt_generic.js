////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Scripts for the Data Mgmt pages (client-side scripts)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   openScholarshipTab
//   openSponsorTab
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
// On the data mgmt forms, show/hide the "Edit" or "Preview" tab, as indicated
//////////////////////////////////////////////////////////////////////////////////////////
function openScholarshipTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Build the scholarship preview DIV
    if ( tabName === 'tabPreview') {
        // Clear any status messages
        if ( document.getElementById('statusMessage') ) {
            document.getElementById('statusMessage').innerText = '';
        };
        const divScholarshipPreview = buildScholarshipSearchResultDiv(scholarshipData, false, false);
        document.getElementById('tabPreview').replaceChildren(divScholarshipPreview);
    };

};

//////////////////////////////////////////////////////////////////////////////////////////
// On the data mgmt forms, show/hide the "Edit" or "Preview" tab, as indicated
//////////////////////////////////////////////////////////////////////////////////////////
function openSponsorTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Build the sponsor preview DIV
    if ( tabName === 'tabPreview') {
        // Clear any status messages
        if ( document.getElementById('statusMessage') ) {
            document.getElementById('statusMessage').innerText = '';
        };
        const divSponsorPreview = buildSponsorSearchResultDiv(sponsorData, sponsorData['ScholarshipCountActive']);
        document.getElementById('tabPreview').replaceChildren(divSponsorPreview);
        document.getElementById('iconExpand_undefined').classList.remove('fa-chevron-down');
    };

};
