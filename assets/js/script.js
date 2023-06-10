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

function processWeatherData(weatherData) {
  var forecast = [
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
    },
    {
      date: "",
      temp: [],
      feels_like: [],
      humidity: [],
      main: [],
      pop: [],
    },
  ];
  var variablesToStore = ["temp", "feels_like", "humidity"];

  var index = 0;
  var currDate = weatherData.list[index].dt_txt.split(" ");

  for (let day = 0; day < 5; day++) {
    forecast[day].date = currDate[0];
    var prevDate = currDate;
    while (currDate[0] === prevDate[0]) {
      for (let variable of variablesToStore) {
        forecast[day][variable].push(weatherData.list[index].main[variable]);
      }
      forecast[day].pop.push(weatherData.list[index].pop);
      forecast[day].main.push(weatherData.list[index].weather[0].main);
      index++;
      currDate = weatherData.list[index].dt_txt.split(" ");
    }
    // Average and convert to deg C
    forecast[day].temp = average(forecast[day].temp) - 273.15;
    forecast[day].feels_like = average(forecast[day].feels_like) - 273.15;
    forecast[day].humidity = average(forecast[day].humidity); // percentage
    forecast[day].main = determineDailyMain(forecast[day].main);
    forecast[day].pop = average(forecast[day].pop) * 100; // percentage
  }
}

// ----------------------------------------- //

var ApiKey = "090e889d7a08a33b213911545eb4136f";
var searchInputEl = document.getElementById("city-name");
var searchBttnEl = document.getElementById("search-bttn");

searchBttnEl.addEventListener("click", async function (event) {
  event.preventDefault();
  cityToSearch = searchInputEl.value;

  await getGeoCoordinates(cityToSearch, ApiKey);
  coordinates = JSON.parse(localStorage.getItem("coordinates"));

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
      console.log("Data received");
    })
    .catch(function (error) {
      console.log(error);
    });
});
