/* *********Preferences***********
Get Current Preferences
1. Use 'getPreferences' to get current preferences of the logged in user.
2. To get preferences for News Grid, invoke 'getPreferences("news")'
3. To get preferences of HR, invoke 'getPreferences("hr")'
4. If no preferences exist for the current user, then function will return 'null'. Make sure you handle 'null' in your code.
    
Add/Update Preferences
1. Invoke 'managePreferences' function to add/update preferences.
2. This utility will check if user already have preferences. If preferences are not available, then it will create a new item and will update if preferences exist.
3. You have to pass 2 parameters for 'managePreferences'. a) preference type (hr/news) b)Preference content (preferably in JSON format)
4. To add/update hr preferences, managePreferences("hr", prefContent); //prefContent is actual preferences in JSON format

Preferences List Structure

List Name: Preferences
Columns: 
    UserID - SingleLine
    HRPreferences - Plain Multiline
    Preferences - Plain Multiline

Sameple JSON for HR preferecens
var hrPreferences = [
    { "Item": "Time Clock1"},
    { "Item": "Calendar1" },
    { "Item": "myCareer Bio" }
    ];


Sample JSON for News Preferences
var preferences = {
    "Company": [
                        { "Item": "Products" }
    ],
    "COE": [
                        { "Item": "Sales" },
                        { "Item": "Customer Care" },
                        { "Item": "Retention" },
                        { "Item": "ROC" }
    ],
    "Departments": [
                        { "Item": "Customer Experience" },
                        { "Item": "Field Services" },
                        { "Item": "Human Resources" },
                        { "Item": "Marketing & Sales" },
                        { "Item": "Technology" }
    ],
    "Divisions": [
                        { "Item": "Cox Media" },
                        { "Item": "Cox Business" }
    ],
    "Locations": [
                        { "Item": "Atlanta" },
                        { "Item": "California" },
                        { "Item": "Cental" },
                        { "Item": "Northeast" },
                        { "Item": "Southeast" },
                        { "Item": "Southwest" }
    ],
    "Topics": [
                        { "Item": "Contour" },
                        { "Item": "WICT" },
                        { "Item": "Homelife" },
                        { "Item": "March Madness" },
                        { "Item": "Cox Conserves" }
    ]
};
*/

var myPreferences;
var hrPreferences;
var newsPreferences;

var CCI_NewsPreferences = {
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
                NewsPreferences.GetUserPreferencesFromList();
            }
        }
    },

    SetToCache: function (itemName, value) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem(itemName, value);
        }
    },

    GetUserPreferencesFromList: function () {
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('" + NewsPreferences.preferenceList + "')/Items?";
        requestUri += "$select=ID,Title,Departments,Companies,COE,Division,Industry,Locations";
        requestUri += "&$filter=UserID eq " + _spPageContextInfo.userId;
        var requestHeaders = { "accept": "application/json;odata=verbose" };
        $.ajax({
            url: requestUri,
            contentType: "application/json;odata=verbose",
            headers: requestHeaders,
            success: NewsPreferences.onGetPreferencesSuccess,
            error: NewsPreferences.onGetAdminError
        });
    },
    onGetPreferencesSuccess: function (data, request) {
        NewsPreferences.checkPreferenceAvailable = true;
        var i, listSelectionData, userPreferenceItem;
        var items = data.d.results;
        NewsPreferences.preSelectedPreferences = [];
        for (i = 0; i < items.length; i++) {
            userPreferenceItem = items[i];
            listSelectionData = { ID: userPreferenceItem.ID, Title: userPreferenceItem.Title, Company: userPreferenceItem.Companies, Department: userPreferenceItem.Departments, COE: userPreferenceItem.COE, Division: userPreferenceItem.Division, Location: userPreferenceItem.Locations, Industry: userPreferenceItem.Industry };
            NewsPreferences.preSelectedPreferences.push(listSelectionData);
        }
        NewsPreferences.SetToCache("NewsPreferenceCache", NewsPreferences.preSelectedPreferences)
    },
    onGetAdminError: function (error) {
        console.log(JSON.stringify(error));
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
}

//Clears Local Cache data
function clearLocalCache() {
    localStorage.removeItem("hrPreferences");
    localStorage.removeItem("newsPreferences");
}

function getHRFromLocalCache() {
    return JSON.parse(localStorage.getItem("hrPreferences"));
}

function getNewsFromLocalCache() {
    return JSON.parse(localStorage.getItem("newsPreferences"));
}

function populateCache()
{
    if (typeof (myPreferences) !== "undefined")
    {
        if (typeof (Storage) !== "undefined") //Browser supports Local Cache
        {
            window.localStorage.setItem("hrPreferences", myPreferences.d.results[0].HRPreferences);
            window.localStorage.setItem("newsPreferences", myPreferences.d.results[0].Preferences);
        }
    }
}

//This functions checks for any existing Preferences for currnet logged in user
function checkForPreferences()
{
    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Preferences')/items?$filter=UserID eq '" + _spPageContextInfo.userLoginName + "'",
        type: "GET",
        async: false,
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (data) {
            if (data.d.results.length >= 1) {
                myPreferences = data;
            }
        },
        error: function (jqxr, errorCode, errorThrown) {
            alert(jqxr.responseText);
        }
    });
}

//This function checks and returns the User Preferences. If user doesn;t have any preferences data, then null value will be returned
//Input 1 -> prefType: Valid values are hr or news 
function getPreferences(prefType)
{
    //clearLocalCache();
    //Check in Cache for preferences
    if (typeof (Storage) !== "undefined") //Browser supports Local Cache
    {
        if (prefType.toLowerCase() === "hr") {
            hrPreferences = getHRFromLocalCache();
            if (typeof (hrPreferences) !== "undefined" && hrPreferences !== null)
            {
                return JSON.stringify(hrPreferences);
            }
        }
        else {
            newsPreferences = getNewsFromLocalCache();
            if (typeof (newsPreferences) !== "undefined" && newsPreferences !== null) {
                return JSON.stringify(newsPreferences);
            }
        }
    }
    //If Preferences is not in cache, then check for Preferences in List
    //and add Preferences to Cache
    checkForPreferences();
    if (typeof (myPreferences) !== "undefined" && myPreferences !== null) { //Valid preferences
        populateCache();
        if (prefType.toLowerCase() == "hr") {
            return myPreferences.d.results[0].HRPreferences;
        }
        else {
            return myPreferences.d.results[0].Preferences;
        }
    }
    else {
        return null;
    }
}

//This function determines whether new Preference item should be added or existing item to be updated
//Input 1 -> prefType: Valid values are hr or news 
//Input 2 -> prefContent: Preferences in JSON format
function managePreferences(prefType, prefContent)
{
    var restUrl;
    var restType;
    var result;

    //Clear cache
    clearLocalCache();

    //Check whether User have any current Preferences
    var currentPreferences = getPreferences(prefType);
/*
    if (currentPreferences != null) //Users' preferences available - Update existing
    {
        restType = "MERGE";
        restUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Preferences')/items(" + myPreferences.d.results[0].ID + ")";
        result = addUpdatePrefereces(prefType, prefContent, restType, restUrl);
    }
    else { //No prefereneces available for current user - Create new list item
        restType = "POST";
        restUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Preferences')/items";
        result = addUpdatePrefereces(prefType, prefContent, restType, restUrl);
    }*/

    if (currentPreferences != null) //Users' preferences available - Update existing
    {
        restType = "Update";
        ExecuteOrDelayUntilScriptLoaded(function () { addPreferences(prefType, prefContent, restType, myPreferences.d.results[0].ID) }, "sp.js");
    }
    else { //No prefereneces available for current user - Create new list item
        restType = "new";
        ExecuteOrDelayUntilScriptLoaded(function () { addPreferences(prefType, prefContent, restType, null) }, "sp.js");
    }

    return result;
}


//This function adds/updates preferences
//Input 1 -> prefType: Valid values are hr or news 
//Input 2 -> prefContent: Preferences in JSON format
//Input 3 -> restType: Represents new or updated
//Input 4 -> itemID: Item ID to be updated. Null for new item.
function addPreferences(prefType, prefContent, restType, itemID)
{
    var prefData;
    var response;

    // Get the current client context
    var clientContext = SP.ClientContext.get_current();
    oList = clientContext.get_web().get_lists().getByTitle('Preferences');

    if (restType.toLowerCase() == "new") { //Creating new item
        var itemCreateInfo = new SP.ListItemCreationInformation();
        this.oListItem = oList.addItem(itemCreateInfo);
        oListItem.set_item('UserID', _spPageContextInfo.userLoginName);
    }
    else { //Update existing
        this.oListItem = oList.getItemById(itemID);
    }
    if (prefType.toLowerCase() == "hr") { //HR preferences
        if (typeof (prefContent) === "object") {
            oListItem.set_item('HRPreferences', JSON.stringify(prefContent));
        }
    }
    else { //News Preferences
        if (typeof (prefContent) === "object") {
            oListItem.set_item('Preferences', JSON.stringify(prefContent));
        }
    }
   
    oListItem.update();

    clientContext.load(oListItem);
    clientContext.executeQueryAsync(
        Function.createDelegate(this, this.onQuerySucceeded),
        Function.createDelegate(this, this.onQueryFailed)
    );
}

function onQuerySucceeded() {
    //alert('Item created: ' + oListItem.get_id());
    return "Success";
}

function onQueryFailed(sender, args) {
    alert('Request failed. ' + args.get_message() +
        '\n' + args.get_stackTrace());
}


//*****************INCOMPLETE****************** Adds preferences of the current user to Preferences list
function addUpdatePrefereces(prefType, prefContent, restType, restUrl) {
    var hrPref;
    var newsPref;
    var response;

    if (prefType.toLowerCase() == "hr") {
        if (typeof (prefContent) === "object")
        {
            hrPref = JSON.stringify(prefContent);
        }
        newsPref = "";
    }
    else {
        hrPref = "";
        if (typeof (prefContent) === "object") {
            newsPref = JSON.stringify(prefContent);
        }
    }

    var itemContent = {
        __metadata: { 'type': 'SP.Data.PreferencesListItem' }, //_api/lists/getbytitle('Preferences')?$select=ListItemEntityTypeFullName
        UserID: _spPageContextInfo.userLoginName,
        HRPreferences: hrPref,
        Preferences: newsPref
    };

    jQuery.ajax({
        url: restUrl,
        type: restType,
        data: JSON.stringify(itemContent),
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "content-type": "application/json;odata=verbose",
        },
        success: function (data) {
            alert("Success");
            return "Preferences has been added/updated successfully";
            response = data;
        },
        error: function (jqxr, errorCode, errorThrown) {
            alert(jqxr.responseText);
            return jqxr.responseText;
        }
    });
    alert(response);
}



