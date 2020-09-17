//////////////////////////////////// +++++++++ BORDERREQUEST USING FETCH +++++++++ //////////////////////////
/* const status = response => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    return Promise.reject(new Error(response.statusText));
}
  
const json = response => response.json();

getBordersUsingFetch = async borders => {
    let borderString = '';
    borders.forEach ( border => {
        borderString += `${border.toLowerCase()};`;
    });
    
    //borderString = await fetch(`https://restcountries.eu/rest/v2/alpha?codes=${borderString}`)
        //.then(status)    // note that the `status` function is actually **called** here, and that it **returns a promise***
        //.then(json)      // likewise, the only difference here is that the `json` function here returns a promise that resolves with `data`
        //.then(data => {  // ... which is why `data` shows up here as the first parameter to the anonymous function
            //console.log('Request succeeded with JSON response', data);
            //return data;
        //})
        //.catch(error => console.log('Request failed', error));

    let response = await fetch(`https://restcountries.eu/rest/v2/alpha?codes=${borderString}`);
    let json = await response.json();

    console.log(json);
    return json;
} */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////



executeRequest = (region = null) => {
    let request = new XMLHttpRequest();
    let url = region ? `https://restcountries.eu/rest/v2/region/${region}` : 'https://restcountries.eu/rest/v2/all';

    request.open('GET', url);
    request.addEventListener('load', () => {
        if (request.status >= 200 && request.status < 300) {
            clearCountries();
            toggleSearchbar();
            let parsedRequest = JSON.parse(request.responseText);
            parsedRequest.forEach( item => {
                let html = generateHtmlMultipleCountries(item);
                insertHtml(html);
            });
        } else {
           console.warn(request.statusText, request.responseText);
        }
    });
    request.send();
}

executeBorderRequest = borderString => {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        let url = `https://restcountries.eu/rest/v2/alpha?codes=${borderString}`;

        request.open('GET', url);
        request.addEventListener('load', () => {
            if (request.status >= 200 && request.status < 300) {
                let countryArray = [], idArray = [];
                JSON.parse(request.responseText).forEach( country => {
                    countryArray.push(country.name);
                    idArray.push(country.alpha3Code);
                });
                resolve({"countries": countryArray, "ids": idArray});
            } else {
                console.warn(request.statusText, request.responseText);
                reject(request.statusText, request.responseText);
            }
        });
        request.send();
    });
}

getBorders = async borders => {
    if (!borders.length) return;

    let borderString = '';
    borders.forEach ( border => {
        borderString += `${border.toLowerCase()};`;
    });

    let borderData = await executeBorderRequest(borderString.slice(0, borderString.length - 1))
        .then(data => {return data;})
        .catch(err => console.error(err));

    return borderData;
}

clearCountries = () => {
    document.querySelector('.countries').innerHTML = '';
}

insertHtml = html => {
    document.querySelector('.countries').insertAdjacentHTML('beforeend', html);
}

insertCommas = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

generateHtmlMultipleCountries = item => {
    let darkmode = document.querySelector('body').classList.contains('body-darkmode') ? ' item-darkmode' : '';
    return `<div class="item${darkmode}" id="${item.alpha3Code}" onclick="showDetails('${item.alpha3Code}')">
                   <div class="item__flag">
                      <img src="${item.flag}" alt="${item.name}" class="item__flag--img">
                   </div>
                   <h2 class="item__h2">${item.name}</h2>
                   <p class="item__text">Population: <span class="item__text--data">${insertCommas(item.population)}</span></p>
                   <p class="item__text">Region: <span class="item__text--data">${item.region}</span></p>
                   <p class="item__text">Capital: <span class="item__text--data">${item.capital}</span></p>
                </div>`;
}

getItemString = items => {
    let itemString = '';
    items.forEach (item => {
        itemString += `${item.name}, `;   
    });
    return itemString.slice(0, itemString.length - 2);
}  

removeClassLists = (items, className) => {
    items.forEach( item => {
        item.classList.remove(className);
    });
}

addClassLists = (items, className) => {
    items.forEach( item => {
        item.classList.add(className);
    });
}

toggleDarkMode = () => {
    let body = document.querySelector('body');
    let header = document.querySelector('.header');
    let iconMoon = document.querySelector('.header__switch--icon');
    let backButton = document.querySelector('.btn-back');
    let iconArrowLeft = document.querySelector('.btn-back__icon');
    let itemSingle = document.querySelector('.item-single');
    let input = document.querySelector('.searchbar__input');
    let select = document.querySelector('.searchbar__select');
    let items = document.querySelectorAll('.item');
    let buttons = document.querySelectorAll('.item-single__details--button');
    let attribution = document.querySelector('.attribution');

    if (body.classList.contains('body-darkmode')) {
        body.classList.remove('body-darkmode');
        header.classList.remove('header-darkmode');
        iconMoon.classList.remove('header__switch--icon-darkmode');
        if (backButton) {
            backButton.classList.remove('btn-back-darkmode');
            iconArrowLeft.classList.remove('btn-back__icon-darkmode');
        }
        if (itemSingle) itemSingle.classList.remove('item-single-darkmode');
        input.classList.remove('searchbar__input-darkmode');
        select.classList.remove('searchbar__select-darkmode');
        removeClassLists(items, 'item-darkmode');
        removeClassLists(buttons, 'item-single__details--button-darkmode');
        attribution.classList.remove('attribution-darkmode');
    }
    else {
        body.classList.add('body-darkmode');
        header.classList.add('header-darkmode');
        iconMoon.classList.add('header__switch--icon-darkmode');
        if (backButton) {
            backButton.classList.add('btn-back-darkmode');
            iconArrowLeft.classList.add('btn-back__icon-darkmode');
        }
        if (itemSingle) itemSingle.classList.add('item-single-darkmode');
        input.classList.add('searchbar__input-darkmode');
        select.classList.add('searchbar__select-darkmode');
        addClassLists(items, 'item-darkmode');
        addClassLists(buttons, 'item-single__details--button-darkmode');
        attribution.classList.add('attribution-darkmode');
    }
}

toggleSearchbar = () => {
    let button = document.querySelector('.btn-back'),
        searchbar = document.querySelector('.searchbar');
    if (!button) searchbar.style.display = 'flex';
    else searchbar.style.display = 'none';
}

toggleBackButton = () => {
    let button = document.querySelector('.btn-back');
    if (button) button.remove();
    else {
        let buttonHtml = `<button class="btn-back${isDarkMode() ? ' btn-back-darkmode' : ''}" onclick="executeRequest()">
                            <svg class="btn-back__icon${isDarkMode() ? ' btn-back__icon-darkmode' : ''}">
                              <use xlink:href="./images/sprite.svg#icon-arrow-left"></use>
                            </svg>
                            <div class="btn-back__text">Back</div>
                          </button>`;
        insertHtml(buttonHtml);
    }
}

isDarkMode = () => {
    return document.querySelector('body').classList.contains('body-darkmode');
}

getBorderButtons = borderObject => {
    let buttons = '';
    for (let i = 0; i < borderObject.countries.length; i++) {
        buttons += `<button class="item-single__details--button${isDarkMode() ? ' item-single__details--button-darkmode' : ''}" 
                    onclick="showDetails('${borderObject.ids[i]}')">${borderObject.countries[i]}</button>`;
    }
    return buttons;
}

generateHtmlCountryDetails = (item, borderObject) => {
    let html = `<div class="item-single${isDarkMode() ? ' item-single-darkmode' : ''}" id="${item.alpha3Code}">
                   <div class="item-single__flag">
                      <img src="${item.flag}" alt="${item.name}" class="item-single__flag--img">
                   </div>
                   <div class="item-single__details">
                      <h2 class="item-single__details--h2">${item.name}</h2>
                      <div class="item-single__details--list">
                         <div class="item-single__details--list-left">
                            <p class="item-single__details--text">Native Name: <span class="item-single__details--text-data">${insertCommas(item.nativeName)}</span></p>
                            <p class="item-single__details--text">Population: <span class="item-single__details--text-data">${insertCommas(item.population)}</span></p>
                            <p class="item-single__details--text">Region: <span class="item-single__details--text-data">${item.region}</span></p>
                            <p class="item-single__details--text">Sub region: <span class="item-single__details--text-data">${item.subregion}</span></p>
                            <p class="item-single__details--text">Capital: <span class="item-single__details--text-data">${item.capital}</span></p>
                         </div>
                         <div class="item-single__details--list-right">
                            <p class="item-single__details--text">Top Level Domain: <span class="item-single__details--text-data">${item.topLevelDomain}</span></p>
                            <p class="item-single__details--text">Currencies: <span class="item-single__details--text-data">${getItemString(item.currencies)}</span></p>
                            <p class="item-single__details--text">Languages: <span class="item-single__details--text-data">${getItemString(item.languages)}</span></p>
                         </div>
                      </div>
                      <div class="item-single__details--border">
                        <p class="item-single__details--border-margin">Border Countries:</p>
                        <div class="item-single__details--border-buttons">
                            ${typeof borderObject !== 'undefined' ? getBorderButtons(borderObject) : '<span class="item-single__details--text-data"> none</span>'}
                        </div>
                        </div>
                   </div>
                </div>`;
    return html;
}

showDetails = async id => {
    let country = await fetch(`https://restcountries.eu/rest/v2/alpha/${id}`)
                        .then( response => { return response.json(); });
    let borderObject = await getBorders(country.borders);
    let html = generateHtmlCountryDetails(country, borderObject);
    clearCountries();
    toggleBackButton();
    toggleSearchbar();
    insertHtml(html);
}

let dropdown = document.querySelector('#region');
clickHandler = () => {
    if (dropdown.value != 'none') {
        executeRequest(dropdown.value.toLowerCase());
    }
}
dropdown.addEventListener('click', clickHandler);

if ('ontouchstart' in window) {
    dropdown.addEventListener('touchstart', () => {
        let touchHndl = () => {
            // call the clickHandler actually
            clickHandler();
            // remove the touchend handler after perform
            this.removeEventListener('touchend', touchHndl)
        }
        // attach a handler for touch end when you are in touchstart event
        this.addEventListener('touchend', touchHndl);
    });
}


let home = document.querySelector('.header__title');
home.addEventListener('click', () => {
    executeRequest();
    dropdown.value = 'none';
});







/* let dropdown = document.querySelector('#region');
dropdown.addEventListener('click', () => {
    let selection = document.querySelector('#region').value;
    if (selection != 'none') {
        executeRequest(selection.toLowerCase());
    }
}); */

/* generateHtmlSingleCountry = item => {
    let darkmode = document.querySelector('body').classList.contains('body-darkmode') ? ' item-darkmode' : '';
    let html = `<div class="item${darkmode}" id="${item.alpha3Code}">
                   <div class="item__flag">
                      <img src="${item.flag}" alt="${item.name}" class="item__flag--img">
                   </div>
                   <h2 class="item__h2">${item.name}</h2>
                   <p class="item__text">Native Name: <span class="item__text--data">${insertCommas(item.nativeName)}</span></p>
                   <p class="item__text">Population: <span class="item__text--data">${insertCommas(item.population)}</span></p>
                   <p class="item__text">Region: <span class="item__text--data">${item.region}</span></p>
                   <p class="item__text">Sub region: <span class="item__text--data">${item.subregion}</span></p>
                   <p class="item__text">Capital: <span class="item__text--data">${item.capital}</span></p>

                   <p class="item__text">Top Level Domain: <span class="item__text--data">${item.topLevelDomain}</span></p>
                   <p class="item__text">Currencies: <span class="item__text--data">${getItemString(item.currencies)}</span></p>
                   <p class="item__text">Languages: <span class="item__text--data">${getItemString(item.languages)}</span></p>

                   <p class="item__text">Border Countries: <span class="item__text--data">${getBorders(item.borders)}</span></p>
                </div>`;
    return html;
    // getBordersUsingFetch(item.borders)
} */


/* toggleDarkMode = () => {
    let classNames = ['.header', '.header__switch--icon', '.searchbar__input', '.searchbar__select', '.attribution'];
    let body = document.querySelector('body');
    let items = document.querySelectorAll('.item');

    if (body.classList.contains('body-darkmode')) {
        body.classList.remove('body-darkmode');

        for (let i = 0; i < classNames.length; i++) {
            let element = document.querySelector(classNames[i]);
            element.classList.remove(classNames[i] + '-darkmode');
        }

        items.forEach( item => {
            item.classList.remove('item-darkmode');
        });
    }
    else {
        body.classList.add('body-darkmode');

        for (let i = 0; i < classNames.length; i++) {
            let element = document.querySelector(classNames[i]);
            element.classList.add(classNames[i] + '-darkmode');
        }

        items.forEach( item => {
            item.classList.add('item-darkmode');
        });
    }
} */