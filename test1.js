function fill_data(valList) {
    // console.log("hello");
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

//get difference in days
function get_difference_in_days(dateString1, dateString2) {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    const differenceInMs = Math.abs(date1 - date2);
    var differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24)) + 1
    const remdayweek = differenceInDays % 7 == 0 ? 0 : 1;
    differenceInDays = Math.floor(differenceInDays / 7)
    return differenceInDays + remdayweek;
}

function fill_person_number(val) {
    return new Promise((resolve, reject) => {
        waitForElement(`[id*='personName2Id\\:\\:_afrLovInternalQueryId\\:value00\\:\\:content']`).then(() => {
            document.querySelector('[id*="personName2Id\\:\\:_afrLovInternalQueryId\\:value10\\:\\:content"]').value = '';
            return waitForElement("[id*='personName2Id\\:\\:_afrLovInternalQueryId\\:value00\\:\\:content']");
        }).then(() => {
            document.querySelector('[aria-label=" Person Number"][id*="personName2Id"]').value = val;
            resolve(); // Resolve the Promise when all operations are completed
        }).catch((error) => {
            reject(error); // Reject the Promise if there's an error
        });
    });
}

function fill_year(val, weekNo) {
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

    // Convert val to a JavaScript Date object
    var date = new Date(year, month, day);
    
    // Add weekNo*7 days to the date
    date.setDate(date.getDate() + (weekNo * 7));

    var diffYear = currYear - date.getFullYear();
    var diffMonth = currMonth - date.getMonth();

    // Adjust the year
    while (diffYear !== 0) {
        if (diffYear > 0) {
            document.querySelector('[id*="cd1::ys::decrement"]').click();
            diffYear--;
        } else {
            document.querySelector('[id*="cd1::ys::increment"]').click();
            diffYear++;
        }
    }

    // Adjust the month
    while (diffMonth !== 0) {
        if (diffMonth > 0) {
            document.querySelector('[title="Previous Month"]').click();
            diffMonth--;
        } else {
            document.querySelector('[title="Next Month"]').click();
            diffMonth++;
        }
    }

    // Click on the day
    Array.from(document.getElementsByClassName('x12k')).forEach(cell => {
        if (+cell.innerText === date.getDate()) {
            cell.click();
        }
    });
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

// //mapping of expenditure to tr attribute
// var expenditureMap = {
//   "Annual Leave": "0",
//   "Bank Holidays": "1",
//   "Contracted Hours - Employee": "2",
//   "Employee Volunteering and Fundraising": "3",
//   "Extra Hours - Employee": "4",
//   "Leavers/Joiners": "5",
//   "Mace Day": "6",
//   "Other Leave - Christmas Close Down": "7",
//   "Other Leave - Compassionate": "8",
//   "Other Leave - Jury Service": "9",
//   "Other Leave - Medical Appointments": "10",
//   "Other Leave - Paid": "11",
//   "Other Leave - Study Leave": "12",
//   "Other Leave - Unpaid": "13",
//   "Other Leave - Voluntary Reserve Forces Leave": "14",
//   "Parental Leave": "15",
//   "Sickness (Long Term) (GIP)": "16",
//   "Sickness (Short Term)": "17",
//   "Training": "18"
// }

var absenseTypeMapping = {
  "annual leave": "annual leave",
  "bank holidays": "bank holidays",
  "mace day": "mace day",
  "other leave - compassionate": "compassionate leave",
  "other leave - jury service": "jury service",
  "other leave - unpaid": "unpaid leave",
  "other leave - voluntary reserve forces leave": "voluntary reserve forces leave",
  "parental leave": "maternity leave",
  "sickness-gip": "sickness (long term) (gip)",
  "sickness": "sickness (short term)"
}

var cardState = {
    "AbsentType" : {},
    "NumberOfAT" : 0,
    "startingDay" : 0,
    "endingDay" : 6,
    "rowNo" : 0
}

var continueFlag = true;

function set_card_state() {
    let numberOfAT = document.getElementsByClassName('xwn').length - 5;
    let [startingDate, endingDate] = document.querySelector("[id$=':tcDetails'] > table > tbody > tr > td.x1b0").innerText.split(" : ")[1].split(" - ");
    let startingDay = get_day_of_week(startingDate);
    let endingDay = get_day_of_week(endingDate);
    cardState["NumberOfAT"] = numberOfAT;
    cardState["rowNo"] = parseInt(document.querySelector('tr.xem').getAttribute('_afrrk'));
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
            let key = absenseTypeMapping[document.querySelectorAll('.x2hi span[id$="socMatrixAttributeNumber6"]')[i].innerText.toLowerCase()];
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
    let expanditureTask = excelData[2];
    let excelHour = excelData.slice(3,10);
    if(cardState["NumberOfAT"] > 0 && expanditureTask != "Extra Hours - Employee"){
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
            document.querySelector(`tr[_afrrk="${index}"]`).querySelector(`[id*='\\:socMatrixAttributeNumber2\\:\\:lovIconId']`).click();
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
            document.querySelector("[id*='socMatrixAttributeNumber2\\:\\:_afrLovInternalQueryId\\:\\:search']").click(); // Click search
            // return waitForElement('[id*="socMatrixAttributeNumber2_afrLovInternalTableId::db"] > table > tbody > tr');
            return delay(3000);
        }).then(() => {
            if (document.querySelector('[id*="socMatrixAttributeNumber2_afrLovInternalTableId::db"] > table > tbody > tr') == null) {
                continueFlag = false;
                document.querySelector('[id*="socMatrixAttributeNumber2\\:\\:lovDialogId\\:\\:cancel"]').click();
                // cancel_action();
                // resolve();
                // return;
            }
            else {
                document.querySelectorAll('[id*="socMatrixAttributeNumber2_afrLovInternalTableId::db"] > table > tbody > tr')[0].click();
                document.querySelector("[id*='\\:lovDialogId\\:\\:ok']").click();
            }
            resolve(); // Resolve the Promise when all operations are completed
        }).catch((error) => {
            reject(error); // Reject the Promise if there's an error
        });
    });
}

function set_task(index, task) {
        return new Promise((resolve, reject) =>{
        waitForElement(`[id*='\\:socMatrixAttributeNumber4\\:\\:lovIconId']`).then(() => {
            document.querySelector(`tr[_afrrk="${index}"]`).querySelector(`[id*='\\:socMatrixAttributeNumber4\\:\\:lovIconId']`).click();
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
            document.querySelector("[id*='socMatrixAttributeNumber4\\:\\:_afrLovInternalQueryId\\:\\:search']").click(); // Click search
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
        waitForElement('[id*="socMatrixAttributeChar1\\:\\:lovIconId"]').then(() => {
            document.querySelector(`tr[_afrrk="${index}"]`).querySelector('[id*="socMatrixAttributeChar1\\:\\:lovIconId"]').click();
            return waitForElement("[id*='\\:\\:dropdownPopup\\:\\:popupsearch']");
        }).then(() => {
            document.querySelector("[id*='\\:\\:dropdownPopup\\:\\:popupsearch']").click();
            return waitForElement("[id*='socMatrixAttributeChar1\\:\\:_afrLovInternalQueryId\\:\\:search']");
        }).then(() => {
            document.querySelector('[id*="socMatrixAttributeChar1\\:\\:_afrLovInternalQueryId\\:\\:search"]').click();
            // return delay(3000);
            return waitForElement('[id*="\\:socMatrixAttributeChar1_afrtablegridcell\\:\\:c"] > div > div:nth-child(2) > table > tbody');
        }).then(async () => {
            // if (document.querySelector('[id*="\\:socMatrixAttributeChar1_afrtablegridcell\\:\\:c"] > div > div:nth-child(2) > table > tbody') == null) {
            //     document.querySelector('[id*="socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:cancel"]').click();
            //     set_expenditure(index,type);
            // }
            document.querySelector('[id*="\:socMatrixAttributeChar1_afrtablegridcell\:\:c"] > div > div:nth-child(2) > table > tbody').querySelectorAll('tr.xem').forEach((tr) => {
                if(tr.innerText.trim().toLowerCase() == type.toLowerCase()){
                    tr.click();
                }
            })
            return waitForElement("[id*='socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:ok']");
            // const tbody = document.querySelector('[id*="\\:socMatrixAttributeChar1_afrtablegridcell\\:\\:c"] > div > div:nth-child(2) > table > tbody');
            //     if (tbody == null) {
            //         document.querySelector('[id*="socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:cancel"]').click();
            //         delay(1000);
            //         await scroll_up();
            //         set_expenditure(index, type)
            //         return;
            //     }
            //     tbody.querySelectorAll('tr.xem').forEach((tr) => {
            //         if (tr.innerText.trim().toLowerCase() === type.toLowerCase()) {
            //             tr.click();
            //         }
            //     });
            //     return waitForElement("[id*='socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:ok']");
        }).then(() => {
            document.querySelector('[id*="socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:ok"]').click();
            resolve();
        }).catch((error) => {
            console.error("Error:", error);
            reject(error);
        });
    });
}

// let currentExpenditurePromise = null;

// function set_expenditure(index, type) {
// If there is a pending promise, wait for it to resolve before starting a new one
//     if (currentExpenditurePromise) {
//         return currentExpenditurePromise.then(() => set_expenditure(index, type));
//     }

//     currentExpenditurePromise = new Promise((resolve, reject) => {
//         waitForElement('[title="Search: Expenditure Type"]').then(() => {
//             document.querySelectorAll('[title="Search: Expenditure Type"]')[index].click();
//             return waitForElement("[id*='\\:\\:dropdownPopup\\:\\:popupsearch']");
//         }).then(() => {
//             document.querySelector("[id*='\\:\\:dropdownPopup\\:\\:popupsearch']").click();
//             return waitForElement("[id*='socMatrixAttributeChar1\\:\\:_afrLovInternalQueryId\\:\\:search']");
//         }).then(() => {
//             document.querySelector('[id*="socMatrixAttributeChar1\\:\\:_afrLovInternalQueryId\\:\\:search"]').click();
//             return delay(3000);
//         }).then(async () => {
//             const tbody = document.querySelector('[id*="\\:socMatrixAttributeChar1_afrtablegridcell\\:\\:c"] > div > div:nth-child(2) > table > tbody');
//             if (tbody == null) {
//                 document.querySelector('[id*="socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:cancel"]').click();
//                 await delay(1000);
//                 await scroll_up();
//                 resolve(); // Resolve the current promise before starting a new one
//                 currentExpenditurePromise = null; // Clear the current promise
//                 return set_expenditure(index, type); // Start the function again
//             }
//             tbody.querySelectorAll('tr.xem').forEach((tr) => {
//                 if (tr.innerText.trim().toLowerCase() === type.toLowerCase()) {
//                     tr.click();
//                 }
//             });
//             return waitForElement("[id*='socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:ok']");
//         }).then(() => {
//             document.querySelector('[id*="socMatrixAttributeChar1\\:\\:lovDialogId\\:\\:ok"]').click();
//             resolve();
//             currentExpenditurePromise = null; // Clear the current promise
//         }).catch((error) => {
//             console.error("Error:", error);
//             reject(error);
//             currentExpenditurePromise = null; // Clear the current promise on error
//         });
//     });

//     return currentExpenditurePromise;
// }


async function set_hours_data(index, data) {
    // console.log("starting setting hours");
    let counter = 1;
    for(let i = cardState["startingDay"]; i <= cardState["endingDay"]; i++, counter++) {
        document.querySelector(`tr[_afrrk="${index}"]`).querySelector(`input[id*="\\:m${counter}\\:\\:content"]`).value = data[i];
        console.log("count", counter ,"data",  data[i], "index", index);
    }
}

async function add_new_row_below() {
    Array.from(document.getElementsByClassName('xwn')).slice(-1)[0].click();
    document.querySelector('img[id*="ctb1\\:\\:icon"]').click();
}

// function scroll_up_down() {
//     if (document.querySelector('[id*="AT2\\:_ATp\\:ATt2\\:\\:vscroller"]')) {
        
//         console.log("waiting 4 seconds...");
//         delay(4000);              // Wait for 4 seconds
        
//         console.log("wait over");
//     } else {
//         console.log('Scroller element not found');
//     }
// }

async function scroll_up(x) {
    const scroller = document.querySelector('[id*="AT2\\:_ATp\\:ATt2\\:\\:vscroller"]');
    if (scroller) {
        scroller.scrollBy(0, x);  // Scroll up
        await delay(4000);              // Wait for 4 seconds
    } else {
        console.error('Scroller element not found');
    }
}

async function scroll_down(x) {
    const scroller = document.querySelector('[id*="AT2\\:_ATp\\:ATt2\\:\\:vscroller"]');
    if (scroller) {
        scroller.scrollBy(0, x);   // Scroll down
        await delay(4000);
    } else {
        console.error('Scroller element not found');
    }
}


async function check_row(index){
    if(document.querySelector(`tr[_afrrk='${index}']`) != null){
        return;
    }else{
        document.querySelector(`tr[_afrrk='${index-1}']`).click();
        document.querySelector('img[id*="ctb1\\:\\:icon"]').click();
        await delay(3000);
        await scroll_down(50);
        return;
    }
}


async function fill_row_data(project, task, exType, hourList) {
    return new Promise((resolve, reject) => {
        let index = cardState["rowNo"] + cardState["NumberOfAT"];
        check_row(index).then(()=> {
            return set_project(index, project);
        })
            .then(() => {
                if (continueFlag) {
                    return set_task(index, task);
                }
                console.log('inside set task, outside if');
                return;
            })
            .then(() => {
                if (continueFlag) {
                    return delay(1500);
                }
                console.log('after set task, outside if');
                return;
            })
            .then(async () => {
                if (continueFlag) {
                    return set_expenditure(index, exType);
                }
                return;
            })
            .then(() => {
                if (continueFlag) {
                    return delay(1500);
                }
                return;
            })
            .then(async () => {
                if (!continueFlag) {
                    resolve();
                    return;
                }
                await set_hours_data(index, hourList);
                await delay(3000);
                cardState["rowNo"] = index + 1;
                resolve();
            })
            .catch((error) => {
                reject();
                throw error;
            });
    });
}


function cancel_action() {
    document.querySelector('[id*=":AP1\\:SPc"]>a[accesskey="C"]').click();
    waitForElement('[id*="AP1\\:dialog2"]').then(() => {
        document.querySelector('button[id*="AP1\\:dialog2\\:\\:yes"]').click();
    });
}
