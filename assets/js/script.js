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
  var geoLocation = {
    lat: "",
    long: "",
  };

  fetch(coordReqUrl, {
    method: "GET",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      geoLocation.lat = data[0].lat;
      geoLocation.long = data[0].lon;
    })
    .catch(function (error) {
      console.log(error);
    });

  return geoLocation;
}

// ----------------------- //

var ApiKey = "090e889d7a08a33b213911545eb4136f";
var reqUrl =
  "https://api.openweathermap.org/data/2.5/forecast?lat=47&lon=58&appid=";

var coordinates = getGeoCoordinates("St. John's", ApiKey);
console.log(coordinates);
