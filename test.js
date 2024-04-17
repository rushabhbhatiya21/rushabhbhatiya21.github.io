function fill_data(valList) {
    console.log("hello");
    document.querySelector('[aria-label=" Person Number"').value = valList[0];
    document.querySelector('[aria-label=" dd-mmm-yyyy"')[0].value = valList[1];
    document.querySelector('[aria-label=" dd-mmm-yyyy"')[1].value = valList[2];
}

