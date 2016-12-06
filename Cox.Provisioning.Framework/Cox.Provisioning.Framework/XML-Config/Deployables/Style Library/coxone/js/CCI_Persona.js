/* This script does the following:
        1. Initally checks whether the browser supports Local Cache or not.
        2. If Browser supports Local Cache, get user profile data and stores in Local Cache
        3. If Browser doesn't support Local Cache, then user Profile data will be stored in Cookies
        4. Life time of Cookie is set to 1 year from created date. */

//Global Variables
var propertiesData;

var currentUserProfile;

var requestHeaders = {
    "Accept": "application/json;odata=nometadata",
    "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
};

//Page Load
$(document).ready(function () {
    //Check whether browser supports Local Cache?
    if (typeof (Storage) !== "undefined") {
        //Browser supports Local Cache
        //Check whether User profile data available in Local Cache
        //clearLocalCache();
        currentUserProfile = getFromLocalCache();
        if (currentUserProfile === null) //No User Profile data in Local Cache - Populate Local Cache with User Profile data
        {
            buildCookie_LocalCache("cache");
            currentUserProfile = getFromLocalCache();
            //alert("From New Local Cache- " + getUserProfilePropertyValue("AboutMe"));
        }
        else { //User profile data exists in Local Cache
            //alert("From existing Local Cache- " + getUserProfilePropertyValue("AboutMe"));
        }

        //alert(getUserProfilePropertyValue("WorkEmail"));
        //if (localStorageData !== null && localStorageData !== "undefned") {
        //  alert("From Local Cache- " + localStorageData["AboutMe"]);
        //}
    }
    else {
        //Browser doesn't support Local Cache - Store in Cookie
        //deleteCookie();
        //Check for Cookies and create if Coookie doesn't exist
        var cookieExists = checkCookie();
        if (cookieExists) {
            //alert("Existing Cookie - " + getUserProfilePropertyValue("AboutMe"))
        }
        if (!cookieExists) {
            buildCookie_LocalCache("cookie");
            currentUserProfile = getCookie("cookieUserProfile");
            //alert("New Cookie - " + getUserProfilePropertyValue("AboutMe"))
        }
    }
    //alert(getUserProfilePropertyValue("AboutMe"));    	
});

function getUserProfilePropertyValue(profileProperty) {
    if (currentUserProfile != null) {
        if (typeof (Storage) !== "undefined") {
            if (typeof (currentUserProfile[profileProperty]) !== 'undefined') {
                return currentUserProfile[profileProperty];
            }
            else {
                return "Error: User Profile property '" + profileProperty + "' may not be available or not populated. Clear browser cache/cookies and try again";
            }
        }
        else if (typeof (JSON.parse(currentUserProfile)[profileProperty]) !== 'undefined') {
            return JSON.parse(currentUserProfile)[profileProperty];
        }
        else {
            return "Error: User Profile property '" + profileProperty + "' may not be available or not populated. Clear browser cache/cookies and try again";
        }
    }
    else {
        return "Get User Profile Value - Unexpected Error. Make sure the script file loaded properly.";
    }
}

//Deletes the cookie - For Testing Purpose
function deleteCookie() {
    var d = new Date();
    d.setDate(10);
    var expires = "expires=" + d.toGMTString();
    document.cookie = "cookieUserProfile=; " + expires;
}

//Gets current logged in users' data from User Profile (Using REST api)
function getUserDataUsingREST() {
    var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
    jQuery.ajax({
        url: url,
        type: "GET",
        async: false,
        contentType: "application/json;odata=nometadata",
        headers: requestHeaders,
        success: function (data) {
            propertiesData = data;
        },
        error: function (jqxr, errorCode, errorThrown) {
            alert(jqxr.responseText);
        }
    });
}

//*****************INCOMPLETE****************** - Gets current logged in users' data from User Profile (Using JSOM)
function getUserDataUsingJSOM()
{
    // Get the current client context and PeopleManager instance.
    var clientContext = SP.ClientContext.get_current();
    var peopleManager = new SP.UserProfiles.PeopleManager(clientContext);

    // Get user properties for the current user
    personProperties = peopleManager.getMyProperties();

    // Load the PersonProperties object and send the request.
    clientContext.load(personProperties);
    clientContext.executeQueryAsync(onRequestSuccess, onRequestFail);
}

//*****************INCOMPLETE****************** This function runs if the executeQueryAsync call succeeds.
function onRequestSuccess() {
    propertiesData = personProperties.get_userProfileProperties();
}

//*****************INCOMPLETE****************** This function runs if the executeQueryAsync call fails.
function onRequestFail(sender, args) {
    alert(args.get_message());
}

//Check whether Cookie exist or not
function checkCookie() {
    currentUserProfile = getCookie("cookieUserProfile");
    if (currentUserProfile != "" && typeof (currentUserProfile) !== 'undefined' && typeof (currentUserProfile) === 'string') {
        return true;
    }
    else {
        return false;
    }
}

//Build Cookie
function buildCookie_LocalCache(cookieCache) {
    /*//*****************INCOMPLETE******************The following is used to get User Profile Properties using JSOM
    $.getScript(_spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/SP.js", function () {
        $.getScript(_spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/SP.UserProfiles.js", getUserDataUsingJSOM);
    });*/

    //The following is used to get User Profile Properties using REST api
    getUserDataUsingREST();
    if (propertiesData != "" && propertiesData != null && Object.keys(propertiesData).length > 0) {
        setCookieCache("cookieUserProfile", Object.keys(propertiesData).length, cookieCache);
    }
}

//Set Cookie
//Input 1 -> cname: Hardcoded value (cookieUserProfile)
//Input 2 -> varLength: User Profile Properties count
function setCookieCache(cname, varLength, varCookieCache) {
    var myProfile = {};
    var d = new Date();
    d.setDate(d.getDate() + 365);
    var expires = "expires=" + d.toGMTString(); //Set the cookie expired date to one year from Today

    for (var count = 0; count < varLength; count++) //Looping through all User profile properies
    {
        if (Object.keys(propertiesData)[count] == "UserProfileProperties") {
            var fullUserProperties = propertiesData["UserProfileProperties"]; //User Profile Properties are available in this object
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
                        case "\"CareerLevel\"":
                            myProfile["CareerLevel"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                            break;
                        case "\"ManagerLevel\"":
                            myProfile["ManagerLevel"] = JSON.stringify(fullUserProperties[profileCount]["Value"])
                            break;
                    }
                }
                break;
            }
        }
        /*
        switch (Object.keys(propertiesData)[count])
        {
            case "DisplayName":
                myProfile["DisplayName"] = propertiesData["DisplayName"];
                break;
            case "Email":
                myProfile["Email"] = propertiesData["Email"];
                break;
            case "CCI-Dept":
                myProfile["CCI-Dept"] = propertiesData["CCI-Dept"];
                break;
            case "UserProfileProperties":
                var fullUserProperties = propertiesData["UserProfileProperties"];
                //JSON.stringify(fullUserProperties[6]["Key"])

                var results = fullUserProperties["results"];
                break;
        }*/
    }
    var jsonVar = JSON.stringify(myProfile); //Converting object to String

    //Cookie
    if (varCookieCache === "cookie") {
        document.cookie = cname + "=" + jsonVar + "; " + expires;
    }

    //Local Storage
    if (varCookieCache === "cache") {
        if (typeof (Storage) !== "undefined") {
            //Browser supports Local Storage
            window.localStorage.setItem("userData", jsonVar);;
        }
    }

}

//Get the cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length); //Returns "cookieUserProfile"
        }
    }
    return "";
}

//Get from LocalCahe
function getFromLocalCache() {
    return JSON.parse(localStorage.getItem("userData"));
}

//Clears Local Cache data
function clearLocalCache() {
    localStorage.removeItem("userData");
}