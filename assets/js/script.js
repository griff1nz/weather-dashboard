// Initialize Variables
var units = localStorage.getItem("units");

var townName;
var lat;
var lon;
var townArr;
var weatherData;
var unitButton = $('#units');
var temp = document.createElement('p');
var humidity = document.createElement('p');
var wind = document.createElement('p');
var icon = document.createElement('img');
var originalHtml = $('#weather-data').html();
var noCards = $('#forecast-container').html();
var recentCities = [];
if (units !== null) {
    unitButton.text(units);
}
else {
    unitButton.text("Imperial");
}
// Functions
const changeUnits = () => {
    if ($('#units').text() !== 'Metric') {
        units = "Metric";
    }
    else {
        units = "Imperial";
    }
    $('#units').text(units);
    localStorage.setItem("units", units); //Remembers the previously used unit format
};
const getCoords = async (city) => {
    // city = city.replaceAll(" ", "");
    await fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=a133f5d8da4ea1e2d3d87f7dfc45d032') //Without await, the rest of the code would execute before receiving a response, meaning there would be no data to assign to townArr
    .then(function (response) {
        return(response.json());
    })
    .then(function (data) {
        townArr = data;
    });
    if (townArr.length !== 0) {
        // console.log(townArr);
        lat = townArr[0].lat;
        lon = townArr[0].lon;
        getWeather(lat, lon);
    }
    else {
        $('#city-name').text("No results found; Try searching for another city.");
        return;
    }
}
async function getWeather(latitude, longitude) {
    await fetch('http://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=' + units + '&appid=91857a7ce4f498927a323c670d50ae2e&cnt40') 
    .then(function (response) {
        return(response.json());
    })
    .then(function (data) {
        weatherData = data;
        handleWeatherData();
    });
}
const handleWeatherData = () => {
    var timeConversion = (convertToLocalDate(weatherData.list[0].dt, weatherData.city.timezone));
    if (townArr[0].state) {
        $('#city-name').text(weatherData.city.name + ", " + townArr[0].state + ", " + weatherData.city.country);
    }
    else { 
        $('#city-name').text(weatherData.city.name + ", " + weatherData.city.country);
    }
    recentCities.push($('#city-name').text());
    manageRecentCities();
    $('#city-name').text($('#city-name').text() + " " + timeConversion);
    console.log(weatherData);
    $(icon).attr('src', 'http://openweathermap.org/img/w/' + weatherData.list[0].weather[0].icon +'.png')
    icon.classList.add('ms-2');
    $('#city-name').append(icon);
    temp.textContent = "Temperature: " + weatherData.list[0].main.temp_max + '°';
    $('#weather-data').append(temp);
    humidity.textContent = "Humidity: " + weatherData.list[0].main.humidity + "%";
    $('#weather-data').append(humidity);
    wind.textContent = "Wind Speed: " + weatherData.list[0].wind.speed;
    $('#weather-data').append(wind);
    if (units === "Metric") {
        temp.textContent += "C";
        wind.textContent += " m/s";
    }
    else {
        temp.textContent += "F";
        wind.textContent += " mph";
    }
    createForecastCards();
}
const createForecastCards = () => {
    for (var i = 4; i < weatherData.list.length; i+=8) {
            console.log('lmao');
            var card = document.createElement("div");
            var innerCard = document.createElement("div");
            card.classList.add("card");
            innerCard.classList.add("card-body", "forecast");
            card.append(innerCard);
            $('#forecast-container').append(card);
        }
}
const manageRecentCities = () => {
    $('#recent-cities').html("");
    if (recentCities.length > 6) {
        recentCities.pop();
    }
    for (var i = recentCities.length - 1; i >= 0; i-- ) {
        var recentCity = document.createElement('li');
        recentCity.classList.add("list-group-item", "mb-1", "mt-1");
        $(recentCity).text(recentCities[i]);
        $('#recent-cities').append(recentCity);
    }
}
function convertToLocalDate(date, localTime) {
    var theDate = new Date((date + localTime) * 1000);
    var hours = localTime/3600;
    if (hours >= 0) {
        hours = "+" + hours;
    }
    return(theDate.toUTCString() + (hours));  //https://www.epochconverter.com/programming/#javascript
}
// const generateRecommendations = async (output) => { (I might implement this when done but chances are it will create 69696969 API calls per minute)
//     if (output !== '') {
//         var recommendations = document.createElement('ul');
//     }
// }





$('#units').on('click', changeUnits);
$('#button-addon1').on('click', function() {
    $('#weather-data').html(originalHtml);
    $('#forecast-container').html(noCards);
    if ($('#city-search').val() !== "") {
        getCoords($('#city-search').val());
    }
    else {
        getCoords($('#city-search').attr('placeholder'));
    }
})
// $('#city-search').on('input propertychange', function() {
//     generateRecommendations($('#city-search').val());
// });//https://stackoverflow.com/questions/8747439/detecting-value-change-of-inputtype-text-in-jquery
