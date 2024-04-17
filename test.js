function fill_data(valList) {
    console.log("hello");
    document.querySelector('[aria-label=" Person Number"').value = valList[0];
    var elements = document.querySelector('[aria-label=" dd-mmm-yyyy"');
    elements[0].value = valList[1];
    elements[1].value = valList[2];
}

