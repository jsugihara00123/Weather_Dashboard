const api_Key = "c3a500a055aca5fea66ec4c65cc42fce";

var cityNameInputEl = $('#cityName');
var searchBtnEl = $('#searchBtn');
var cityListEl = $('.cityList');

var cityName = "null";

var citySearchHistory = JSON.parse(localStorage.getItem("citySearchHistory")) || [];




//quering the current locations weather on load but re running it when search is done 

function WeatherData(cityName){
  navigator.geolocation.getCurrentPosition(function (position){
    longitude = position.coords.longitude;
    latitude = position.coords.latitude;

    if(cityName == "null"){
      var queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${api_Key}`;
    }
    
    if(cityName !== "null"){
      var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${api_Key}`;
    }

    $.ajax({
      url: queryURL,
      method: "GET"
    })
  
    //assigining the current location's weather and various values
    .then(function(response) {
      var iconCode = response.weather[0].icon;
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); 
      var yyyy = today.getFullYear();

      today = "(" + mm + '/' + dd + '/' + yyyy + ")";
      
      var iconurl = "http://openweathermap.org/img/w/" + iconCode + ".png";
      $("#currentCity").html(response.name);
      $("#currentDate").html(today);      
      $("#currentTemp").text(Math.round(response.main.temp) + "° F");     
      $("#currentWind").text(response.wind.speed + " MPH");
      $("#currentHumidity").text(response.main.humidity + "%");
      $("#icon").attr("src", iconurl);

      var uviQuery = `https://api.openweathermap.org/data/2.5/uvi/forecast?appid=${api_Key}&lat=${response.coord.lat}&lon=${response.coord.lon}&cnt=1`

      $.ajax({
        url: uviQuery,
        method: "GET"
      })

      // Setting the UV value and assigning it a color for the current location
    .then(function(resp) {
      $("#currentUVIndex").text(resp[0].value);

      console.log(resp[0].value);

      var uviColor = "green";
      
      if(resp[0].value < 3){
        uviColor = "green";
      }
      else if (resp[0].value < 6 && resp[0].value >= 3 ) {
        uviColor = "yellow";
      }
      else if (resp[0].value < 8 && resp[0].value >= 6 ) {
        uviColor = "orange";
      }
      else {
        uviColor = "red";
      }
      $("#currentUVIndex").css("background-color", uviColor);
      })
    })
  })
};


searchBtnEl.click(function (event) {
  event.preventDefault()

  var cityName = cityNameInputEl.val()
  console.log(cityName)

  if (!cityName) {
    alert("No City Search Detected")
  } else {
    WeatherData(cityName)
    var newItem = $(`<li><a></a></li>`)
    newItem.text(cityName)
    cityListEl.append(newItem)

    cityNameInputEl.val('')
    fiveDayForcast(cityName)
  }
  //Create and push object searched to Localstorage
  var cityJSON = {
    cityName: cityName
  }

  citySearchHistory.push(cityJSON)
  localStorage.setItem('citySearchHistory', JSON.stringify(citySearchHistory))
  localStorage.setItem('lastSearchedCity', JSON.stringify(cityName))
})

cityListEl.click(function (event) {
  event.preventDefault();
  elementData = $(event.target).text();
  WeatherData(elementData);
  fiveDayForcast(elementData);

})

function fiveDayForcast (cityName) {
  navigator.geolocation.getCurrentPosition(function (position){
    var longitude2 = position.coords.longitude;
    var latitude2 = position.coords.latitude;
    
    if(cityName == "null"){
      var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude2}&lon=${longitude2}&units=imperial&appid=${api_Key}`;
    }

    if(cityName !== "null"){
      var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=${api_Key}`
    }

    $.ajax({
      url: forecastURL,
      method: "GET"
      })
      .then(function(response) {
        
        var numDays = [6, 14, 22, 30, 38]
        
        for(var i = 0; i < numDays.length; i++){
          var numDaysIndex = numDays[i];

          var newDate = response.list[numDaysIndex].dt;
          var icon = response.list[numDaysIndex].weather[0].icon;
          var temp = response.list[numDaysIndex].main.temp;
          var wind = response.list[numDaysIndex].wind.speed;
          var humidity = response.list[numDaysIndex].main.humidity;
          const num = 10;
          
          $("#day" + (i + 1) + "Date").text(moment.unix(newDate).format("MM/DD/YYYY"));
          $("#day" + (i + 1) + "Icon").attr("src", " http://openweathermap.org/img/wn/" + icon + ".png");
          $("#day" + (i + 1) + "Temp").text(temp + "° F");
          $("#day" + (i + 1) + "Wind").text(wind + " MPH");
          $("#day" + (i + 1) + "Humidity").text(humidity + "%");

          //console.log(response)

        }
      });
  })  
}


WeatherData(cityName);
fiveDayForcast (cityName);
