//fill person number and dates
//input - str (saperated by '~' containing person number, from date, to date)
//output - none
function fill_person_data(person_data) {
  person_data = person_data.split('~');
  document.querySelector('input[id*="qryId1\\:value10\\:\\:content"]').value = person_data[0]; //person number
  document.querySelector('input[id*="qryId1\\:value40\\:\\:content"]').value = person_data[1]; //from date
  document.querySelector('input[id*="qryId1\\:value50\\:\\:content"]').value = person_data[2]; //to date
  document.querySelector('button[id*="qryId1\\:\\:search"]').click(); //click on search
}
