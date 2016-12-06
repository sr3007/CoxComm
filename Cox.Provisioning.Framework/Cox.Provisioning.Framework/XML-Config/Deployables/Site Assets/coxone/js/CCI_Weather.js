$(document).ready(function () {
    var weatherDiv = $('#hourlyweather');
    var nonhourlyweatherDiv = $('#nonhourlyweather');

    var hourlyemployeeDiv = $('#hourlyemployee');
    var nonhourlyemployeeDiv = $('#nonhourlyemployee');
    var flsastatus = "";
    var timereportingstatus = "";
    var CCI_PS_LOCATION = "";
    var CCI_PS_LOCATION_KEY = "";

    // Does this browser support geolocation?
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    }
    else {
        showError("Your browser does not support Geolocation!");
    }

    //On successful retrieval of geo locations.
    function locationSuccess(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        var URI = CCI_Common.GetConfig('AccuweatherGeoPosition') + lat + "," + lon;
        //alert(URI);
        var formData = { 'URI': URI };

        $.ajax({
            url: CCI_Common.GetConfig('AccuweatherRestProxy'),
            data: formData,
            type: "GET",
            crossDomain: true,
            dataType: "json",
            success: function (data) {
                data = JSON.parse(data.Value);
                //console.log(data);
                var city = data.EnglishName;
                var countrycode = data.AdministrativeArea.ID;
                var locationKey = data.Key;
                console.log(data.EnglishName);
                console.log(data.AdministrativeArea.ID);
                console.log(data.Key);
                //alert('Success!' + data.Key); 
                //getForeCast(data.Key);
                getUserProfileProperty("FLSAStatus").then(
                function (jsonObject) {
                    flsastatus = jsonObject.substring(1, jsonObject.length - 1);
                    getUserProfileProperty("TimeReportingStatus").then(
                        function (jsonObject) {
                            timereportingstatus = jsonObject.substring(1, jsonObject.length - 1);

                            var URI = CCI_Common.GetConfig('AccuweatherDailyWeather') + locationKey;
                            //alert(URI);
                            var formData = { 'URI': URI };

                            $.ajax({
                                url: CCI_Common.GetConfig('AccuweatherRestProxy'),
                                data: formData,
                                type: "GET",
                                crossDomain: true,
                                dataType: "json",
                                success: function (data) {
                                    data = JSON.parse(data.Value);
                                    console.log(data);
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
                                    var codes = [];
                                    //if (flsastatus != "Non-Exempt" && timereportingstatus != "Active") {
                                    if (flsastatus != "N" && timereportingstatus != "A") {
                                        for (var i = 0; i < 3; i++) {
                                            var d = new Date(data.DailyForecasts[i].Date);
                                            var datestring = weekday[d.getDay()] + " " + d.format('dd');
                                            var high = data.DailyForecasts[i].Temperature.Maximum.Value;
                                            var low = data.DailyForecasts[i].Temperature.Minimum.Value;
                                            var code = data.DailyForecasts[i].Day.Icon;

                                            var climate = data.DailyForecasts[i].Day.IconPhrase;
                                            //var climate = 'Mostly Cloudy w/ Snow';
                                            //code = 23;
                                            climate = climate.replace(/\//g, '');
                                            var climates = [];
                                            climates[0] = code;
                                            climates[1] = climate;
                                            codes[i] = climates;
                                            //htmlstringcontent += '<div class="tiles tile' + (i+1) + '"><div class="date">' + datestring + '</div><div class="weatherImg"><span><img src="http://l.yimg.com/a/i/us/we/52/' + code + '.gif"></span></div><div class="weaherLower"><span class="weatherDeg">' + high + '<sup clas="upper">o</sup></span><span class="weatherLowerDeg">' + low + '<sup class="lower">o</sup></span></div><div class="weatherType">' + climate + '</div></div>';
                                            htmlstringcontent += '<div class="tiles tile' + (i + 1) + '"><div class="date">' + datestring + '</div><div class="weatherImg"><span id="wx' + (i + 1) + '"></span></div><div class="weaherLower"><span class="weatherDeg">' + high + '<sup clas="upper">o</sup></span><span class="weatherLowerDeg">' + low + '<sup class="lower">o</sup></span></div><div class="weatherType">' + climate + '</div></div>';
                                        }
                                        //Hide time clock for non hourly employee.
                                        //hourlyemployeeDiv.hide();
                                        var imagePath = _spPageContextInfo.siteAbsoluteUrl + '/PublishingImages/AccuweatherIcons/';
                                        nonhourlyweatherDiv.html(htmlstringheader + htmlstringcontent + htmlstringfooter);
                                        $('#wx1').html(
                                            //"<img src='" + imagePath + codes[0][0] + "_" + codes[0][1] + ".png'/>"
                                            "<img src='" + imagePath + codes[0][0] + ".png'/>"
                                        );
                                        $('#wx2').html(
                                            "<img src='" + imagePath + codes[1][0] + ".png'/>"
                                            //"<img src='https://mod174499.sharepoint.com/sites/CoxOne/PublishingImages/AccuweatherIcons/13_Mostly%20Cloudy%20w%20%20Showers.png'/>"
                                        );
                                        $('#wx3').html(
                                            "<img src='" + imagePath + codes[2][0] + ".png'/>"
                                            //"<img src='https://mod174499.sharepoint.com/sites/CoxOne/PublishingImages/AccuweatherIcons/13_Mostly%20Cloudy%20w%20%20Showers.png'/>"
                                        );
                                        /*
                                        $('#wx1').css({
                                            backgroundPosition: '-' + (61 * codes[0]) + 'px 0'
                                        });
                                        $('#wx2').css({
                                            backgroundPosition: '-' + (61 * codes[1]) + 'px 0'
                                        });
                                        $('#wx3').css({
                                            backgroundPosition: '-' + (61 * codes[2]) + 'px 0'
                                        });
                                        */
                                    }
                                    else {
                                        var high = data.DailyForecasts[0].Temperature.Maximum.Value;
                                        var low = data.DailyForecasts[0].Temperature.Minimum.Value;
                                        var code = data.DailyForecasts[0].Day.Icon;
                                        var climate = data.DailyForecasts[0].Day.IconPhrase;
                                        climate = climate.replace(/\//g, '');
                                        var climates = [];
                                        climates[0] = code;
                                        climates[1] = climate;
                                        codes[0] = climates;
                                        //htmlstringcontent += '<div style="font-size: 40px; padding-right: 5px; margin-top: 20px;"><span style="padding-right: 10px;">' + high + '<sup clas="upper">o</sup></span><span><img src="http://l.yimg.com/a/i/us/we/52/' + code + '.gif"></span></div><div style="text-align: center; padding: 0px; margin: 10px 0; ">' + high + '<sup class="lower">o</sup><span style="padding-left: 20px;">' + low + '<sup class="lower">o</sup></span></div><div style="text-align: center; padding: 0px; font-size: 10px;">' + climate + '</div>';
                                        htmlstringcontent += '<div style="font-size: 40px; padding-right: 5px; margin-top: 20px;"><span style="padding-right: 10px;">' + high + '<sup clas="upper">o</sup></span><span id="wxIcon"></span></div><div style="text-align: center; padding: 0px; margin: 10px 0; ">' + high + '<sup class="lower">o</sup><span style="padding-left: 20px;">' + low + '<sup class="lower">o</sup></span></div><div style="text-align: center; padding: 0px; font-size: 10px;">' + climate + '</div>';
                                        nonhourlyemployeeDiv.hide();
                                        weatherDiv.html(htmlstringheader + htmlstringcontent + htmlstringfooter);
                                        /*
                                        $('#wxIcon').css({
                                            backgroundPosition: '-' + (61 * code) + 'px 0'
                                        });
                                        */
                                        var imagePath = _spPageContextInfo.siteAbsoluteUrl + '/PublishingImages/AccuweatherIcons/';
                                        $('#wxIcon').html(
                                            "<img src='" + imagePath + codes[0][0] + ".png'/>"
                                        );
                                    }

                                },
                                //alert('Success!' + data.Value); },
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
            },

        });
    }

    //On location error.
    function locationError(error) {
        switch (error.code) {
            case error.TIMEOUT:
                showError("A timeout occured! Please try again!");
                break;
            case error.POSITION_UNAVAILABLE:
                showError('We can\'t detect your location. Sorry!');
                break;
            case error.PERMISSION_DENIED:
                //alert('Please allow geolocation access for this to work.');
                getUserProfileProperty("CCI-PS-LOCATION").then(
                function (jsonObject) {
                    CCI_PS_LOCATION = jsonObject;
                    //CCI_PS_LOCATION = 'new york, ny';
                    var city = "Atlanta";
                    var countrycode = "US";
                    var locationKey = 348181;

                    if (CCI_PS_LOCATION.indexOf('Error') === -1) {
                        if (CCI_PS_LOCATION.indexOf(',') > -1) {
                            city = CCI_PS_LOCATION.split(',')[0];
                            countrycode = CCI_PS_LOCATION.split(',')[1];
                            var URI = CCI_Common.GetConfig('AccuweatherLocationSearch') + CCI_PS_LOCATION;
                            var formData = { 'URI': URI };
                            $.ajax({
                                url: CCI_Common.GetConfig('AccuweatherRestProxy'),
                                data: formData,
                                type: "GET",
                                crossDomain: true,
                                dataType: "json",
                                success: function (data) {
                                    data = JSON.parse(data.Value);
                                    CCI_PS_LOCATION_KEY = data[0].Key;
                                    renderUserProfileLocation(CCI_PS_LOCATION_KEY, city, countrycode);
                                },
                            });
                        }
                        else
                            renderUserProfileLocation(locationKey, city, countrycode);
                    }
                    else
                        renderUserProfileLocation(locationKey, city, countrycode);
                },
                function (error) {
                    CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, error.get_message());
                });

                break;
            case error.UNKNOWN_ERROR:
                showError('An unknown error occured!');
                break;
        }

    }

    function renderUserProfileLocation(locationKey, city, countrycode) {
        getUserProfileProperty("FLSAStatus").then(
                            function (jsonObject) {
                                flsastatus = jsonObject;
                                getUserProfileProperty("TimeReportingStatus").then(
                                    function (jsonObject) {
                                        timereportingstatus = jsonObject;

                                        //getUserProfileProperty("CCI-PS-LOCATION").then(
                                        //function (jsonObject) {
                                        //CCI_PS_LOCATION = jsonObject;

                                        var URI = CCI_Common.GetConfig('AccuweatherDailyWeather') + locationKey;
                                        //alert(URI);
                                        var formData = { 'URI': URI };

                                        $.ajax({
                                            url: CCI_Common.GetConfig('AccuweatherRestProxy'),
                                            data: formData,
                                            type: "GET",
                                            crossDomain: true,
                                            dataType: "json",
                                            success: function (data) {
                                                data = JSON.parse(data.Value);
                                                console.log(data);
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
                                                var codes = [];
                                                //if (flsastatus != "Non-Exempt" && timereportingstatus != "Active") {
                                                if (flsastatus != "N" && timereportingstatus != "A") {
                                                    for (var i = 0; i < 3; i++) {
                                                        var d = new Date(data.DailyForecasts[i].Date);
                                                        var datestring = weekday[d.getDay()] + " " + d.format('dd');
                                                        var high = data.DailyForecasts[i].Temperature.Maximum.Value;
                                                        var low = data.DailyForecasts[i].Temperature.Minimum.Value;
                                                        var code = data.DailyForecasts[i].Day.Icon;
                                                        //codes[i] = code;
                                                        var climate = data.DailyForecasts[i].Day.IconPhrase;
                                                        climate = climate.replace(/\//g, '');
                                                        var climates = [];
                                                        climates[0] = code;
                                                        climates[1] = climate;
                                                        codes[i] = climates;
                                                        //htmlstringcontent += '<div class="tiles tile' + (i+1) + '"><div class="date">' + datestring + '</div><div class="weatherImg"><span><img src="http://l.yimg.com/a/i/us/we/52/' + code + '.gif"></span></div><div class="weaherLower"><span class="weatherDeg">' + high + '<sup clas="upper">o</sup></span><span class="weatherLowerDeg">' + low + '<sup class="lower">o</sup></span></div><div class="weatherType">' + climate + '</div></div>';
                                                        htmlstringcontent += '<div class="tiles tile' + (i + 1) + '"><div class="date">' + datestring + '</div><div class="weatherImg"><span id="wx' + (i + 1) + '"></span></div><div class="weaherLower"><span class="weatherDeg">' + high + '<sup clas="upper">o</sup></span><span class="weatherLowerDeg">' + low + '<sup class="lower">o</sup></span></div><div class="weatherType">' + climate + '</div></div>';
                                                    }
                                                    //Hide time clock for non hourly employee.
                                                    //hourlyemployeeDiv.hide();
                                                    nonhourlyweatherDiv.html(htmlstringheader + htmlstringcontent + htmlstringfooter);
                                                    var imagePath = _spPageContextInfo.siteAbsoluteUrl + '/PublishingImages/AccuweatherIcons/';
                                                    $('#wx1').html(
                                                        "<img src='" + imagePath + codes[0][0] + ".png'/>"
                                                    );
                                                    $('#wx2').html(
                                                        "<img src='" + imagePath + codes[1][0] + ".png'/>"
                                                        //"<img src='https://mod174499.sharepoint.com/sites/CoxOne/PublishingImages/AccuweatherIcons/13_Mostly%20Cloudy%20w%20%20Showers.png'/>"
                                                    );
                                                    $('#wx3').html(
                                                        "<img src='" + imagePath + codes[2][0] + ".png'/>"
                                                        //"<img src='https://mod174499.sharepoint.com/sites/CoxOne/PublishingImages/AccuweatherIcons/13_Mostly%20Cloudy%20w%20%20Showers.png'/>"
                                                    );
                                                    /*
                                                    $('#wx1').css({
                                                        backgroundPosition: '-' + (61 * codes[0]) + 'px 0'
                                                    });
                                                    $('#wx2').css({
                                                        backgroundPosition: '-' + (61 * codes[1]) + 'px 0'
                                                    });
                                                    $('#wx3').css({
                                                        backgroundPosition: '-' + (61 * codes[2]) + 'px 0'
                                                    });
                                                    */
                                                }
                                                else {
                                                    var high = data.DailyForecasts[0].Temperature.Maximum.Value;
                                                    var low = data.DailyForecasts[0].Temperature.Minimum.Value;
                                                    var code = data.DailyForecasts[0].Day.Icon;
                                                    var climate = data.DailyForecasts[0].Day.IconPhrase;
                                                    climate = climate.replace(/\//g, '');
                                                    var climates = [];
                                                    climates[0] = code;
                                                    climates[1] = climate;
                                                    codes[0] = climates;
                                                    //htmlstringcontent += '<div style="font-size: 40px; padding-right: 5px; margin-top: 20px;"><span style="padding-right: 10px;">' + high + '<sup clas="upper">o</sup></span><span><img src="http://l.yimg.com/a/i/us/we/52/' + code + '.gif"></span></div><div style="text-align: center; padding: 0px; margin: 10px 0; ">' + high + '<sup class="lower">o</sup><span style="padding-left: 20px;">' + low + '<sup class="lower">o</sup></span></div><div style="text-align: center; padding: 0px; font-size: 10px;">' + climate + '</div>';
                                                    htmlstringcontent += '<div style="font-size: 40px; padding-right: 5px; margin-top: 20px;"><span style="padding-right: 10px;">' + high + '<sup clas="upper">o</sup></span><span id="wxIcon"></span></div><div style="text-align: center; padding: 0px; margin: 10px 0; ">' + high + '<sup class="lower">o</sup><span style="padding-left: 20px;">' + low + '<sup class="lower">o</sup></span></div><div style="text-align: center; padding: 0px; font-size: 10px;">' + climate + '</div>';
                                                    nonhourlyemployeeDiv.hide();
                                                    weatherDiv.html(htmlstringheader + htmlstringcontent + htmlstringfooter);
                                                    var imagePath = _spPageContextInfo.siteAbsoluteUrl + '/PublishingImages/AccuweatherIcons/';
                                                    /*
                                                    $('#wxIcon').css({
                                                        backgroundPosition: '-' + (61 * code) + 'px 0'
                                                    });
                                                    */
                                                    $('#wxIcon').html(
                                                        "<img src='" + imagePath + codes[0][0] + ".png'/>"
                                                    );
                                                }

                                            },
                                            //alert('Success!' + data.Value); },
                                        });
                                        //},
                                        //function (error) {
                                        //alert(error.get_message());
                                        //    CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, error.get_message());
                                        //}
                                        //);
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

    //Displays error encountered.
    function showError(msg) {
        weatherDiv.addClass('error').html(msg);
        CCI_Common.LogException(_spPageContextInfo.userId, 'Weather App', _spPageContextInfo.siteAbsoluteUrl, msg);
    }

    //Method to get user profile property of the user.
    function getUserProfileProperty(profileProperty) {
        var userProfileDef = $.Deferred();
        var JSON = CCI_Common.GetUserProfilePropertyValue(profileProperty);
        userProfileDef.resolve(JSON);
        return userProfileDef.promise();
    }

});