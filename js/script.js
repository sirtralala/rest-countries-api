//////////////////////////////////////////////////////////////////////////////////////
// GLOBAL VARIABLES

let home = document.querySelector('.header__title');
let searchbar = document.querySelector('.searchbar');
let search = document.querySelector('#search');
let dropdown = document.querySelector('#region');
let displayedCountries = document.querySelectorAll('.item');
let button = document.querySelector('.btn-back');

updateDisplayedCountries = () => {
    displayedCountries = document.querySelectorAll('.item');
}


//////////////////////////////////////////////////////////////////////////////////////
// API REQUEST FUNCTIONS

executeRequest = (region = null) => {
    let request = new XMLHttpRequest();
    let url = 'https://restcountries.eu/rest/v2/';
    (region && region != 'all' && region != 'none') ? url += `region/${region}` : url +='all';

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
            updateDisplayedCountries();
        } else {
            console.warn(request.statusText, request.responseText);
            document.querySelector('.content').innerHTML = `Error status ${request.status}: Something went wrong with the API request...`;
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


//////////////////////////////////////////////////////////////////////////////////////
// DOM MANIPULATION

clearCountries = () => {
    document.querySelector('.countries').innerHTML = '';
}

isDarkMode = () => {
    return document.querySelector('body').classList.contains('body-darkmode');
}

insertHtml = html => {
    document.querySelector('.countries').insertAdjacentHTML('beforeend', html);
}

insertCommas = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

getItemString = items => {
    let itemString = '';
    items.forEach (item => {
        itemString += `${item.name}, `;   
    });
    return itemString.slice(0, itemString.length - 2);
}

getBorderButtons = borderObject => {
    let buttons = '';
    for (let i = 0; i < borderObject.countries.length; i++) {
        buttons += `<button class="item-single__details--button${isDarkMode() ? ' item-single__details--button-darkmode' : ''}" 
                    onclick="showDetails('${borderObject.ids[i]}')">${borderObject.countries[i]}</button>`;
    }
    return buttons;
}

generateHtmlMultipleCountries = item => {
    return `<div class="item${isDarkMode() ? ' item-darkmode' : ''}" id="${item.alpha3Code}" onclick="showDetails('${item.alpha3Code}')">
                <div class="item__flag">
                    <img src="${item.flag}" alt="${item.name}" class="item__flag--img">
                </div>
                <h2 class="item__h2">${item.name}</h2>
                <p class="item__text">Population: <span class="item__text--data">${insertCommas(item.population)}</span></p>
                <p class="item__text">Region: <span class="item__text--data">${item.region}</span></p>
                <p class="item__text">Capital: <span class="item__text--data">${item.capital}</span></p>
            </div>`;
}

generateHtmlCountryDetails = (item, borderObject) => {
    return `<div class="item-single${isDarkMode() ? ' item-single-darkmode' : ''}" id="${item.alpha3Code}">
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
}


//////////////////////////////////////////////////////////////////////////////////////
// TOGGLE FUNCTIONS

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
    if (!document.querySelector('.btn-back')) searchbar.style.display = 'flex';
    else searchbar.style.display = 'none';
}

toggleBackButton = () => {
    if (button) button.remove();
    else {
        let buttonHtml = `<button class="btn-back${isDarkMode() ? ' btn-back-darkmode' : ''}" onclick="executeRequest(dropdown.value.toLowerCase())">
                            <svg class="btn-back__icon${isDarkMode() ? ' btn-back__icon-darkmode' : ''}">
                              <use xlink:href="./images/sprite.svg#icon-arrow-left"></use>
                            </svg>
                            <div class="btn-back__text">Back</div>
                          </button>`;
        insertHtml(buttonHtml);
    }
}


//////////////////////////////////////////////////////////////////////////////////////
// USER INTERACTION FUNCTIONS

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

searchCountry = (value, displayedCountries) => {
    clearCountries();
    displayedCountries.forEach( country => {
        let countryName = country.childNodes[3].innerText.toLowerCase();
        if (countryName.includes(value)) document.querySelector('.countries').appendChild(country);
    });
}

search.addEventListener('keyup', () => {
    if (search.value != undefined) searchCountry(search.value.toLowerCase(), displayedCountries);
});

search.addEventListener('search', () => {
    if (search.value.length == 0) executeRequest(dropdown.value.toLowerCase());
});

dropdown.addEventListener('click', () => {
    if (dropdown.value != 'none') executeRequest(dropdown.value.toLowerCase());
});

home.addEventListener('click', () => {
    executeRequest();
    dropdown.value = 'none';
});