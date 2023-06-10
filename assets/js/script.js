// ------ Functions ------ //

function getGeoCoordinates(cityName, appId) {
  var limit = 1;
  var coordReqUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    cityName +
    "&limit=" +
    limit +
    "&appid=" +
    appId;

  fetch(coordReqUrl, {
    method: "GET",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var geoLocation = {
        lat: data[0].lat,
        long: data[0].lon,
      };
      localStorage.setItem("coordinates", JSON.stringify(geoLocation));
    })
    .catch(function (error) {
      console.log(error);
    });
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

function processWeatherData(weatherData) {
  var forecast = [
    {
      temp: 0,
      temp_min: 0,
      temp_max: 0,
      humidity: 0,
      main: [],
      pop: 0,
    },
    {
      temp: 0,
      temp_min: 0,
      temp_max: 0,
      humidity: 0,
      main: [],
      pop: 0,
    },
    {
      temp: 0,
      temp_min: 0,
      temp_max: 0,
      humidity: 0,
      main: [],
      pop: 0,
    },
    {
      temp: 0,
      temp_min: 0,
      temp_max: 0,
      humidity: 0,
      main: [],
      pop: 0,
    },
    {
      temp: 0,
      temp_min: 0,
      temp_max: 0,
      humidity: 0,
      main: [],
      pop: 0,
    },
  ];
  var variablesToStore = ["temp", "temp_min", "temp_max", "humidity"];

  for (let day = 0; day < 5; day++) {
    for (let i = 0; i < 8; i++) {
      var index = i + day * 8;
      for (let variable of variablesToStore) {
        forecast[day][variable] += weatherData.list[index].main[variable];
      }
      forecast[day].pop += weatherData.list[index].pop;
      forecast[day].main.push(weatherData.list[index].weather[0].main);
    }
    // Average and convert to deg C
    forecast[day].temp = forecast[day].temp / 8 - 273.15;
    forecast[day].temp_min = forecast[day].temp_min / 8 - 273.15;
    forecast[day].temp_max = forecast[day].temp_max / 8 - 273.15;
    forecast[day].humidity = forecast[day].humidity / 8; // percentage
    forecast[day].main = determineDailyMain(forecast[day].main);
    forecast[day].pop = (forecast[day].pop / 8) * 100; // percentage
  }

  console.log(forecast);
}

// ----------------------- //

var ApiKey = "090e889d7a08a33b213911545eb4136f";
var searchInputEl = document.getElementById("city-name");
var searchBttnEl = document.getElementById("search-bttn");

searchBttnEl.addEventListener("click", function (event) {
  event.preventDefault();
  cityToSearch = searchInputEl.value;

  getGeoCoordinates(cityToSearch, ApiKey);
  coordinates = JSON.parse(localStorage.getItem("coordinates"));
  console.log(coordinates);

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
      processWeatherData(data);
      console.log(data.list);
    })
    .catch(function (error) {
      console.log(error);
    });
});

// NOTE: this is working for cases when the first input is 03:00:00 of day 1. This does not account for requesting the weather in the middle of the day and getting the first input for later than 03:00:00.
