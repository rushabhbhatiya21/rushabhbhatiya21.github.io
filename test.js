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
            }, 500); // Adjust the interval as needed
        }
    });
}

function fill_person_number(id, val) {
    document.querySelector(id).value = val;
}

function fill_year(id, val) {
    var currVal = document.querySelector(id).value;
    var diff = currVal - val;

    while (diff == 0) {
        if (diff > 0) {
            document.querySelector('[id*="cd1::ys::decrement"]').click();
            diff--;
        }
        else {
            document.querySelector('[id*="cd1::ys::increment"]').click();
            diff++;
        }
    }
}
