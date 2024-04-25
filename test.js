function fill_data(valList) {
    console.log("hello");
    document.querySelector('[aria-label=" Person Number"').value = valList[0];
    document.querySelectorAll('[aria-label="dd-mmm-yyyy"')[0].value = valList[1];
    document.querySelectorAll('[aria-label="dd-mmm-yyyy"')[1].value = valList[2];
}

// Function to wait for an element to be present
function waitForElement(selector) {
    return new Promise((resolve, reject) => {
        // Check if the element is present
        const element = document.querySelector(selector);
        if (element) {
            resolve();
        } else {
            // If not present, wait for a short interval and check again
            setTimeout(() => {
                waitForElement(selector).then(resolve);
            }, 1000); // Adjust the interval as needed
        }
    });
}

function fill_person_number(val) {
    document.querySelector('[aria-label=" Person Number"][id*="personName2Id"]').value = val;
    console.log(val);
}

function fill_year(val) {
    var currYear = parseInt(document.querySelector('[id*="cd1::ys::content"]').value);
    var currMonth = parseInt(document.querySelector('[id*="cd1\\:\\:mSel\\:\\:content"]').value);
    var month_dict = {
        "Jan": 0,
        "Feb": 1,
        "Mar": 2,
        "Apr": 3,
        "May": 4,
        "Jun": 5,
        "Jul": 6,
        "Aug": 7,
        "Sep": 8,
        "Oct": 9,
        "Nov": 10,
        "Dec": 11,
    }
    var year = parseInt(val.split("-")[2]);
    var month = month_dict[val.split("-")[1]];
    var day = val.split("-")[0];
    var diff = currYear - year;

    //for year
    while (diff != 0) {
        if (diff > 0) {
            document.querySelector('[id*="cd1::ys::decrement"]').click();
            diff--;
        }
        else {
            document.querySelector('[id*="cd1::ys::increment"]').click();
            diff++;
        }
    }

    //for month
    diff = currMonth - month;
    while (diff != 0) {
        if (diff > 0) {
            document.querySelector('[title="Previous Month"]').click();
            diff--;
        }
        else {
            document.querySelector('[title="Next Month"]').click();
            diff++;
        }
    }

    //for day
    Array.from(document.getElementsByClassName('x12k')).forEach(cell => {
        if(+cell.innerText == +day){
            cell.click();
        }
    })
}

function get_day_of_week(dateString) {
    const parts = dateString.split('-');
    const day = parseInt(parts[0], 10);
    const monthAbbrev = parts[1];
    const year = parseInt(parts[2], 10);

    const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthAbbreviations.findIndex(abbr => abbr === monthAbbrev);
    const date = new Date(year, month, day);
    return date.getDay();
}

//mapping of expenditure to tr attribute
var expenditureMap = {
  "Annual Leave": "0",
  "Bank Holidays": "1",
  "Contracted Hours - Employee": "2",
  "Employee Volunteering and Fundraising": "3",
  "Extra Hours - Employee": "4",
  "Leavers/Joiners": "5",
  "Mace Day": "6",
  "Other Leave - Christmas Close Down": "7",
  "Other Leave - Compassionate": "8",
  "Other Leave - Jury Service": "9",
  "Other Leave - Medical Appointments": "10",
  "Other Leave - Paid": "11",
  "Other Leave - Study Leave": "12",
  "Other Leave - Unpaid": "13",
  "Other Leave - Voluntary Reserve Forces Leave": "14",
  "Parental Leave": "15",
  "Sickness (Long Term) (GIP)": "16",
  "Sickness (Short Term)": "17",
  "Training": "18"
}

function set_expenditure(index, type) {
    return new Promise((resolve, reject) =>{
        waitForElement('[title="Search: Expenditure Type"]').then(() => {
            document.querySelectorAll('[title="Search: Expenditure Type"]')[index].click();
            return waitForElement("[id*='\\:\\:dropdownPopup\\:\\:popupsearch']");
        }).then(() => {
            document.querySelector("[id*='\\:\\:dropdownPopup\\:\\:popupsearch']").click();
            return waitForElement("[id*='_afrLovInternalQueryId\\:\\:search']");
        }).then(() => {
            document.querySelector('[id*="_afrLovInternalQueryId\\:\\:search"]').click();
            return waitForElement('[id*="\\:socMatrixAttributeChar1_afrtablegridcell\\:\\:c"] > div > div:nth-child(2) > table > tbody');
        }).then(() => {
            document.querySelector('[id*="\:socMatrixAttributeChar1_afrtablegridcell\:\:c"] > div > div:nth-child(2) > table > tbody').querySelector(`tr[_afrrk='${type}']`).click();
            return waitForElement("[id*='socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:ok']");
        }).then(() => {
            document.querySelector('[id*="socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:ok"]').click();
            resolve();
        }).catch((error) => {
            console.error("Error:", error);
            reject(error);
        });
    });
}

function set_hours_data(index, data) {
    for(let i = startinDay; i <= endingDay; i++, counter++) {
        document.querySelectorAll(`input[id*="\\:m${counter}\\:\\:content"]`)[index].value = data[i];
    }
}

