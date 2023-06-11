// ---------- Functions ----------- //

async function getGeoCoordinates(cityName, appId) {
  var limit = 1;
  var coordReqUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    cityName +
    "&limit=" +
    limit +
    "&appid=" +
    appId;

  var response = await fetch(coordReqUrl, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Error: ", response.stats);
  }

  var data = await response.json();
  var geoLocation = {
    lat: data[0].lat,
    long: data[0].lon,
  };
  localStorage.setItem("coordinates", JSON.stringify(geoLocation));
  localStorage.setItem("city-name", cityName);
  return true;
}

function determineDailyMain(array) {
  var numRain = 0;
  var numClouds = 0;
  var numSnow = 0;
  var numExtreme = 0;
  var numClear = 0;

  for (let i = 0; i < array.length; i++) {
    if (array[i] === "Rain") {
      numRain++;
    } else if (array[i] === "Clouds") {
      numClouds++;
    } else if (array[i] === "Snow") {
      numSnow++;
    } else if (array[i] === "Extreme") {
      numExtreme++;
    } else if (array[i] === "Clear") {
      numClear++;
    } else {
      console.log("Error: unknown main weather type");
    }
  }

  var mostCommon = Math.max(numRain, numClouds, numSnow, numExtreme, numClear);
  if (mostCommon === numRain) {
    return "Rain";
  } else if (mostCommon === numClouds) {
    return "Clouds";
  } else if (mostCommon === numSnow) {
    return "Snow";
  } else if (mostCommon === numExtreme) {
    return "Extreme";
  } else if (mostCommon === numClear) {
    return "Clear";
  }
  return;
}

function average(array) {
  var sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum / array.length;
}

function processWeatherData(weatherData, city) {
  var forecast = [
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
      wind: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
      wind: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
      wind: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
      wind: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
      wind: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
      wind: [],
    },
  ];
  var variablesToStore = ["temp", "feels_like", "humidity"];

  var index = 0;
  var currDate = weatherData.list[index].dt_txt.split(" ");

  for (let day = 0; day < 6; day++) {
    forecast[day].date = currDate[0];
    var prevDate = currDate;
    while (currDate[0] === prevDate[0] && index < 40) {
      for (let variable of variablesToStore) {
        forecast[day][variable].push(weatherData.list[index].main[variable]);
      }
      forecast[day].pop.push(weatherData.list[index].pop);
      forecast[day].main.push(weatherData.list[index].weather[0].main);
      forecast[day].wind.push(weatherData.list[index].wind.speed);
      index++;
      if (index === 40) {
        break;
      }
      currDate = weatherData.list[index].dt_txt.split(" ");
    }
    // Average and convert to deg C
    forecast[day].temp = average(forecast[day].temp) - 273.15;
    forecast[day].feels_like = average(forecast[day].feels_like) - 273.15;
    forecast[day].humidity = average(forecast[day].humidity); // percentage
    forecast[day].main = determineDailyMain(forecast[day].main);
    forecast[day].pop = average(forecast[day].pop) * 100; // percentage
    forecast[day].wind = average(forecast[day].wind); // m/s
  }
  localStorage.setItem(city, JSON.stringify(forecast));

  return forecast;
}

function displayWeather(processedData, city) {
  var dayIds = ["current", "day-1", "day-2", "day-3", "day-4", "day-5"];
  var counter = 0;
  var locationEl = document.getElementById("city-name");

  locationEl.innerHTML = city;

  for (let parentId of dayIds) {
    var dateEl = document.getElementById(parentId + "-date");
    var tempEl = document.getElementById(parentId + "-temp");
    var feelsLikeEl = document.getElementById(parentId + "-feels-like");
    var humidityEl = document.getElementById(parentId + "-humidity");
    var popEl = document.getElementById(parentId + "-pop");
    var iconEl = document.getElementById(parentId + "-icon");
    var windEl = document.getElementById(parentId + "-wind");

    feelsLikeEl.setAttribute("style", "font-size: 11pt");

    if (counter === 0) {
      dateEl.innerHTML = "Today";
    } else {
      dateEl.innerHTML = dayjs(processedData[counter].date).format("MMMM D");
    }

    tempEl.innerHTML = Math.round(processedData[counter].temp) + "&deg;C";
    feelsLikeEl.innerHTML =
      "Feels like<br/>" +
      Math.round(processedData[counter].feels_like) +
      "&deg;C";
    humidityEl.innerHTML =
      "Humidity: " + Math.round(processedData[counter].humidity) + "%";
    popEl.innerHTML = "POP: " + Math.round(processedData[counter].pop) + "%";
    iconEl.setAttribute("src", weatherIcons[processedData[counter].main]);
    windEl.innerHTML =
      "Wind Speed: " + Math.round(processedData[counter].wind) + "m/s";

    var parentEl = document.getElementById(parentId);
    if (!processedData[counter].temp) {
      console.log(parentEl);
      parentEl.classList.remove("d-flex");
      parentEl.setAttribute("style", "display: none");
    } else {
      parentEl.classList.add("d-flex");
    }

    counter++;
  }
}

function addSearchHistory() {
  var newBttnEl = document.createElement("button");
  var newLiEl = document.createElement("li");

  newBttnEl.innerHTML = localStorage.getItem("city-name");
  newLiEl.appendChild(newBttnEl);
  searchHistoryUlEl.appendChild(newLiEl);
}

// ----------------------------------------- //

// ------------- Main ------------- //

var searchHistoryUlEl = document.getElementById("search-history");

var ApiKey = "090e889d7a08a33b213911545eb4136f";
var searchInputEl = document.getElementById("search-input");
var searchBttnEl = document.getElementById("search-bttn");
var weatherIcons = {
  Rain: "https://openweathermap.org/img/wn/10d@2x.png",
  Clouds: "https://openweathermap.org/img/wn/04d@2x.png",
  Snow: "https://openweathermap.org/img/wn/13d@2x.png",
  Extreme: "https://openweathermap.org/img/wn/11d@2x.png",
  Clear: "https://openweathermap.org/img/wn/01d@2x.png",
};

var initialCity = "St. John's, Newfoundland";
getGeoCoordinates(initialCity, ApiKey);
initialCityCoordinates = JSON.parse(localStorage.getItem("coordinates"));

var initialReqUrl =
  "https://api.openweathermap.org/data/2.5/forecast?lat=" +
  initialCityCoordinates.lat +
  "&lon=" +
  initialCityCoordinates.long +
  "&appid=" +
  ApiKey;

fetch(initialReqUrl, {
  method: "GET",
})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    var parsedData = processWeatherData(data, initialCity);
    displayWeather(parsedData, initialCity);
  })
  .catch(function (error) {
    console.log(error);
  });

searchBttnEl.addEventListener("click", async function (event) {
  event.preventDefault();
  cityToSearch = searchInputEl.value;

  await getGeoCoordinates(cityToSearch, ApiKey);
  coordinates = JSON.parse(localStorage.getItem("coordinates"));
  addSearchHistory();

  var reqUrl =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
    coordinates.lat +
    "&lon=" +
    coordinates.long +
    "&appid=" +
    ApiKey;

  fetch(reqUrl, {
    method: "GET",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var parsedData = processWeatherData(data, cityToSearch);
      console.log("Data received");
      displayWeather(parsedData, cityToSearch);
    })
    .catch(function (error) {
      console.log(error);
    });
});

searchHistoryUlEl.addEventListener("click", function (event) {
  event.preventDefault();
  cityClicked = event.target.textContent;

  var data = JSON.parse(localStorage.getItem(cityClicked));
  displayWeather(data, cityClicked);
});
