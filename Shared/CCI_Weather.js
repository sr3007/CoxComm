$(document).ready(function(){
    var weatherDiv = $('#hourlyweather');
    var nonhourlyweatherDiv = $('#nonhourlyweather');

    var hourlyemployeeDiv = $('#hourlyemployee');
    var nonhourlyemployeeDiv = $('#nonhourlyemployee');
    

    // Does this browser support geolocation?
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    }
    else{
        showError("Your browser does not support Geolocation!");
    }

    //On successful retrieval of geo locations.
    function locationSuccess(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        getUserProfileProperty("FLSAStatus").then(
                function (jsonObject) {
                    var flsastatus = jsonObject.substring(1, jsonObject.length - 1);
                    getUserProfileProperty("TimeReportingStatus").then(
                        function (jsonObject) {
                            var timereportingstatus = jsonObject.substring(1, jsonObject.length - 1);

                            var GEOCODING = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + '%2C' + lon + '&language=en';

                            $.ajax({
                                type: "GET",
                                url: GEOCODING,
                                headers: {
                                    "Accept": "application/json; odata=verbose"
                                },
                                success: function (data) {
                                    var city = data.results[0]["address_components"][1]["short_name"];
                                    var countrycode = data.results[0]["address_components"][4]["short_name"];
                                    $.ajax({
                                        type: "GET",
                                        url: "https://query.yahooapis.com/v1/public/yql?q=select item from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + city + "," + countrycode + "')&format=json",
                                        headers: {
                                            "Accept": "application/json; odata=verbose"
                                        },
                                        success: function (data) {
                                            var weekday = new Array(7);
                                            weekday[0] = "Sun";
                                            weekday[1] = "Mon";
                                            weekday[2] = "Tue";
                                            weekday[3] = "Wed";
                                            weekday[4] = "Thu";
                                            weekday[5] = "Fri";
                                            weekday[6] = "Sat";

                                            var htmlstringheader = '<div class="row custom_space"><div class="col-sm-12 box_warp"><div class=""><div class="box_accordian"><div id="weather" style=" color : #fff; padding: 5px;"><div  style="background: #002F5D; overflow: hidden; width: 100%;height: 150px;"><div style="text-align: center"><div class="location">' + city + ', ' + countrycode + '</div>';
                                            var htmlstringfooter = '</div></div></div></div></div></div></div>';
                                            var htmlstringcontent = '';

                                            if (flsastatus != "Non-Exempt" && timereportingstatus != "Active") {
                                                //var htmlstring = "<div><ul><li>" + city + ", " + countrycode + "</li></ul>";
                                                var codes = [];
                                                for (var i = 0; i < 3; i++) {
                                                    var d = new Date(data.query.results.channel.item.forecast[i]["date"]);
                                                    var datestring = weekday[d.getDay()] + " " + d.format('dd');
                                                    var high = data.query.results.channel.item.forecast[i]["high"];
                                                    var low = data.query.results.channel.item.forecast[i]["low"];
                                                    var code = data.query.results.channel.item.forecast[i]["code"];
                                                    codes[i] = code;
                                                    var climate = data.query.results.channel.item.forecast[i].text;
                                                    //htmlstringcontent += '<div class="tiles tile' + (i+1) + '"><div class="date">' + datestring + '</div><div class="weatherImg"><span><img src="http://l.yimg.com/a/i/us/we/52/' + code + '.gif"></span></div><div class="weaherLower"><span class="weatherDeg">' + high + '<sup clas="upper">o</sup></span><span class="weatherLowerDeg">' + low + '<sup class="lower">o</sup></span></div><div class="weatherType">' + climate + '</div></div>';
                                                    htmlstringcontent += '<div class="tiles tile' + (i+1) + '"><div class="date">' + datestring + '</div><div class="weatherImg"><span id="wx' + (i+1) + '"></span></div><div class="weaherLower"><span class="weatherDeg">' + high + '<sup clas="upper">o</sup></span><span class="weatherLowerDeg">' + low + '<sup class="lower">o</sup></span></div><div class="weatherType">' + climate + '</div></div>';
                                                }
                                                //Hide time clock for non hourly employee.
                                                //hourlyemployeeDiv.hide();
                                                nonhourlyweatherDiv.html(htmlstringheader + htmlstringcontent + htmlstringfooter);
                                                $('#wx1').css({
                                                    backgroundPosition: '-' + (61 * codes[0]) + 'px 0'
                                                });
                                                $('#wx2').css({
                                                    backgroundPosition: '-' + (61 * codes[1]) + 'px 0'
                                                });
                                                $('#wx3').css({
                                                    backgroundPosition: '-' + (61 * codes[2]) + 'px 0'
                                                });
                                            }
                                            else {
                                                var high = data.query.results.channel.item.forecast[0]["high"];
                                                var low = data.query.results.channel.item.forecast[0]["low"];
                                                var code = data.query.results.channel.item.forecast[0]["code"];
                                                var climate = data.query.results.channel.item.forecast[0].text;
                                                //htmlstringcontent += '<div style="font-size: 40px; padding-right: 5px; margin-top: 20px;"><span style="padding-right: 10px;">' + high + '<sup clas="upper">o</sup></span><span><img src="http://l.yimg.com/a/i/us/we/52/' + code + '.gif"></span></div><div style="text-align: center; padding: 0px; margin: 10px 0; ">' + high + '<sup class="lower">o</sup><span style="padding-left: 20px;">' + low + '<sup class="lower">o</sup></span></div><div style="text-align: center; padding: 0px; font-size: 10px;">' + climate + '</div>';
                                                htmlstringcontent += '<div style="font-size: 40px; padding-right: 5px; margin-top: 20px;"><span style="padding-right: 10px;">' + high + '<sup clas="upper">o</sup></span><span id="wxIcon"></span></div><div style="text-align: center; padding: 0px; margin: 10px 0; ">' + high + '<sup class="lower">o</sup><span style="padding-left: 20px;">' + low + '<sup class="lower">o</sup></span></div><div style="text-align: center; padding: 0px; font-size: 10px;">' + climate + '</div>';
                                                nonhourlyemployeeDiv.hide();
                                                weatherDiv.html(htmlstringheader + htmlstringcontent + htmlstringfooter);
                                                $('#wxIcon').css({
                                                    backgroundPosition: '-' + (61 * code) + 'px 0'
                                                });
                                            }
                                        },
                                        error: function (data, errorCode, errorMessage) {
                                            //alert(errorMessage);
                                            CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, errorMessage);
                                        }
                                    });
                                },
                                error: function (data, errorCode, errorMessage) {
                                    //alert(errorMessage);
                                    CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, errorMessage);
                                }
                            });

                        },
                        function (error) {
                            //alert(error.get_message());
                            CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, error.get_message());
                        }
                    );
                },
                function (error) {
                    //alert(error.get_message());
                    CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, error.get_message());
                }
        );
    }

    //On location error.
    function locationError(error){
        switch(error.code) {
            case error.TIMEOUT:
                showError("A timeout occured! Please try again!");
                break;
            case error.POSITION_UNAVAILABLE:
                showError('We can\'t detect your location. Sorry!');
                break;
            case error.PERMISSION_DENIED:
                showError('Please allow geolocation access for this to work.');
                break;
            case error.UNKNOWN_ERROR:
                showError('An unknown error occured!');
                break;
        }

    }

    //Displays error encountered.
    function showError(msg){
        weatherDiv.addClass('error').html(msg);
        CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, msg);
    }

    //Method to get user profile property of the user.
    function getUserProfileProperty(profileProperty) {
        var userProfileDef = $.Deferred();
        var JSON = getUserProfilePropertyValue(profileProperty);
        userProfileDef.resolve(JSON);
        return userProfileDef.promise();
    }

}); 