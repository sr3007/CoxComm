
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
    propertiesData: null,

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
            CCI_Common.GetUserDataUsingREST(); //Fetch from User Profile
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
        return JSON.parse(localStorage.getItem("userProfileData"));
    },

    GetUserDataUsingREST: function () {
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
            success: CCI_Common.onGetUserProfileSuccess,
            error: CCI_Common.onGetUserProfileError
        });
    },

    onGetUserProfileSuccess: function (data) {
        if (data != "" && data != null && Object.keys(data).length > 0) {
            var myProfile = {};
            //Loop through all user profile properties
            for (var count = 0; count < Object.keys(data).length; count++) {
                if (Object.keys(data)[count] == "UserProfileProperties") {
                    var fullUserProperties = data["UserProfileProperties"]; //User Profile Properties are available in this object
                    if (fullUserProperties != null && fullUserProperties.length > 0) {
                        //All user profile properties saves as individual object with Key/Value pairs
                        for (var profileCount = 0; profileCount < fullUserProperties.length; profileCount++) {
                            switch (JSON.stringify(fullUserProperties[profileCount]["Key"])) {
                                case "\"FirstName\"":
                                    myProfile["FirstName"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"AboutMe\"":
                                    myProfile["AboutMe"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"SPS-HireDate\"":
                                    myProfile["SPS-HireDate"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"CCI-Dept\"":
                                    myProfile["CCI-Dept"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"AutoAllowanceLevel\"":
                                    myProfile["AutoAllowanceLevel"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"BusinessUnit\"":
                                    myProfile["BusinessUnit"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"CareerLevel\"":
                                    myProfile["CareerLevel"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"Commissioned\"":
                                    myProfile["Commissioned"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"Department\"":
                                    myProfile["Department"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"FLSAStatus\"":
                                    myProfile["FLSAStatus"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"HighlyCompensated\"":
                                    myProfile["HighlyCompensated"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"HireDate\"":
                                    myProfile["HireDate"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"JobCode\"":
                                    myProfile["JobCode"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"JobEntryDate\"":
                                    myProfile["JobEntryDate"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"JobFamily\"":
                                    myProfile["JobFamily"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"JobSubfamily\"":
                                    myProfile["JobSubfamily"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"LastStartDate\"":
                                    myProfile["LastStartDate"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"Location\"":
                                    myProfile["Location"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"ManagerLevel\"":
                                    myProfile["ManagerLevel"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"OperationalDepartment\"":
                                    myProfile["OperationalDepartment"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"OperationalDepartmentandSubledger\"":
                                    myProfile["OperationalDepartmentandSubledger"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"RehireDate\"":
                                    myProfile["RehireDate"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"RegionalBusinessUnit\"":
                                    myProfile["RegionalBusinessUnit"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"Regular/Temp\"":
                                    myProfile["Regular/Temp"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"ServiceDate\"":
                                    myProfile["ServiceDate"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"TimeReportingStatus\"":
                                    myProfile["TimeReportingStatus"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"TimeReportingIndicator\"":
                                    myProfile["TimeReportingIndicator"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"TaskGroup\"":
                                    myProfile["TaskGroup"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                                    break;
                                case "\"PeopleorGroup\"":
                                    myProfile["PeopleorGroup"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
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
                window.localStorage.setItem("userProfileData", jsonVar);;
            }
        }
    },

    onGetUserProfileError: function (error) {
        console.log(JSON.stringify(error));
        CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI_Common.GetUserDataUsingREST", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
    },

    //********END Persona******************
}

