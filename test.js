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

var cardState = {
    "AbsentType" : {},
    "NumberOfAT" : 0,
    "startingDay" : 0,
    "endingDay" : 6,
    "rowNo" : 0
}

function set_card_state() {
    let numberOfAT = document.getElementsByClassName('xwn').length - 5;
    let [startingDate, endingDate] = document.querySelector("[id$=':tcDetails'] > table > tbody > tr > td.x1b0").innerText.split(" : ")[1].split(" - ");
    let startingDay = getDayOfWeek(startingDate);
    let endingDay = getDayOfWeek(endingDate);
    cardState["NumberOfAT"] = numberOfAT;
    cardState["rowNo"] = 0;
    cardState["startingDay"] = startingDay;
    cardState["endingDay"] = endingDay;
    if(numberOfAT == 0){
        cardState["AbsentType"] = {};
        return;
    }else{
        let dict = {};
        for(let i=0;i<numberOfAT;i++){
            let dayArr = [false, false, false, false, false, false, false];
            for(let j=startingDay+1;j<=endingDay+1;j++){
                let hourString = document.getElementsByClassName('x1u p_AFReadOnly')[(i*(endingDay-startingDay+1))+(j-1)].innerText;
                if(hourString != ""){
                    dayArr[j-1] = true;
                }
            }
            let key = expenditureMap[document.querySelectorAll('.x2hi span[id$="socMatrixAttributeNumber6"]')[i].innerText];
            dict[key] = dayArr;
        }
        cardState["AbsentType"] = dict;
    }
}

function is_hour_list_empty(arr) {
    return arr.join('').length == 0;
}

function delay(ms) {
        return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

async function handle_data(excelDataString) {
    let excelData = excelDataString.split("~");
    let Project = excelData[0];
    let Task = excelData[1];
    let expanditureTask = expenditureMap[excelData[2]];
    let excelHour = excelData.slice(3,10);
    if(cardState["NumberOfAT"] > 0 && expanditureTask != "4"){
        let absTypeDict = cardState["AbsentType"];
        for(let absType in absTypeDict){
            let initHour = ['', '', '', '', '', '', ''];
            let conflictingHour = absTypeDict[absType];
            for(let i = cardState["startingDay"]; i<= cardState["endingDay"]; i++){
                if(conflictingHour[i]){
                    initHour[i] = excelHour[i];
                    excelHour[i] = '';
                }
            }
            if(!is_hour_list_empty(initHour)){
                await fill_row_data(Project, Task, absType, initHour);
            }
        }
    }
    if(!is_hour_list_empty(excelHour)){
        await fill_row_data(Project, Task, expanditureTask, excelHour);
    }
}

function set_project(index, project) {
        return new Promise((resolve, reject) => {
        waitForElement(`[id*='\\:socMatrixAttributeNumber2\\:\\:lovIconId']`).then(() => {
            document.querySelectorAll(`[id*='\\:socMatrixAttributeNumber2\\:\\:lovIconId']`)[index].click();
            return waitForElement("[id*='socMatrixAttributeNumber2\\:\\:dropdownPopup\\:\\:popupsearch']");
        }).then(() => {
            document.querySelector("[id*='socMatrixAttributeNumber2\\:\\:dropdownPopup\\:\\:popupsearch']").click();
            return waitForElement("[id*=':socMatrixAttributeNumber2lovPopupId\\:\\:popup-container']");
        }).then(() => {
            return waitForElement("[id*='_afrLovInternalQueryId\\:\\:mode']");
        }).then(() => {
            document.querySelector("[id*='_afrLovInternalQueryId\\:\\:mode']").click();
            return waitForElement('[id*="_afrLovInternalQueryId\\:operator0\\:\\:pop"] > li:nth-child(6)');
        }).then(() => {
            document.querySelector('[id*="_afrLovInternalQueryId\\:operator0\\:\\:pop"] > li:nth-child(6)').click();
            document.querySelector('input[aria-label=" Display Value"]').value = project;
            document.querySelector("[id*='_afrLovInternalQueryId\\:\\:search']").click(); // Click search
            return waitForElement('[id*="socMatrixAttributeNumber2_afrLovInternalTableId::db"] > table > tbody > tr');
        }).then(() => {
            document.querySelectorAll('[id*="socMatrixAttributeNumber2_afrLovInternalTableId::db"] > table > tbody > tr')[0].click();
            document.querySelector("[id*='\\:lovDialogId\\:\\:ok']").click();
            resolve(); // Resolve the Promise when all operations are completed
        }).catch((error) => {
            reject(error); // Reject the Promise if there's an error
        });
    });
}

function set_task(index, task) {
        return new Promise((resolve, reject) =>{
        waitForElement(`[id*='\\:socMatrixAttributeNumber4\\:\\:lovIconId']`).then(() => {
            document.querySelectorAll(`[id*='\\:socMatrixAttributeNumber4\\:\\:lovIconId']`)[index].click();
            return waitForElement("[id*='socMatrixAttributeNumber4\\:\\:dropdownPopup\\:\\:popupsearch']");
        }).then(() => {
            document.querySelector("[id*='socMatrixAttributeNumber4\\:\\:dropdownPopup\\:\\:popupsearch']").click(); // Click popup search
            return waitForElement("[id*=':socMatrixAttributeNumber4lovPopupId\\:\\:popup-container']");
        }).then(() => {
            return waitForElement("[id*='_afrLovInternalQueryId\\:\\:mode']");
        }).then(() => {
            document.querySelector("[id*='_afrLovInternalQueryId\\:\\:mode']").click();
            return waitForElement('[id*="_afrLovInternalQueryId\\:operator0\\:\\:pop"] > li:nth-child(6)');
        }).then(() => {
            document.querySelector('[id*="_afrLovInternalQueryId\\:operator0\\:\\:pop"] > li:nth-child(6)').click();
            document.querySelector('input[aria-label=" Display Value"]').value = task;
            document.querySelector("[id*='_afrLovInternalQueryId\\:\\:search']").click(); // Click search
            return waitForElement("[id*='_afrLovInternalTableId\\:\\:db'] > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr > td");
        }).then(() => {
            document.querySelector("[id*='_afrLovInternalTableId\\:\\:db'] > table > tbody > tr > td:nth-child(2) > div > table > tbody > tr > td").click();
            document.querySelector("[id*='\\:lovDialogId\\:\\:ok']").click();
            resolve(); // Resolve the Promise when all operations are completed
        }).catch((error) => {
            console.error("Error:", error);
            reject(error); // Reject the Promise if there's an error
        });
    });
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

async function set_hours_data(index, data) {
    for(let i = startinDay; i <= endingDay; i++, counter++) {
        document.querySelectorAll(`input[id*="\\:m${counter}\\:\\:content"]`)[index].value = data[i];
    }
}

async function add_new_row_below() {
    Array.from(document.getElementsByClassName('xwn')).slice(-1)[0].click();
    document.querySelector('img[id*="ctb1\\:\\:icon"]').click();
}

async function fill_row_data(project, task, exType, hourList) {
    return new Promise((resolve, reject) => {
        let index = cardState["rowNo"];
        console.log("here0");
        set_project(index, project)
        .then(() => {
            console.log("here1");
            return set_task(index, task);
        })
        .then(() => {
            console.log("here2");
            return set_expenditure(index, exType);
        })
        .then(() => {
            return delay(1500);
        })
        .then(async () => {
            console.log("here3");
            await set_hours_data(index, hourList);
            console.log("abc");
            cardState["rowNo"] = index+1;
            await add_new_row_below();
            await delay(1000);
            resolve();
        }).catch((error) => {
            reject();
            throw error;
        });
    });
}
