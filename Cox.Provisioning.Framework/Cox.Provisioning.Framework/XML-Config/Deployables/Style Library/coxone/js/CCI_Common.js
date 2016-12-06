
//Updates 'Logs' list wit exception details
var CCI_Common = {
    LogException: function (userId, appName, pageUrl, exMessage) {
        var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Logs')/items"
        jQuery.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify({
                '__metadata': { 'type': 'SP.Data.LogsListItem' },
                'UserID': userId,
                'AppName': appName,
                'PageUrl': pageUrl,
                'Exception': exMessage
            }),
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (d) { console.log("Updated Logs"); },
            error: function (error) { console.log("Failed to log - " + JSON.stringify(error)); }
        });
    },

    configValue: null,

    //Get 'Value' from Config list
    GetConfig_Old: function (configKey) {
        var configListUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Config')/items?";
        configListUri += "$select=Value";
        configListUri += "&$filter=Key eq '" + configKey + "'";
        jQuery.ajax({
            url: configListUri,
            type: "GET",
            async: false,
            contentType: "application/json;odata=nometadata",
            headers: {
                "Accept": "application/json;odata=nometadata"
            },
            success: function (data) {
                if (data.value.length == 1) {
                    if (typeof (data.value[0].Value) !== "undefined") {
                        CCI_Common.configValue = data.value[0].Value;
                    }
                    else {
                        CCI_Common.configValue = "";
                    }
                }
                else {
                    CCI_Common.configValue = "";
                }
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetConfig", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                CCI_Common.configValue = "";
            }
        });
        if (CCI_Common.configValue != null) {
            return CCI_Common.configValue;
        }
        else {
            return "";
        }
    },

    //Get 'Value' from Config list
    GetConfig: function (configKey) {
        if (window.sessionStorage.getItem("ConfigData") != null && typeof(window.sessionStorage.getItem("ConfigData")) != "undefined" && window.sessionStorage.getItem("ConfigData") != "undefined") {
            var configData = [];
            configData = JSON.parse(window.sessionStorage.getItem("ConfigData"));
            if (configData.length > 0) {
                for (var count = 0; count < configData.length; count++) {
                    if (configData[count].Key === configKey) {
                        return configData[count].Value;
                        break;
                    }
                }
            }
            return "";
        }
        else {
            CCI_Common.GetConfigUsingREST().then(
                function (configData) {
                    if (typeof (Storage) !== "undefined") {
                        //Browser supports Local Storage
                        window.sessionStorage.setItem("ConfigData", JSON.stringify(configData.value));;
                    }
                });
            if (window.sessionStorage.getItem("ConfigData") != null && typeof (window.sessionStorage.getItem("ConfigData")) != "undefined" && window.sessionStorage.getItem("ConfigData") != "undefined") {
                var configData = [];
                configData = JSON.parse(window.sessionStorage.getItem("ConfigData"));
                if (configData.length > 0) {
                    for (var count = 0; count < configData.length; count++) {
                        if (configData[count].Key === configKey) {
                            return configData[count].Value;
                            break;
                        }
                    }
                }
                return "";
            }
            else {
                return "";
            }
        }
    },

    //Get Config list values
    GetConfigUsingREST: function () {
        var deferred = $.Deferred();

        var configListUri = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Config')/items?";
        configListUri += "$select=Key,Value";
        //configListUri += "&$filter=Key eq '" + configKey + "'";
        jQuery.ajax({
            url: configListUri,
            type: "GET",
            async: false,
            contentType: "application/json;odata=nometadata",
            headers: {
                "Accept": "application/json;odata=nometadata"
            },
            success: function (data) {
                if (data.value.length >= 1) {
                    deferred.resolve(data);
                }
                else {
                    deferred.resolve("");
                }
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetConfig", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                deferred.reject(error);
            }
        });
        return deferred.promise();
    },
    //****** START Preferences**************
    preferenceList: "NewsPreference",
    checkPreferenceAvailable: false,
    preSelectedPreferences: null,

    GetPreferences: function () {
        if (typeof (Storage) !== "undefined") {
            if (localStorage.getItem("NewsPreferenceCache") != null) {
                var result = localStorage.getItem("NewsPreferenceCache");
                return result;
            }
            else { //Fetch from list and set Cache
                CCI_Common.GetUserPreferencesFromList();
                if (localStorage.getItem("NewsPreferenceCache") != null) {
                    return localStorage.getItem("NewsPreferenceCache");
                }
            }
        }
    },

    SetToCache: function (itemName, value) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem(itemName, value);
        }
    },

    GetUserPreferencesFromList: function () {
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('" + CCI_Common.preferenceList + "')/Items?";
        requestUri += "$select=ID,Title,Departments,Companies,COE,Division,Industry,Locations";
        requestUri += "&$filter=UserID eq " + _spPageContextInfo.userId;
        var requestHeaders = { "accept": "application/json;odata=verbose" };
        $.ajax({
            url: requestUri,
            contentType: "application/json;odata=verbose",
            headers: requestHeaders,
            success: CCI_Common.onGetPreferencesSuccess,
            error: CCI_Common.onGetAdminError
        });
    },
    onGetPreferencesSuccess: function (data, request) {
        CCI_Common.checkPreferenceAvailable = true;
        var i, listSelectionData, userPreferenceItem;
        var items = data.d.results;
        CCI_Common.preSelectedPreferences = [];
        for (i = 0; i < items.length; i++) {
            userPreferenceItem = items[i];
            listSelectionData = { ID: userPreferenceItem.ID, Title: userPreferenceItem.Title, Company: userPreferenceItem.Companies, Department: userPreferenceItem.Departments, COE: userPreferenceItem.COE, Division: userPreferenceItem.Division, Location: userPreferenceItem.Locations, Industry: userPreferenceItem.Industry };
            CCI_Common.preSelectedPreferences.push(listSelectionData);
        }
        CCI_Common.SetToCache("NewsPreferenceCache", CCI_Common.preSelectedPreferences)
    },
    onGetAdminError: function (error) {
        console.log(JSON.stringify(error));
        CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetUserPreferencesFromList", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
    },
    CreateJsonString: function (name, array) {
        var jsonObj = [];
        for (var i = 0; i <= array.length - 1; i++) {
            item = {}
            item["Item"] = array[i];

            jsonObj.push(item);
        }
        return name + ":" + JSON.stringify(jsonObj);
        console.log(jsonObj);
    },
    //****** END Preferences**************


    //********START Persona****************
    currentUserProfile: null,
    otherUserProfile: null,
    propertiesData: null,
    userFirstName: null,

    GetUserProfilePropertyValue: function (profileProperty) {
        CCI_Common.currentUserProfile = CCI_Common.GetUserProfileFromLocalCache();
        if (CCI_Common.currentUserProfile != null) {
            if (typeof (CCI_Common.currentUserProfile[profileProperty]) !== 'undefined') {
                return CCI_Common.currentUserProfile[profileProperty];
            }
            else {
                return "Error: User Profile property '" + profileProperty + "' may not be available or not populated. Clear browser cache and try again";
            }
        }
        else { //Fetch from User Profile, populate cache and return profile property value
            //Fetch from User Profile
            CCI_Common.GetUserDataUsingREST().then(
                function (userData) {
                    var myProfile = {};
                    //Loop through all user profile properties
                    for (var count = 0; count < Object.keys(userData).length; count++) {
                        if (Object.keys(userData)[count] == "UserProfileProperties") {
                            var fullUserProperties = userData["UserProfileProperties"]; //User Profile Properties are available in this object
                            if (fullUserProperties != null && fullUserProperties.length > 0) {
                                //All user profile properties saves as individual object with Key/Value pairs
                                for (var profileCount = 0; profileCount < fullUserProperties.length; profileCount++) {
                                    switch (JSON.stringify(fullUserProperties[profileCount]["Key"])) {
                                        case "\"AccountName\"":
                                            myProfile["AccountName"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"FirstName\"":
                                            myProfile["FirstName"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"AboutMe\"":
                                            myProfile["AboutMe"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-Dept\"":
                                            myProfile["CCI-Dept"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-BUSINESS-UNIT\"":
                                            myProfile["BusinessUnit"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-TCDEPARTMENT\"":
                                            myProfile["Department"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-FLSA-STATUS\"":
                                        case "\"FLSAStatus\"":
                                            myProfile["FLSAStatus"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-JOBCODE\"":
                                            myProfile["JobCode"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-TCLocation\"":
                                            myProfile["Location"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-REG-TEMP\"":
                                            myProfile["Regular/Temp"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-TIME-RPTG-STATUS\"":
                                        case "\"TimeReportingStatus\"":
                                            myProfile["TimeReportingStatus"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                        case "\"CCI-PS-EMPLID\"":
                                            myProfile["CCI-PS-EMPLID"] = fullUserProperties[profileCount]["Value"]
                                            break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    var jsonVar = JSON.stringify(myProfile); //Converting object to String
                    if (typeof (Storage) !== "undefined") {
                        //Browser supports Local Storage
                        window.sessionStorage.setItem("userProfileData", jsonVar);;
                    }
                });
            CCI_Common.currentUserProfile = CCI_Common.GetUserProfileFromLocalCache();
            if (CCI_Common.currentUserProfile != null) {
                if (typeof (CCI_Common.currentUserProfile[profileProperty]) !== 'undefined') {
                    return CCI_Common.currentUserProfile[profileProperty];
                }
                else {
                    return "Error: User Profile property '" + profileProperty + "' may not be available or not populated. Clear browser cache and try again";
                }
            }
        }
    },

    GetUserProfileFromLocalCache: function () {
        return JSON.parse(sessionStorage.getItem("userProfileData"));
    },

    GetUserDataUsingREST: function () {
        var deferred = $.Deferred();

        var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
        jQuery.ajax({
            url: url,
            type: "GET",
            async: false,
            contentType: "application/json;odata=nometadata",
            headers: {
                "Accept": "application/json;odata=nometadata",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                if (data != "" && data != null && Object.keys(data).length > 0) {
                    deferred.resolve(data);
                }
                else {
                    deferred.resolve("");
                }
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetConfig", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                deferred.reject(error);
            }
            //success: CCI_Common.onGetUserProfileSuccess,
            //error: CCI_Common.onGetUserProfileError
        });
        return deferred.promise();
    },

    //To get Other User profile propery value from User Profile - Pass EmailID of the user
    GetOtherUserProfilePropertyValue: function (profileProperty, emailID) {
        /*if (typeof (CCI_Common.otherUserProfile) != "undefined" && CCI_Common.otherUserProfile != null)
        {
            if (typeof JSON.parse(CCI_Common.otherUserProfile)[profileProperty] !== 'undefined') {
                return JSON.parse(CCI_Common.otherUserProfile)[profileProperty];
            }
            else {
                return "Error: User Profile property '" + profileProperty + "' may not be available or not populated. Please contact Support team";
            }
        }
        else {
        }*/
        CCI_Common.GetOtherUserDataUsingREST(emailID); //Fetch from User Profile
        //CCI_Common.otherUserProfile = CCI_Common.GetUserProfileFromLocalCache();
        if (CCI_Common.otherUserProfile != null) {
            if (typeof JSON.parse(CCI_Common.otherUserProfile)[profileProperty] !== 'undefined') {
                return JSON.parse(CCI_Common.otherUserProfile)[profileProperty];
            }
            else {
                return "Error: User Profile property '" + profileProperty + "' may not be available or not populated. Please contact Support team";
            }
        }
    },

    GetOtherUserDataUsingREST: function (emailID) {
        var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/sp.userprofiles.peoplemanager/getpropertiesfor(accountname=@v)?@v='i:0%23.f|membership|" + emailID + "'";
        jQuery.ajax({
            url: url,
            type: "GET",
            async: false,
            contentType: "application/json;odata=nometadata",
            headers: {
                "Accept": "application/json;odata=nometadata",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            },
            success: CCI_Common.onGetOtherUserProfileSuccess,
            error: CCI_Common.onGetOtherUserProfileError
        });
    },

    onGetOtherUserProfileSuccess: function (data) {
        if (data != "" && data != null && Object.keys(data).length > 0 && Object.keys(data)[0] != "odata.null") {
            var myProfile = {};
            //Loop through all user profile properties
            for (var count = 0; count < Object.keys(data).length; count++) {
                if (Object.keys(data)[count] == "UserProfileProperties") {
                    var fullUserProperties = data["UserProfileProperties"]; //User Profile Properties are available in this object
                    if (fullUserProperties != null && fullUserProperties.length > 0) {
                        //All user profile properties saves as individual object with Key/Value pairs
                        for (var profileCount = 0; profileCount < fullUserProperties.length; profileCount++) {
                            switch (JSON.stringify(fullUserProperties[profileCount]["Key"])) {
                                case "\"PreferredName\"":
                                    myProfile["PreferredName"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"AboutMe\"":
                                    myProfile["AboutMe"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"PictureURL\"":
                                    myProfile["PictureURL"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"SPS-Location\"":
                                case "\"CCI-PS-TCLocation\"":
                                    myProfile["SPS-Location"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"msOnline-ObjectId\"":
                                    myProfile["msOnline-ObjectId"] = fullUserProperties[profileCount]["Value"]
                                    break;
                            }
                        }
                        break;
                    }
                }
            }
            var jsonVar = JSON.stringify(myProfile); //Converting object to String
            CCI_Common.otherUserProfile = jsonVar;
        }
        else {
            var myProfile = {};
            var jsonVar = JSON.stringify(myProfile); //Converting object to String
            CCI_Common.otherUserProfile = jsonVar;
        }
    },

    onGetOtherUserProfileError: function (error) {
        console.log(JSON.stringify(error));
        CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetOtherUserDataUsingREST", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
    },

    GetUserFirstName: function () {
        CCI_Common.GetUserFirstNameUsingREST();
        return CCI_Common.userFirstName;
    },

    GetUserFirstNameUsingREST: function () {
        var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
        jQuery.ajax({
            url: url,
            type: "GET",
            async: false,
            contentType: "application/json;odata=nometadata",
            headers: {
                "Accept": "application/json;odata=nometadata",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            },
            success: CCI_Common.onGetUserFirstNameProfileSuccess,
            error: CCI_Common.onGetUserProfileError
        });
    },

    onGetUserFirstNameProfileSuccess: function (data) {
        if (data != "" && data != null && Object.keys(data).length > 0) {
            //Loop through all user profile properties
            for (var count = 0; count < Object.keys(data).length; count++) {
                if (Object.keys(data)[count] == "UserProfileProperties") {
                    var fullUserProperties = data["UserProfileProperties"]; //User Profile Properties are available in this object
                    if (fullUserProperties != null && fullUserProperties.length > 0) {
                        //All user profile properties saves as individual object with Key/Value pairs
                        for (var profileCount = 0; profileCount < fullUserProperties.length; profileCount++) {
                            switch (JSON.stringify(fullUserProperties[profileCount]["Key"])) {
                                case "\"FirstName\"":
                                    CCI_Common.userFirstName = fullUserProperties[profileCount]["Value"]
                                    break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    },

    CanIManageLists: function () {
        var deferred = $.Deferred();

        var userCanManage = false;

        //var checkPermissionUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/getusereffectivepermissions(@v)?@v='" + CCI_Common.GetUserProfilePropertyValue("AccountName").replace("#", "%23") + "'";
		var checkPermissionUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/Web/effectiveBasePermissions";
        jQuery.ajax({
            url: checkPermissionUrl,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: function (data) {
                var permissions = new SP.BasePermissions();
                permissions.initPropertiesFromJson(data.d.EffectiveBasePermissions);
                //var permLevels = [];
                for (var permLevelName in SP.PermissionKind.prototype) {
                    if (SP.PermissionKind.hasOwnProperty(permLevelName)) {
                        var permLevel = SP.PermissionKind.parse(permLevelName);
                        if (permissions.has(permLevel)) {
                            if (permLevelName == "manageLists") {
                                userCanManage = true;
                                break;
                            }
                            //permLevels.push(permLevelName);
                        }
                    }
                }
                deferred.resolve(userCanManage);
            },
            error: function (error) {
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetUserPermissions", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                deferred.reject(error);
            }
        });
        return deferred.promise();
    },

    displayLayover2: function (section) {
        if (section == "Edit_FAQ") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIFAQs/FilteredFAQs.aspx?Category=" + Category + "&IsDlg=1";
        }
        if (section == "Edit_CCIWorkingOn") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIWorkingOn/AllItems.aspx";
        }
        if (section == "Edit_Teams") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIDepartmentTeam/AllItems.aspx";
        }
        if (section == "Edit_Resources") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIResources/AllItems.aspx";
        }
        if (section == "Edit_CCICommunityProjects") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCICommunityProjects/AllItems.aspx";
        }
        if (section == "Edit_CCICommunityCalendar") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCICommunityCalendar/AllItems.aspx";
        }
        if (section == "Edit_CCITasks") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCITasks/AllItems.aspx";
        }
        if (section == "Edit_CCIQuickLinks") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCIQuickLinks/AllItems.aspx";
        }
        if (section == "Edit_CCICommunityOwner") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCICommunityOwner/AllItems.aspx";
        }
        if (section == "Edit_Members") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/Members/AllItems.aspx";
        }


        if (section == "Edit_CCINotificationsList") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINotificationsList/AllItems.aspx";
        }
        if (section == "Edit_CCImyWorkspaceLinks") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCImyWorkspaceLinks/AllItems.aspx";
        }
        if (section == "Edit_CCIFAQs") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIFAQs/AllItems.aspx";
        }
        if (section == "Edit_CCIHRLinks") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIHRLinks/AllItems.aspx";
        }
        if (section == "Edit_CCINotificationsList") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINotificationsList/AllItems.aspx";
        }
        if (section == "Edit_CCIWhatsNew") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIWhatsNew/AllItems.aspx";
        }
        if (section == "Edit_CCINewsArticle") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINewsArticle/Admin.aspx";
        }
        if (section == "Edit_CCIVideos") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIVideos/AllItems.aspx";
        }
        if (section == "Edit_CCIProductInformation") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIProductInformation/Admin.aspx";
        }
        if (section == "Edit_CCINotificationsList") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINotificationsList/AllItems.aspx";
        }
        if (section == "Edit_CCIBannerCarousal") {
            var Category = document.title;
            var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIBannerCarousal/Admin.aspx";
        }

        var options = SP.UI.$create_DialogOptions();
        options.width = 1500;
        options.height = 1300;
        options.resizable = 1
        options.url = url;
        options.dialogReturnValueCallback = Function.createDelegate(null, null);
        SP.UI.ModalDialog.showModalDialog(options);
    },

    //********END Persona******************

    /* Method for CarouselProperties*/

    strOutput: "",

    GetCarouselProperties: function (appName) {
        jQuery.ajax(
        {
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('CCI-CarouselAdmin')/items?$select=* &$filter=CCI_x002d_AppName eq '" + appName + "'",
            type: "GET",
            async: false,
            contentType: "application/json;odata=nometadata",
            headers: {
                "Accept": "application/json;odata=nometadata"
            },
            success: function (data) {

                CCI_Common.strOutput = "";

                if (data.value.length == 1) {
                    if (typeof (data.value[0].CCI_x002d_Arrows) !== "undefined") {
                        CCI_Common.strOutput = CCI_Common.strOutput + data.value[0].CCI_x002d_Arrows + "|";
                    }
                    else {
                        CCI_Common.strOutput = CCI_Common.strOutput + "|";
                    }

                    if (typeof (data.value[0].CCI_x002d_Dots) !== "undefined") {
                        CCI_Common.strOutput = CCI_Common.strOutput + data.value[0].CCI_x002d_Dots + "|";
                    }
                    else {
                        CCI_Common.strOutput = CCI_Common.strOutput + "|";
                    }

                    if (typeof (data.value[0].CCI_x002d_rotation) !== "undefined") {
                        CCI_Common.strOutput = CCI_Common.strOutput + data.value[0].CCI_x002d_rotation;
                    }
                    else {
                        CCI_Common.strOutput = CCI_Common.strOutput;
                    }
                }
                else {
                    CCI_Common.strOutput = "||";
                }

            },
            error: function (error) {
                CCI_Common.strOutput = "||";
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetCarouselProperties", _spPageContextInfo.serverRequestPath, JSON.stringify(error));

            }

        });

        if (CCI_Common.strOutput != "") {
            return CCI_Common.strOutput;
        }
        else {
            return "||";
        }

    },

    /************************End function GetCarouselProperties*******************************/
}

$(document).ready(function () {

    /* Yammer Conversations width fix in Home Page */
    $('#DeltaPlaceHolderMain').addClass('row');
    $("#embedded-feed").css('visibility', 'hidden');
$( ".fa" ).attr( "aria-hidden", "true" );
$(".fa.fa-share-alt").attr('class', 'icon-share-1');
    /*Hiding Breadcrumb from /pages Function*/
    /*if (window.location.href.indexOf("ne/Pages") > -1) {
        $('#Navbreadcrumb').css("display", "none");
    }
    else if (window.location.href.indexOf("ne/pages") > -1) {
        $('#Navbreadcrumb').css("display", "none");
    }
    else {
        $('#Navbreadcrumb').css("display", "block");
    }*/

    /*Search Dropdown icon change*/
    $('.navbar-collapse div#SearchBox a[title="Navigation"] img').remove('img');
    $('.navbar-collapse div#SearchBox a[title="Navigation"]').append('<i class="fa fa-bars" aria-hidden="true"></i>');

    /*Search Icon change*/
    $('.navbar-collapse div#SearchBox a[title="Search"] img').remove('img');
    $('.navbar-collapse div#SearchBox a[title="Search"]').append('<i class="fa fa-search" aria-hidden="true"></i>');

    /*breadcrumb padding adjustment*/
    var Navcrumb = $('#Navbreadcrumb').css('display');
    if (Navcrumb == 'none') {
        $('#DeltaPlaceHolderMain').css('margin-top', '10px');
    }
    else {
        $('#DeltaPlaceHolderMain').css('margin-top', '0px');
    }

    /*Mega Menu divider*/
    $(".nav .dropdown a:contains('myHR')").next().addClass('menuHeight');   

    /* Method to Display Welcome Message*/

    var interval = setInterval(function () {
	//setTimeout(function () {
        if ($('.o365cs-me-tileview').length || $('.o365cs-me-tile-nophoto').length || $('.o365cs-rsp-tn-hideIfAffordanceOn .o365cs-mfp-header').length) {            
            var userDisplayName = CCI_Common.GetUserProfilePropertyValue("FirstName");
            if ($('.o365cs-me-tileview').length) {
                $('.o365cs-nav-topItem:last').before($("<a class='displayFirstName'>Hi " + userDisplayName + "</a>"));
            }
            if ($('.o365cs-me-tile-nophoto').length) {                
				$(".o365cs-nav-topItem:last").before($("<a class='displayFirstName'>Hi " + userDisplayName + "</a>"));
				$(".o365cs-nav-topItem:last-child .o365cs-nav-button").html('').append( "<div class='o365cs-me-tileview-container'><div class='o365cs-me-tileview'><div class='o365cs-me-presence5x50 o365cs-me-presenceColor-Offline'></div><span class='ms-bgc-nt ms-fcl-w o365cs-me-tileimg o365cs-me-tileimg-doughboy owaimg ms-Icon--person ms-icon-font-size-52' aria-hidden='true'> </span></div></div>" );
            }
			if ($('.o365cs-mfp-header').length) {
                $(".o365cs-nav-topItem:last").before($("<a class='displayFirstName'>Hi " + userDisplayName + "</a>"));
				$(".o365cs-nav-topItem:last-child .o365cs-nav-button").html('').append( "<div class='o365cs-me-tileview-container'><div class='o365cs-me-tileview'><div class='o365cs-me-presence5x50 o365cs-me-presenceColor-Offline'></div><span class='ms-bgc-nt ms-fcl-w o365cs-me-tileimg o365cs-me-tileimg-doughboy owaimg ms-Icon--person ms-icon-font-size-52' aria-hidden='true'> </span></div></div>" );
            }
            $(".o365cs-nav-topItem:last-child").css("cssText", "display:inline-block !important;");
            clearInterval(interval);
        }
    }, 5000);
	
	
    
});
$(window).load(function () {

    /* Yammer Conversations width fix in Home Page */
	$("#embed-feed").width(294);
	$("#embedded-feed").width(294).addClass('showStyle');
    /* $("#embedded-feed.yammer #embed-feed").width(377);
    $("#embedded-feed.yammer").addClass('showStyle'); */ 
$( ".fa" ).attr( "aria-hidden", "true" );
$(".fa.fa-share-alt").attr('class', 'icon-share-1');
    /*Product Information Show and Hide Function */
    $('#Business').on('click', function () {
        $('.Residential').hide();
        $('.Business').show();
    });
    $('#Residential').on('click', function () {
        $('.Residential').show();
        $('.Business').hide();
    });
var startDate;
    /*NewsNotification visibility*/
	var localStorage;
    $('.cross_warp .fa-times').on('click', function () {
        $(this).parents('.panel').css('display', 'none');
        $('#Hometoggle.row').css('margin-top', '10px');
		window['localStorage'].setItem(document.title.toLowerCase()+"notifictn", "yes");
		startDate = new Date();
		window['localStorage'].setItem(document.title.toLowerCase()+"Time", startDate);
		

    });

	
	
    $('.ms-srch-siteSearchResults a[title="Navigation"] img').remove('img');
    $('.ms-srch-siteSearchResults a[title="Navigation"]').append('<i class="fa fa-bars" aria-hidden="true"></i>');

    $('.ms-srch-siteSearchResults a[title="Search"] img').remove('img');
    $('.ms-srch-siteSearchResults a[title="Search"]').append('<i class="fa fa-search" aria-hidden="true"></i>');

    //	$('.ms-srch-siteSearchResults #Groups .ms-srch-item').addClass('well');

    /*$(".item_box .mob_accordian").off().on('click', function () {
        $(this).toggleClass('accord');
        $(this).next().toggleClass('space_warp');
    });*/

    /*window.setTimeout(function(){
		//$('iframe#embed-feed').contents().find(".yj-message-list-item--action-list-label").css("white-space","normal !important");	
		//console.log('I am in');	
	}, 1000);*/

    /*Mega Menu*/
    $(".side_mega_menu ul.check_side_area a:contains('All')").css({ "font-weight": "bold" });

    //Mobile Toggle 	
    $(".HRdepartment .mob_accordian").click(function () {
        $(this).toggleClass('accord');
        $(this).next().toggleClass('space_warp');
    });
    $("#Hometoggle .mob_accordian").off().on('click', function () {
        $(this).toggleClass('accord');
        $(this).next().toggleClass('space_warp');
    });
    $(".ng-scope .mob_accordian").off().on('click', function () {
        $(this).toggleClass('accord');
        $(this).next().toggleClass('space_warp');
    });
    $(".Accounting .mob_accordian").click(function () {
        $(this).toggleClass('accord');
        $(this).next().toggleClass('space_warp');
    });

    $(".panel .ms-webpart-chrome-title").click(function () {
        $(this).toggleClass('accord');
        $(this).next().toggleClass('space_warp');
    });

    /*Clock url change for mobile and Desktop in Home Page */
    var mq = window.matchMedia("(min-width: 650px)");
    if (matchMedia) {
        var mq = window.matchMedia("(min-width: 650px)");
        mq.addListener(WidthChange);
        WidthChange(mq);
    }
    function WidthChange(mq) {
        if (mq.matches) {
            $('#timeclockdiv a').attr("href", "https://jump.cox.com/tiny/Hrwebclock")
        }
        else {
            $('#timeclockdiv a').attr("href", "https://jump.cox.com/tiny/HRMobileWebclock");
        }
    }

    /* Dynamic css for Iframe in News Article Section
    $('iframe.discussionframe').contents().find("#s4-workspace").css("height", "500px");
    $('iframe.discussionframe').contents().find("#s4-ribbonrow").hide();
    $('iframe.discussionframe').contents().find("#s4-titlerow").addClass('newarticle').hide();
    $('iframe.discussionframe').contents().find(".ms-comm-postReplyTextBox").css("width", "540px");
    $('iframe.discussionframe').contents().find(".ms-spimn-presenceLink").css("display", "none");
*/

    /*Page Loaded hide Functionlity*/
    $('.pageLoader').fadeOut("slow");
    $('#s4-titlerow').css('display', 'block');
    $('#s4-bodyContainer').css('display', 'block');

    /*ng scope background change*/
    $('.ng-scope [ng-controller="ModalDemoCtrl"]').parents('.panel').css('box-shadow', 'none');

    /*Mega Menu divider*/
    $(".nav .dropdown a:contains('myHR')").next().addClass('menuHeight');

    /* Add Dynamic Clas in Discover*/
    $(".nav .dropdown a:contains('Discover')").next().addClass('DiscoverItem');
	
	/*Remove empty P element in richtext Editor content*/
	$(".news_box .content_row p:contains('')").remove();
	
	/*Hide UrlFieldDescription in OOB Page*/
	if (window.location.href.indexOf("/NewForm.aspx") > -1) {
		$('#onetIDListForm .ms-formtable .ms-formbody input[title="Description"]').prev("span").hide(); 
		$('#onetIDListForm .ms-formtable .ms-formbody input[title="Description"]').hide();
		$("#onetIDListForm input[id*='UrlFieldUrl'] + br").css("display", "none");		
	}

	/*s = $('#s4-workspace').height();
	$('#s4-workspace').scroll(function () {
		var y = $('#s4-workspace').scrollTop();
		if(y > 50 ){
		   $('#suiteBarTop').hide();
			 $('html.csstransitions #s4-workspace').height(s + 50);   
		 } 
		else 
		{        
		  $('#suiteBarTop').show();
		  $('html.csstransitions #s4-workspace').height(s);   
		 }
	});*/
	
		var mywindow = $('#s4-workspace');
	    var s4Height = $('#s4-workspace').height();
		var suiteBarHeight = $('#suiteBarTop').height();
		var mypos = mywindow.scrollTop();
		var up = false;
		var newscroll;
		mywindow.scroll(function () {		
			newscroll = mywindow.scrollTop();
			if (newscroll > mypos && !up) {				
				$('#suiteBarTop').stop().slideToggle();	
                 $('#s4-workspace').height(s4Height + suiteBarHeight);   				
				up = !up;				
			
			} else if(newscroll < mypos && up) {				
				$('#suiteBarTop').stop().slideToggle(); 
                  $('#s4-workspace').height(s4Height);                 	
				up = !up;
			}
			mypos = newscroll;
			
		});			
	    
});

//custom css fix
$('.ms-TPSectionTD input[type="checkbox"]').css("visibility", "visible");
$('.UserSectionHead input[type="checkbox"]').css("visibility", "visible");
$('.s4-breadcrumb img').removeAttr('style');
$(".article-content img").addClass("img-responsive");
$(".department img").addClass("img-responsive");
$(".ms-rte-embedcode div[class*=Edit] img").removeClass('img-responsive');
$( ".fa" ).attr( "aria-hidden", "true" );
$(".fa.fa-share-alt").attr('class', 'icon-share-1');
// bind call  for flexi slider
$(document).bind('function_GetListGuid_complete', flexiSlider);

// flexi slider method
function flexiSlider() {
    var timesRun = 0;
    var interval = setInterval(function () {
        timesRun += 1;
        if (timesRun === 1) {
            clearInterval(interval);
        }
        /*$("#flexiselDemo4").flexisel({
			infinite: false,
			visibleItems: 7,
			itemsToScroll: 1
		});*/
        var owl = $('#flexiselDemo4').owlCarousel({
            margin: 17,
            autoWidth: true,
            nav: true,
            loop: false,
            items: 1,             
            onInitialized: function () {
                if ($('.owl-item').first().hasClass('active'))
                    $('.owl-prev').addClass('disabled');
                else { $('.owl-prev').removeClass('disabled'); }
            }
        })
        owl.on('changed.owl.carousel', function (e) {

            var items = e.item.count;     // Number of items
            var item = e.item.index;     // Position of the current item
            // Provided by the navigation plugin
            var pages = e.page.count;     // Number of pages
            var page = e.page.index;     // Position of the current page
            var size = e.page.size;
            if (e.item.index == 0) {
                $('.owl-prev').addClass('disabled');
                $('.owl-next1').addClass('owl-next').removeClass('owl-next1 disabled');
                $('.owl-overlay').removeClass('owl-overlay');
				
            }
            else {
                $('.owl-prev').removeClass('disabled');
		$('.owl-next').removeClass('disableClick');
                $('.owl-next1').addClass('owl-next').removeClass('owl-next1 disabled');
                $('.owl-overlay').removeClass('owl-overlay');
				
            }
            if ((items == page + 6) || (items < 5)) {                
                $('.owl-next').addClass('disableClick');
                $('.owl-next').removeClass('owl-next').addClass('owl-next1 disabled');
                $('.owl-nav').prepend('<div class="owl-overlay"></div>');
		e.stopPropagation();				
            }
            else {
                $('.owl-next').removeClass('disableClick');
                $('.owl-next1').addClass('owl-next').removeClass('owl-next1 disabled');
                //$('.owl-overlay').removeClass('owl-overlay');
				}
        })
    }, 4500);
}
function flexiSliderReload() {
    var owl = $('#flexiselDemo4').owlCarousel({
        margin: 17,
        autoWidth: true,
        nav: true,
        loop: false,
        items: 1,
        onInitialized: function () {
            if ($('.owl-item').first().hasClass('active'))
                $('.owl-prev').addClass('disabled');
            else { $('.owl-prev').removeClass('disabled'); }
        }
    })
    owl.on('changed.owl.carousel', function (e) {

        var items = e.item.count;     // Number of items
        var item = e.item.index;     // Position of the current item
        // Provided by the navigation plugin
        var pages = e.page.count;     // Number of pages
        var page = e.page.index;     // Position of the current page
        var size = e.page.size;
        if (e.item.index == 0) {
            $('.owl-prev').addClass('disabled');
            $('.owl-next1').addClass('owl-next').removeClass('owl-next1 disabled');
            $('.owl-overlay').removeClass('owl-overlay');
        }
        else {
            $('.owl-prev').removeClass('disabled');
	    $('.owl-next').removeClass('disableClick');
            $('.owl-next1').addClass('owl-next').removeClass('owl-next1 disabled');
            $('.owl-overlay').removeClass('owl-overlay');
        }
        if ((items == page + 6) || (items < 5)) { 
	    $('.owl-next').addClass('disableClick');
            $('.owl-next').removeClass('owl-next').addClass('owl-next1 disabled');
            $('.owl-nav').prepend('<div class="owl-overlay"></div>')
	    e.stopPropagation();
        }
        else {
	    $('.owl-next').removeClass('disableClick');
            $('.owl-next1').addClass('owl-next').removeClass('owl-next1 disabled');
            //$('.owl-overlay').removeClass('owl-overlay');
        }
    })
}

/* Method for myHR Prefreneces */
function myHRsettingopen() {
    $('a.myHRsetting').hide();
    $('.myHRdropDown').show();
}
function myHRsettingclose() {
    $('.myHRdropDown').hide();
    $('.myHRsetting').show();
}

/* Method to Show Hide News Artical form*/
function showHideMetadata() {
    $('.MetadataContent, .MetadataContent1, .MetadataContent2, .MetadataContent3, .MetadataContent4').toggle();
}

