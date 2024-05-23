//"20016495~03-Dec-2023~30-Dec-2023"
//global variables
var current_person_data = [];

//Function to wait for an element to be present
//input - str, int (selector - id of element to wait, attempts - number of attempts to wait for before rejecting promise)
//output - Promise
function waitForElement(selector, attempts = 25) {
  return new Promise((resolve, reject) => {
    // Check if the element is present
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
    } else if (attempts > 0) {
      // If not present and attempts remain, wait for a short interval and check again
      setTimeout(() => {
        waitForElement(selector, attempts - 1).then(resolve).catch(reject);
      }, 1000); // Adjust the interval as needed
    } else {
      // If no attempts remain, reject the promise
      reject(new Error(`Element with selector "${selector}" not found after 25 attempts`));
    }
  });
}

//add delay in milli seconds
//input - int (milli seconds)
//output - Promise
function delay(ms) {
  return new Promise((resolve, reject) => {
  setTimeout(() => {
      resolve();
  }, ms);
})
}

//scroll down
//input - int (pixels - amount of pixels to scroll down)
//output - none
async function scroll_down(pixels) {
  const scroller = document.querySelector('[id*="AT2\\:_ATp\\:ATt2\\:\\:vscroller"]');
  if (scroller) {
    scroller.scrollBy(0, pixels);
    await delay(500);
  } else {
    console.error('Scroller element not found');
  }
}

//get day of the week based on date
//input - str (date_string - format 02-Dec-2022)
//output - int (0-6 => sunday-0,..., saturday-6)
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

//check if pagination exists or if next button of pagination is disabled
//input - none
//output - bool
function check_next_page() {
  //if bar exists or not
  if (document.querySelector('a[id*=":nb_nx"][title="Next Page"]') == null) return false;

  //if next button is disbled
  return (!document.querySelector('a[id*=":nb_nx"][title="Next Page"]').classList.contains('p_AFDisabled'));
}

//click on cancel button
//input - none
//output - none
function cancel_action() {
  return new Promise((resolve) => {
    document.querySelector('[id*=":AP1\\:SPc"]>a[accesskey="C"]').click();
    waitForElement('[id*=":pgl5"]').then(() => {
      resolve();
    });
  })
}


//fill person number and dates
//input - str (saperated by '~' containing person number, from date, to date)
//output - none
function fill_person_data(person_data) {
  person_data = person_data.split('~');
  document.querySelector('input[id*="qryId1\\:value10\\:\\:content"]').value = person_data[0].toString(); //person number
  document.querySelector('input[id*="qryId1\\:value40\\:\\:content"]').value = person_data[1].toString(); //from date
  document.querySelector('input[id*="qryId1\\:value50\\:\\:content"]').value = person_data[2].toString(); //to date
  document.querySelector('button[id*="qryId1\\:\\:search"]').click(); //click on search
  current_person_data = [...person_data];
}

//get number of time card which exists
//input - none
//output - int (number of time cards)
async function get_number_of_time_cards() {
  try {
    await waitForElement("[id*=':pgl5']", 5);
    return document.querySelectorAll(`[id*=':pgl5']`).length;
  } catch (error) {
    return 0; // or any value indicating that the element was not found
  }
}

//extarct all data of 1 time card
//input - int (number of the card)
//output - none
//all data will be saved in csv file and file will be downloaded
async function extract_time_card_data(counter) {
  let current_time_card_data = [];
  document.querySelectorAll(`[id*=':pgl5']`)[counter].click();
  await waitForElement('[id*=":AP1\\:SPc"]>a[accesskey="C"]');
  let [startingDate, endingDate] = document.querySelector("[id$=':tcDetails'] > table > tbody > tr > td.x1b0").innerText.split(" : ")[1].split(" - ");
  current_person_data[1] = startingDate;
  current_person_data[2] = endingDate;
  let current_row_number = parseInt(document.querySelector('tr.xem').getAttribute('_afrrk'));

  while (document.querySelector(`tr[_afrrk="${current_row_number}"]`) != null) {
    //call extract row data function and add in array
    current_time_card_data.push(await extract_row_data(current_row_number));
    current_row_number++;
    await scroll_down(50);
  }
  current_time_card_data.map(element => {
    if(element[3] != ''){
        element[3] = element[3].split('(')[1].split(')')[0];
    }
    return element;
  });
  // console.log(current_time_card_data);

  //create csv file and add current_time_card_data data in it
  convert_to_csv(current_time_card_data);

  await cancel_action();
}

//put all data into csv file and download that file
//input - array[][] (current_time_card_data - array of array)
//output - none
function convert_to_csv(data) {
  // Convert data to CSV format
  const csvContent = data.map(row => row.join(",")).join("\n");

  // Create a blob from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a link element
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data[0][0]}Processing.csv`;

  // Append the link to the body and trigger the download
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

//extract row data
//input - int (current_row_number)
//output - array (list of data)
function extract_row_data(current_row_number) {
  return new Promise((resolve, reject) => {
    const current_row_element = document.querySelector(`tr[_afrrk="${current_row_number}"]`);
    const length_of_row = current_row_element.querySelectorAll('input').length;
    if (length_of_row == 0) {
      //annual leave
      console.log('annual leave');
      resolve(extract_row_data_absence_case(current_row_element));
    }
    else if (length_of_row < 11) {
      //leaver/joiner case
      console.log('leaver/joiner case');
      const starting_day = get_day_of_week(current_person_data[1]);
      const ending_day = get_day_of_week(current_person_data[2]);
      resolve(extract_row_data_leaver_joiner_case(current_row_element, starting_day, ending_day));
    }
    else {
      //ideal case
      console.log('ideal case');
      resolve(extract_row_data_ideal_case(current_row_element));
    }
  })
}

//extract row data for ideal case
//input - html_element (current_row_element)
//output - array (array of that row's data)
function extract_row_data_ideal_case(current_row_element) {
  let current_data = [...current_person_data];
  current_row_element.querySelectorAll('input').forEach(element => {
    current_data.push(element.value);
  });
  return current_data;
}

//extract row data for leaver/joiner case
//input - html_element, int, int (current_row_element, starting_day, ending_day)
//output - array (array of that row's data)
function extract_row_data_leaver_joiner_case(current_row_element, starting_day, ending_day) {
  let current_data = [...current_person_data];
  for (let i = 0; i < 4; i++) {
    current_data.push(current_row_element.querySelectorAll('input')[i].value);
  }
  for (let i = 0; i < 7; i++) {
    if (i < starting_day || i > ending_day) {
      current_data.push("");
    }
    else {
      current_data.push(current_row_element.querySelectorAll('input')[i-starting_day+4].value);
    }
  }
  return current_data;
}

//extract row data for annual leave or sickness
//input - html_element (current_row_number)
//output - array (array of that row's all data)
function extract_row_data_absence_case(current_row_element) {
  let current_data = [...current_person_data];
  if(current_row_element.querySelectorAll('span[id*="::content"]').length == 11) {
    current_row_element.querySelectorAll('span[id*="::content"]').forEach(element => {
      current_data.push(element.innerText)
    });
  }
  else {
    for (let i = 0; i < 4; i++) {
      current_data.push(current_row_element.querySelectorAll('span[id*="::content"]')[i].innerText);
    }
    for (let i = 0; i < 7; i++) {
      if (i < starting_day || i > ending_day) {
        current_data.push("");
      }
      else {
        current_data.push(current_row_element.querySelectorAll('span[id*="::content"]')[i-starting_day+4].innerText);
      }
    }
  }
  return current_data;
}
