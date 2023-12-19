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
var recentCities = JSON.parse(localStorage.getItem('recent-cities'));
var degree;
var speed;
if (units !== null) {
    unitButton.text(units);
}
else {
    unitButton.text("Imperial");
}
if (recentCities === null) {
    recentCities = [];
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
    await fetch('https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=a133f5d8da4ea1e2d3d87f7dfc45d032') //Without await, the rest of the code would execute before receiving a response, meaning there would be no data to assign to townArr
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
    else { //Returns nothing if there is no city to search for
        $('#city-name').text("No results found; Try searching for another city.");
        return;
    }
}
async function getWeather(latitude, longitude) { //Gets the geographical coordinates of the city, then calls handleWeatherData
    await fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=' + units + '&appid=91857a7ce4f498927a323c670d50ae2e&cnt40') 
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
    //Adds the city to the recentCities array
    recentCities.push($('#city-name').text());
    localStorage.setItem('recent-cities', JSON.stringify(recentCities));
    manageRecentCities();
    $('#city-name').text($('#city-name').text() + " - " + timeConversion);
    console.log(weatherData);
    $(icon).attr('src', 'https://openweathermap.org/img/w/' + weatherData.list[0].weather[0].icon +'.png')
    icon.classList.add('ms-2');
    $('#city-name').append(icon);
    temp.textContent = "Temperature: " + weatherData.list[0].main.temp_max + '°' + degree;
    $('#weather-data').append(temp);
    humidity.textContent = "Humidity: " + weatherData.list[0].main.humidity + "%";
    $('#weather-data').append(humidity);
    wind.textContent = "Wind Speed: " + weatherData.list[0].wind.speed + speed;
    $('#weather-data').append(wind);
    createForecastCards();
}
const createForecastCards = () => {
    for (var i = 4; i < weatherData.list.length; i+=8) {
            var card = document.createElement("div");
            var innerCard = document.createElement("div");
            var dateForecast = document.createElement('h5');
            var icon2 = document.createElement('img');
            $(icon2).attr('src', 'https://openweathermap.org/img/w/' + weatherData.list[i].weather[0].icon +'.png');
            icon2.classList.add('ms-2');
            dateForecast.textContent = convertToLocalDate(weatherData.list[i].dt, weatherData.city.timezone);
            dateForecast.append(icon2);
            var tempForecast = document.createElement('p');
            tempForecast.textContent = "Temperature: " + weatherData.list[i].main.temp_max + "°" + degree;
            var humidityForecast = document.createElement('p');
            humidityForecast.textContent = "Humidity: " + weatherData.list[i].main.humidity + "%";
            var windForecast = document.createElement("p");
            windForecast.textContent = "Wind: " + weatherData.list[i].wind.speed + speed;
            
            
            card.classList.add("card");
            innerCard.classList.add("card-body", "forecast");
            innerCard.append(dateForecast, tempForecast, humidityForecast, windForecast);
            card.append(innerCard);
            $('#forecast-container').append(card);
        }
}
const manageRecentCities = () => {
    $('#recent-cities').html("");
    if (recentCities.length > 6) {
        recentCities.shift();
    }
    for (var i = recentCities.length - 1; i >= 0; i-- ) {
        const recentCity = document.createElement('li');
        recentCity.classList.add("list-group-item");
        $(recentCity).text(recentCities[i]);
        $(recentCity).on('click', function() {
            recentCities.splice(recentCities.indexOf(recentCity.textContent), 1);
            $('#weather-data').html(originalHtml);
            $('#forecast-container').html(noCards);
            if (units === "Metric") {
                degree = "C";
                speed = " m/s";
            }
            else {
                degree = "F";
                speed = " mph"; //have to copy and paste this here as well so the units will update no matter how the getCoords method is called
            }
            getCoords($(recentCity).text());
        })
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
// const generateRecommendations = async (output) => { (I might implement this later)
//     if (output !== '') {
//         var recommendations = document.createElement('ul');
//     }
// }




manageRecentCities(); // create the recent cities list from localStorage
$('#units').on('click', changeUnits);
$('#button-addon1').on('click', function() {
    $('#weather-data').html(originalHtml);
    $('#forecast-container').html(noCards);
    if (units === "Metric") {
        degree = "C";
        speed = " m/s";
    }
    else {
        degree = "F";
        speed = " mph";
    }
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
