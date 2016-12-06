var appWP = angular.module('appNotifications', ['ui.bootstrap', 'ngSanitize']);

//Notifications
appWP.controller('ctrlNotifications', function ($scope) {
    
    function GetNotifications(pageTitle) {
        var Notifications = {
            NotificationItem: []
        };
        var counter = 0;
        var deferred = $.Deferred();
        //var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
        var todaysDate = (new Date().getDate() < 10) ? "0" + new Date().getDate() : new Date().getDate();
        var todaysMonth = (new Date().getMonth() + 1 < 10) ? "0" + new Date().getMonth() + 1 : new Date().getMonth() + 1; //Month starts from 0
        var today = new Date().getFullYear() + "-" + todaysMonth + "-" + todaysDate + "T00%3a00%3a00";
        var requestUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/Web/Lists(guid'" + CCI_Common.GetConfig("Notifications GUID") + "')/Items?";
        //requestUri += "$select=Title,CCI_x002d_NotificationBody";
        requestUri += "&$filter=(CCI_x002d_NotificationCategory eq '" + pageTitle + "')";
        requestUri += " and (CCI_x002d_NotificationStartDate le datetime'" + today + "')";
        requestUri += " and (CCI_x002d_NotificationExpiration ge datetime'" + today + "')";
        //$filter=StartDate ge datetime'" + today.toISOString() + "' and ...
        jQuery.ajax({
            url: requestUri,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.d.results.length > 0) {
                    for (var count = 0; count < data.d.results.length; count++) {
                        var title = data.d.results[count].Title;
                        var body = data.d.results[count].CCI_x002d_NotificationBody;
                        GetNotificationImage(data.d.results[count].FieldValuesAsHtml.__deferred.uri, data.d.results[count].Title, data.d.results[count].CCI_x002d_NotificationBody, data.d.results[count].CCI_x002d_Rank).then(function (notification) {
                            //var notification = new NotificationItem(title, body, imageUrl);
                            Notifications.NotificationItem.push(notification);
                            counter++;
                            if (counter == data.d.results.length) {
                                deferred.resolve(Notifications);
                            }
                        });
                    }
                }
                else {
                    deferred.resolve("");
                }
            },
            error: function (jqxr, errorCode, errorThrown) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-Notifications--GetNotifications", _spPageContextInfo.serverRequestPath, jqxr.responseText);
                deferred.reject("error");
            }
        });
        return deferred.promise();
    }

    function GetCurrentPageTitle() {
        var deferred = $.Deferred();

        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Pages')/items(" + _spPageContextInfo.pageItemId + ")";

        jQuery.ajax({
            url: requestUri,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.d.Title != "") {
                    deferred.resolve(data.d.Title);
                }
                else {
                    deferred.resolve("");
                }
            },
            error: function (jqxr, errorCode, errorThrown) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-Notifications--GetCurrentPageTitle", _spPageContextInfo.serverRequestPath, jqxr.responseText);
                deferred.reject("error");
            }
        });
        return deferred.promise();
    }

    function GetNotificationImage(imageUri, title, body, rank) {
        var deferred = $.Deferred();

        jQuery.ajax({
            url: imageUri,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
            },
            success: function (data) {
                if (data.d.CCI_x005f_x002d_x005f_Images != "") {
                    //deferred.resolve(data.d.CCI_x005f_x002d_x005f_Images); jQuery.parseHTML($scope.Notifications[0].Image)[0].src
                    //deferred.resolve(new NotificationItem(title, body, data.d.CCI_x005f_x002d_x005f_Images));
                    deferred.resolve(new NotificationItem(title, body, jQuery.parseHTML(data.d.CCI_x005f_x002d_x005f_Images)[0].src, rank));
                }
                else {
                    deferred.resolve(new NotificationItem(title, body, "", rank));
                }
            },
            error: function (jqxr, errorCode, errorThrown) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-Notifications--GetNotificationImage", _spPageContextInfo.serverRequestPath, jqxr.responseText);
                deferred.reject(new NotificationItem(title, body, "", rank));
            }
        });
        return deferred.promise();
    }

    function GetCategoryValues() {
        var deferred = $.Deferred();

        var requestUri;

        if (CCI_Common.GetConfig("Notifications Category") != "") {
            requestUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/fields('" + CCI_Common.GetConfig("Notifications Category") + "')";
        }
        else {
            requestUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/fields('1c08c6af-5513-4d9b-bbe3-ff74b1481501')"; ///_api/web/fields
        }

        jQuery.ajax({
            url: requestUri,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
            },
            success: function (data) {
                if (typeof (data.d.Choices.results) != "undefined" && data.d.Choices.results.length > 0) {
                    deferred.resolve(data.d.Choices.results);
                }
                else {
                    deferred.resolve("");
                }
            },
            error: function (jqxr, errorCode, errorThrown) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-Notifications--GetCategoryValues", _spPageContextInfo.serverRequestPath, jqxr.responseText);
                deferred.reject("");
            }
        });
        return deferred.promise();
    }

    $scope.getBodyContent = function (existingContent) {
        var body;
        var reg1 = new RegExp("<div class=\"ExternalClass[0-9A-F]+\">[^<]*", "");
        var reg2 = new RegExp("</div>$", "");
        if (existingContent != "" && existingContent != null) {


            body = existingContent.replace(reg1, "").replace(reg2, "");
            if (body.startsWith("<p>") && body.endsWith("</p>")) {
                body = body.replace("<p>", "").replace("</p>", "").replace("<br><br>", "");
            }
            return body;
        }
        else {
            return "";
        }
        //return existingContent.replace(reg1, "").replace(reg2, "");
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.cancel = function () {
        GetCategoryValues().then(function (categoryValues) {
            if (categoryValues != "") {
                for (var count = 0; count < categoryValues.length; count++) {
                    if (categoryValues[count] != "") {
                        if (categoryValues[count].trim().toLowerCase() == $scope.PageTitle.trim().toLowerCase()) {
                            window.sessionStorage.setItem($scope.PageTitle, "hide");
                            if ($scope.PageTitle.trim().toLowerCase() != "home") {
                                $('#CoxOneNotifications').parents('.panel').css('display', 'none');
                            }
                            
                            break;
                        }
                    }
                }
            }
        });
        
        $(".note-image-slider").hide();
    };

    $scope.openNotifications = function () {
        CCI_Common.displayLayover2("Edit_CCINotificationsList");
    };

    //SP.SOD.ExecuteOrDelayUntilScriptLoaded(init, "slides.min.jquery.js");
    //_spBodyOnLoadFunctionNames.push("init");

    init();

    function init() {
        $scope.DisplayNotifications = false;

        CCI_Common.CanIManageLists().then(function (manageLists) {
            $scope.CanIManageLists = manageLists;
        });
        
        GetCurrentPageTitle().then(function (pageTitle) {
            if (pageTitle != "" && pageTitle != "error" && typeof (pageTitle) != "undefined") {
                $scope.PageTitle = pageTitle;
                GetNotifications(pageTitle).then(function (notificationData) {
                    if (notificationData != "" && notificationData != "error" && typeof (notificationData) != "undefined") {
                        if (notificationData.NotificationItem.length > 0) {
                            if (window.sessionStorage.getItem($scope.PageTitle) == "hide") {
                                if ($scope.PageTitle.trim().toLowerCase() != "home") {
                                    $('#CoxOneNotifications').parents('.panel').css('display', 'none');
                                }
                            }
                            else {
                                $scope.safeApply(function () {
                                    $scope.ImgGearUrl = _spPageContextInfo.siteAbsoluteUrl + "/Style Library/coxone/images/preferences Gear.png";
                                    $scope.NotificationsCount = notificationData.NotificationItem.length;
                                    $scope.DisplayNotifications = true;
                                    $scope.Notifications = notificationData.NotificationItem;
                                    $scope.currentItem = 1;
                                });
                                loadSlider();
                            }
                        }
                    }
                });
            }
        });
    }

    function loadSlider() {
        $("#note-image-slider").slides({
            preload: true,
            preloadImage: 1,
            play: 0,
            pause: 0,
            hoverPause: true,
            animationStart: function (current) {
                $('.caption').animate({
                    bottom: -35
                }, 100);
            },
            animationComplete: function (current) {
                $scope.safeApply(function () {
                    $scope.currentItem = current;
                });

                $('.caption').animate({
                    bottom: 0
                }, 200);
            },
            slidesLoaded: function () {
                $('.caption').animate({
                    bottom: 0
                }, 200);
            }
        });
        $('.caption').hover(
            function () {
                $('.caption').animate({
                    height: $('.caption').height($('.caption').height() + 50)
                }, 200);
            },
            function () {
                $('.caption').animate({
                    height: $('.caption').height($('.caption').height() - 50)
                }, 200);
            });

        $(".note-image-slider").slides({
            preload: true,
            preloadImage: 1,
            play: 0,
            pause: 0,
            hoverPause: true,
            animationStart: function (current) {
                $('.caption').animate({
                    bottom: -35
                }, 100);
            },
            animationComplete: function (current) {
                $scope.safeApply(function () {
                    $scope.currentItem = current;
                });

                $('.caption').animate({
                    bottom: 0
                }, 200);
            },
            slidesLoaded: function () {
                $('.caption').animate({
                    bottom: 0
                }, 200);
            }
        });
        $('.caption').hover(
            function () {
                $('.caption').animate({
                    height: $('.caption').height($('.caption').height() + 50)
                }, 200);
            },
            function () {
                $('.caption').animate({
                    height: $('.caption').height($('.caption').height() - 50)
                }, 200);
            });
    }

    //To build JSON
    function NotificationItem(title, body, image, rank) {
        this.Title = title;
        this.Body = body;
        this.Image = image;
        this.Rank = rank;
    }
});

//angular.bootstrap(document.getElementById("CoxOneNotifications"), ['appNotifications']);

