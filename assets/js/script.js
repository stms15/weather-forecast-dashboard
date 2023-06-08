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

// ----------------------- //

var ApiKey = "090e889d7a08a33b213911545eb4136f";
var searchInputEl = document.getElementById("city-name");
var searchBttnEl = document.getElementById("search-bttn");

searchBttnEl.addEventListener("click", function (event) {
  event.preventDefault();
  cityToSearch = searchInputEl.value;

  getGeoCoordinates(cityToSearch, ApiKey);
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
      console.log(data);
    })
    .catch(function (error) {
      console.log(error);
    });
});
