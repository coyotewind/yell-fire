// please note I have intentionally added a console.log to ever place possible
// this is for demonstration and learning purposes for this project build
// it goes without saying these would be cleared in a true production version

// thing to learn: how to manipulate the date format returned from api
// thing to learn: more advanced search filtering combinations
// thing to learn: how to toggle content based on radio button selection
// thing to learn: how to do do user preferences

// set global variables and destructure for easy access when build search strings

const BASE = 'https://api.currentsapi.services/v1';
const API = 'apiKey=6cM3cGbK5JIaanwonRCk_FyX1CHxpnjU3NrSOmvveKt6ZRj5';
const ENDPOINTS = {
    NEWS: 'latest-news',
    SEARCH: 'search',
    AVAILABLE: 'available',
    OBJECTS: {
        CATEGORIES: 'categories',
        LANGUAGES: 'languages',
        REGIONS: 'regions',
        KEYWORDS: 'keywords',
        START: 'start_date',
        END: 'end_date',
        PAGE: 'page_number',
        TAG: 'category',
    },
};
const { NEWS, SEARCH, AVAILABLE } = ENDPOINTS;
const { CATEGORIES, LANGUAGES, REGIONS, KEYWORDS, START, END, PAGE, TAG } = ENDPOINTS.OBJECTS;

console.log('build global variables for');
console.log('base = ', BASE);
console.log('api = ', API);
console.log('endponts =', ENDPOINTS);
console.log('objects = ', ENDPOINTS.OBJECTS);

// set up some global variavles for unse in pagination

let searchStr;
let pageStr;
let pageInt = 1;

console.log('page = ', pageInt);

// no time to explore this feature

// function storePrefs() {
//     localStorage.setItem('prefs', JSON.stringify(prefs));
// }
// function retrievePrefs() {
//     prefs = JSON.parse(localStorage.getItem('prefs')) || fetchDefaultPrefs();
// }
// function fetchDefaultPrefs() {
//     return { darkMode: false };
// }

// get list of 'categories' from local storage 'if' it exists and return
// else, get list of 'categories' from 'AVAILABLE' endpoint as a fallback
// also, set list of 'categories' in local storage if it does not exist
// return  the list of 'categories'

async function fetchCategories() {
    if (localStorage.getItem('categories')) {
        console.log('get categories from local storage');
        return JSON.parse(localStorage.getItem('categories'));
    }
    const url = `${BASE}/${AVAILABLE}/${CATEGORIES}?${API}`;
    try {
        const response = await fetch(url);
        const { categories } = await response.json();
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log('get categories from api');
        return categories;
    } catch (error) {
        console.error(error.message);
    } finally { console.log('fetch categories list') }
}

// get list of 'languages' from local storage 'if' it exists and return
// else, get list of 'languages' from 'AVAILABLE' endpoint as a fallback
// also, set list of 'lanaguages' in local storage if it does not exist
// return  the list of 'languages'

async function fetchLanguages() {
    if (localStorage.getItem('languages')) {
        console.log('get languages from local storage');
        return JSON.parse(localStorage.getItem('languages'));
    }
    const url = `${BASE}/${AVAILABLE}/${LANGUAGES}?${API}`;
    try {
        const response = await fetch(url);
        const { languages } = await response.json();
        localStorage.setItem('languages', JSON.stringify(languages));
        console.log('get lanuages from api');
        return languages;
    } catch (error) {
        console.error(error.message);
    } finally { console.log('fetch languages list') }
}

// get list of 'regions' from local storage 'if' it exists and return
// else, get list of 'regions' from 'AVAILABLE' endpoint as a fallback
// also, set list of 'regions' in local storage if it does not exist
// return  the list of 'regions'

async function fetchRegions() {
    if (localStorage.getItem('regions')) {
        console.log('get regions from local storage');
        return JSON.parse(localStorage.getItem('regions'));
    }
    const url = `${BASE}/${AVAILABLE}/${REGIONS}?${API}`;
    try {
        const response = await fetch(url);
        const { regions } = await response.json();
        localStorage.setItem('regions', JSON.stringify(regions));
        console.log('get regions from api');
        return regions;
    } catch (error) {
        console.error(error.message);
    } finally { console.log('fetch regions list') }
}

// fetch the 'lists' returned above by fetching using Promise.all
// set up variables and destructure loop through each, append options to select menus
// 'categories' returns an array, 'lanuages' & 'regiones' each return an 'object'
// returned 'objects' are converted to 'arrays' with Object.entries

async function prefetchLists() {
    try {
        const [categories, languages, regions] = await Promise.all([
            fetchCategories(), fetchLanguages(), fetchRegions(),
        ]);

        $('.category-count').text(`Category (${categories.length})`);
        categories.forEach((category) => {
            optionEl = $(`<option value="${category}">${category}</option>`);
            $('#select-category').append(optionEl);
            console.log('prefetch categories');
        });

        const languagesArr = Object.entries(languages);
        $('.language-count').text(`Language (${languagesArr.length})`);
        languagesArr.forEach((language) => {
            const key = language[0];
            const value = language[1];
            optionEl = $(`<option value="${value}">${key}</option>`);
            $('#select-language').append(optionEl);
            console.log('prefetch languages');
        });

        const regionsArr = Object.entries(regions);
        $('.region-count').text(`Region (${regionsArr.length})`);
        regionsArr.forEach((region) => {
            const key = region[0];
            const value = region[1];
            optionEl = $(`<option value="${value}">${key}</option>`);
            $('#select-region').append(optionEl);
            console.log('prefetch regions');
        });
    } catch (error) {
        console.error(error);
    } finally { console.log('prefetch lists for select menus'); }
}
prefetchLists();

// build search strings for 'keyword/date' (KWD) & 'category/language/region' (CLR) search filters
// get values from user input on search form
// use SEARCH endpoint is 'keyword' has input, else use NEWS endpoint

// for 'KWD' set up keyword, start date and end date variables
// for 'CLR' set up 'terms' object and destructure variables, use Object.enties to 'map' params
// note the API references 'regions' as 'country', counter to what would be anticipated

// if 'keywords' are not null then build & the searchStr and pageStr variables from SEARCH endpoint
// else no 'keywords' then build the searchStr and pageStr variables from NEWS endpoint
// searchStr is returned for use in 'submit' handler & pageStr is stored for 'pagination' handlers

function buildSearchString() {
    const keywords = $('#input-keywords').val();
    const KEYS = `${KEYWORDS}=${keywords}`;

    const startDate = $('#date-start').val();
    const endDate = $('#date-end').val();
    const terms = {
        category: $('#select-category').val(),
        language: $('#select-language').val(),
        country: $('#select-region').val(),
    };
    const QUERY = Object.entries(terms).map(function (term) {
            if (term != '') {
                return term.join('=');
            }
        }).join('&');

    if (keywords !== '') {
        searchStr = `${BASE}/${SEARCH}?${API}&${encodeURI(KEYS)}&${START}=${startDate}&${END}=${endDate}&${PAGE}=${pageInt}`;
        pageStr = `${BASE}/${SEARCH}?${API}&${encodeURI(KEYS)}&${START}=${startDate}&${END}=${endDate}&${PAGE}=`;
        console.log('build keyword & date search');
        console.log('keywords = ', keywords);
        console.log('start date = ', startDate);
        console.log('end date = ', endDate);
        return searchStr;
    } else {
        searchStr = `${BASE}/${NEWS}?${API}&${encodeURI(QUERY)}&${PAGE}=${pageInt}`;
        pageStr = `${BASE}/${NEWS}?${API}&${encodeURI(QUERY)}&${PAGE}=`;
        console.log('build terms search');
        console.log('category = ', terms.category);
        console.log('language = ', terms.language);
        console.log('country = ', terms.country);
        return searchStr;
    }
}

// build the HTML for rendering content, takes in param article from updateContent()
// set up 'article' variables and destructure variables from the data
// if 'image' is 'None' do not build the articles, this ensures all returned articles have an 'image'
// use 'map' to build comma separated list of 'tags' that link to a new 'category' search
// note the presence of the 'data-category' which is used in the 'category' search click handlera
// return the 'result' element attach the article .data(), not sure if this .data() gets used later

function renderContent(article) {
    const { title, description, url, author, image, category, published, } = article;

    resultEl = $(`
        ${ image == 'None' ? '' : `<div class="result">
            <div class="tags sans">   
            ${category
                .map(function (tag) {
                    return `<a href="#" class="tag" data-category="${tag}">${tag}</a>`;
                })
                .join(', ')}
            </div>
            <h2 class="title">
                <a target="_blank" href="${url}">${title}</a>
            </h2>
            <div class="byline">
                <span class="date">${published}</span> 
                <span class="separator"> | </span> 
                <span class="author">By ${author}</span>
            </div>
            <div class="image">
                <a target="_blank" href="${image}">
                    <img src="${image}" alt="${title}" />
                </a>
            </div>
            <div class="clear"></div>
            <div class="description">${description}</div>
            <div class="more"><a target="_blank" href="${url}">Continue Reading &raquo;</a></div>
        </div>`
    }`).data('article', article);
    console.log('render the content');
    return resultEl;
}

// takes in params 'status' and 'news' & renders content into the DOM
// 'status' and 'news' params received from bootstrap() or one of the click handlers
// target root of DOM and emplty the contents first
// then loop through each 'news' as 'article' and append to dom with renderContent()
// check the pageInt and update 'disabled' attr for newer post button

function updateContent(status, news) {
    const root = $('#view');
    const results = root.find('#results').empty();
    pageInt >= 2
        ? $('.newer').attr('disabled', false)
        : $('.newer').attr('disabled', true);
    news.forEach(function (article) {
        results.append(renderContent(article));
    });
    console.log('status of request = ', status);
    console.log('update content & append to dom');
}

// execute search via api after user input and button click
// fetch data from buildSearchString, reponse is 'status' and 'news'
// update the DOM by invoking updateContent() with returned data

$('#search').on('submit', async function (event) {
    event.preventDefault();
    try {
        const response = await fetch(buildSearchString());
        const { status, news } = await response.json();
        updateContent(status, news);
        console.log('user clicked search button');
    } catch (error) {
        console.error(error.message);
    } finally {
        $('#search').trigger('reset');
        console.log('search fields reset');
    }
});

// execute pagination for older or newer from button click
// check which button was clicked an increment pageInt '+' or '-' accordingly
// fetch data from paginateUrl build by concaenating  pageStr + pageInt
// reponse is again 'status' and 'news'
// update the DOM by invoking updateContent() with returned data

$('#paginate .older, #paginate .newer').on('click', async function () {
    try {
        target = $(this).attr('class');
        if (target == 'newer') {
            pageInt = Number(pageInt) - 1;
        } else if (target == 'older') {
            pageInt = Number(pageInt) + 1;
        }
        const paginateUrl = pageStr + pageInt;
        const response = await fetch(paginateUrl);
        const { status, news } = await response.json();
        updateContent(status, news);
        console.log('user clicked pagination = ', target);
        console.log('page that was loaded = ', pageInt);
    } catch (error) {
        console.error(error.message);
    } finally { console.log('user requested ', paginateUrl); }

});

// execute catergory search via api after user click on a tag link
// fetch data from tagStr by capturing the 'tag' on user click
// reponse is again 'status' and 'news'
// update the DOM by invoking updateContent() with returned data

$('#app').on('click', '.tag', async function () {
    try {
        TARGET = $(this).attr('data-category');
        const tagStr = `${BASE}/${NEWS}?${API}&${TAG}=${TARGET}&${PAGE}=${pageInt}`;
        const response = await fetch(tagStr);
        const { status, news } = await response.json();
        updateContent(status, news);
        console.log('user clicked category = ', TARGET);
    } catch (error) {
        console.error(error.message);
    } finally { console.log('user requested ', tagStr); }

});

// execute edition search (US or WORLD) via api after user click on a edition link
// fetch data from prefStr by capturing the 'pref' on user click
// reponse is again 'status' and 'news'
// update the DOM by invoking updateContent() with returned data

$('#app').on('click', '.edition', async function () {
    try {
        $('.edition').removeClass('active');
        $(this).toggleClass('active');
        EDITION = $(this).attr('data-pref');
        const prefStr = `${BASE}/${NEWS}?${API}&country=${EDITION}&${PAGE}=${pageInt}`;
        const response = await fetch(prefStr);
        const { status, news } = await response.json();
        updateContent(status, news);
        console.log('user clicked edition = ', EDITION);
    } catch (error) {
        console.error(error.message);
    } finally { console.log('user requested ', prefStr); }
});

// build dynamic date for header and initialize page data
// fetch data from page Str build as a generic all purpose search
// repsonse is again 'status' and 'news'
// update the DOM by invoking updateContent() with returned data


async function bootstrap() {
    const date = new Date().toLocaleString('en-us', {
        month: 'long',
        year: 'numeric',
        day: 'numeric',
    });
    $('#header .date').append(date);
    try {
        pageStr = `${BASE}/${NEWS}?${API}&country=US&${PAGE}=${pageInt}`;
        const response = await fetch(pageStr);
        const { status, news } = await response.json();
        console.log('initial data requested');
        updateContent(status, news);
    } catch (error) {
        console.error(error.message);
    } finally {
        console.log('initial page loaded');
    }
}
bootstrap();
