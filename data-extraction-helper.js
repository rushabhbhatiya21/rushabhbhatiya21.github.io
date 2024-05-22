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

//scroll down
//input - int (pixels - amount of pixels to scroll down)
//output - none
async function scroll_down(pixels) {
    const scroller = document.querySelector('[id*="AT2\\:_ATp\\:ATt2\\:\\:vscroller"]');
    if (scroller) {
        scroller.scrollBy(0, pixels);   
    } else {
        console.error('Scroller element not found');
    }
}

//fill person number and dates
//input - str (saperated by '~' containing person number, from date, to date)
//output - none
function fill_person_data(person_data) {
  person_data = person_data.split('~');
  document.querySelector('input[id*="qryId1\\:value10\\:\\:content"]').value = person_data[0]; //person number
  document.querySelector('input[id*="qryId1\\:value40\\:\\:content"]').value = person_data[1]; //from date
  document.querySelector('input[id*="qryId1\\:value50\\:\\:content"]').value = person_data[2]; //to date
  document.querySelector('button[id*="qryId1\\:\\:search"]').click(); //click on search
  current_person_data = person_data;
}

//get number of time card which exists
//input - none
//output - int (number of time cards)
function get_number_of_time_cards() {
  return document.querySelectorAll(`[id*=':pgl5']`).length;
}

//extarct all data of 1 time card
//input - int (number of the card)
//output - none
//all data will be saved in csv file and file will be downloaded
async function extract_time_card_data(counter) {
  let current_time_card_data = [];
  document.querySelectorAll(`[id*=':pgl5']`)[counter].click();
  await waitForElement('[id*=":AP1\\:SPc"]>a[accesskey="C"]');
  let current_row_number = parseInt(document.querySelector('tr.xem').getAttribute('_afrrk'));
  while (document.querySelector(`tr[_afrrk="${current_row_number}"]`) != null) {
    //call extract row data function and add in array
    current_time_card_data.push(extract_row_data(current_row_number));
    current_row_number++;
  }
  //create csv file and add current_time_card_data data in it
}

//extract row data
//input - int (current_row_number)
//output - array (list of data)
function extract_row_data(current_row_number) {
  const length_of_row = document.querySelector(`tr[_afrrk="${current_row_number}"]`).querySelectorAll('input').length;
  if (length_of_row == 0) {
    //annual leave
    console.log('annual leave');
  }
  else if (length_of_row < 11) {
    //leaver/joiner case
    console.log('leaver/joiner case');
  }
  else {
    //ideal case
    console.log('ideal case');
  }
}
