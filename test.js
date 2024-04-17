function fill_data(elementList, valList) {
    console.log("hello");
    for(let i = 0; i < elementList.length; i++) {
        console.log(elementList[i]);
        document.querySelector('[aria-label=`${elementList[i}`]').value = valList[i];
    }
}

