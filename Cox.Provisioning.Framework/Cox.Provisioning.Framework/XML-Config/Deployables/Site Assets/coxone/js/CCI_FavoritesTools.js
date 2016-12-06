<script>
    'use strict';
//myHRTools
var IconsListName = "CCI-myFavoritesIcons";
//var LinksListName = "myFavoritesLinks";
var PreferencesListName = "CCI-myFavoritesPreferences";

//var username;
//var useremail;
var iconsList;
//var linksList;
var preferencesList;
var iconsListId;
//var linksListId;
var preferencesListId;
var context;
//var webtitle;
var user;
var searchQueryText;
var hostweb;
var searchResultsHtml;
var siteUrl;
var myPreferencesJSONObject;
var myPreferencesId = 0;

//Load resources such as lists, current user etc.
function loadFavResources()
{
    searchResultsHtml = '<div id="myHRWidget">\
                                            <div class="myHR">\
                                                <div class="panel panel-default custom-box-warp clearfix">\
                                                    <h2 class="panel-title">Favorites</h2>\
                                                    <a href="#" class="myHRsetting" onclick="myHRsettingopen();"></a>\
                                                    <div class="myHRdropDown">\
                                                        <a href="#" class="myHRdropDownSetting" onclick="myHRsettingclose();"></a>\
                                                        <div class="myHRcontrol">\
                                                            <a href="" class="myHRfav">Favorites</a>\
                                                            <button class="myHRPref" type="button" onclick="javascript: SavePreferences();">​Apply​​​</button>\
                                                            <button class="myHRPrefcancel" type="button" onclick="javascript: cancelDropDownSelection();">Cancel</button>\
                                                            <div class="onoFF">\
                                                            <span class="on">All On</span>\
                                                            <label class="switch">\
                                                                     <input type="checkbox" id="chkboxOnOff" onclick="javascript: SelectDeSelectCheckBox();">\
                                                                     <div class="slider round"></div>\
                                                            </label>\
                                                            <span class="off">All Off</span>\
                                                            </div>\
                                                        </div><div class="myHRcontrolData"><ul id="myHRFav">{quicklaunch}</ul></div></div><div class="myHRicon" id="myFavTools">';

    siteUrl = _spPageContextInfo.siteAbsoluteUrl;
    context = new SP.ClientContext(siteUrl);
    user = context.get_web().get_currentUser();
    hostweb = context.get_web();
    iconsList = hostweb.get_lists().getByTitle(IconsListName);
    //linksList = hostweb.get_lists().getByTitle(LinksListName);
    preferencesList = hostweb.get_lists().getByTitle(PreferencesListName);
    context.load(user);
    context.load(iconsList);
    //context.load(linksList);
    context.load(preferencesList);
    context.load(hostweb);
    context.executeQueryAsync(onGetFavResourcesSuccess,onGetFavResourcesFail);
}

//On successful resource loading.
function onGetFavResourcesSuccess() {
    //username = user.get_title();
    //useremail = user.get_email();
    //webtitle = hostweb.get_title();
    iconsListId = iconsList.get_id();
    //linksListId = linksList.get_id();
    preferencesListId = preferencesList.get_id();
    //searchQueryText = "ListID:" + iconsListId;
    //$('#FavoritesToolsDiv').html("<h3>Retrieving Icons ...</h3>");
    getMyITToolsPreferences();
}

// This function is executed if the above call fails
function onGetFavResourcesFail(sender, args) {
    //alert('Failed to load resources. Error:' + args.get_message());
    CCI_Common.LogException(_spPageContextInfo.userId, 'Favorites Tools App', _spPageContextInfo.siteAbsoluteUrl, args.get_message());
}

//Gets favorites icons from list.
function getFavoriteIcons(myPreferencesJSONObject,onoff)
{
    if(myPreferencesJSONObject.length > 0)
    {
        myPreferencesId = myPreferencesJSONObject[0]["listitemid"];
        for(var i=0;i<myPreferencesJSONObject.length;i++)
        {
            var url = myPreferencesJSONObject[i]["url"];
            var imageurl = myPreferencesJSONObject[i]["imageurl"];
            var title = myPreferencesJSONObject[i]["title"];

            if(url.indexOf(siteUrl) > -1)
                searchResultsHtml += '<div class="col-md-2 col-xs-2 myHRicons"><a href="' + url + '" target="_blank"><img title="' + title + '" src="' + imageurl + '"/></a></div>';
            else
                searchResultsHtml += '<div class="col-md-2 col-xs-2 myHRicons"><a href="' + url + '"><img title="' + title + '" src="' + imageurl + '"/></a></div>';            
        }
    }
    searchResultsHtml += '</div>';
    //$('#FavoritesToolsDiv').html("<h3>Retreiving Links ...</h3>");
    //searchQueryText = "ListID:" + linksListId + ' RefinableInt01 > 0';
    //getLinks(myPreferencesJSONObject);
    searchResultsHtml += '</div></div></div>';
    //$('#FavoritesToolsDiv').html("<h3>Populating Drop Down ...</h3>");
    searchQueryText = "ListID:" + iconsListId + ' RefinableInt01 > 0';
    populateFavoritesDropDown(myPreferencesJSONObject,onoff);
}

//Populate Drop down icon list for user to select from.
function populateFavoritesDropDown(myPreferencesJSONObject,onoff)
{
    $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/contextinfo",
        type: "POST",
        headers: { "Accept": "application/json; odata=verbose"},
        success: function (data) {
            $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue);

            var headers = {
                "Accept": "application/json;odata=verbose",
                "content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }

            var endPointUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/search/postquery";
            var searchQuery = {
                'request': {
                    '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                    'Querytext': searchQueryText,
                    'RowLimit' : '20',
                    'SortList' : 
                    {
                        'results' : [
                            {
                                'Property':'RefinableInt01',
                                'Direction': '0'
                            }
                        ]
                    },
                    'SelectProperties' : {
                        'results' : [
                            'Title',
                            'ListItemID',
                            'CCI-ImagesOWSIMGE',
                            'RefinableString14',
                            'RefinableString13'
                        ]
                    }
                }
            };
            var call = jQuery.ajax({
                url: endPointUrl,
                type: "POST",
                data: JSON.stringify(searchQuery),
                headers: headers,
                dataType: 'json'
            });

            call.done(function (data, textStatus, jqXHR) {
                var queryResults = data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                if (queryResults.length > 0) {
                    var listItemsCounter = 0;
                    var webUrl = _spPageContextInfo.webServerRelativeUrl;

                    var searchResultsFavoriteHtml = '';
                    for (var i = 0; i < queryResults.length; i++) {
                        var r = queryResults[i];
                        var cells = r.Cells;
                        var title = '';
                        var itemId = '';
                        var url = '';
                        var imageurl = '';
                        var admindictated = '';

                        for (var x = 0; x < cells.results.length; x++) {
                            var c = cells.results[x];
                            switch(c.Key){
                                case "ListItemID": itemId = c.Value; break;
                                case "Title": title = c.Value; break;
                                case "RefinableString14": url = c.Value; break;
                                case "RefinableString13": admindictated = c.Value; break;
                                case "CCI-ImagesOWSIMGE": imageurl = c.Value; break;
                            }
                        }
                        
                        //Selecting myHR Tools checkboxes
                        var preSelected = false;
                        if (typeof (myPreferencesJSONObject) !== "undefined" && myPreferencesJSONObject !== null)
                        {
                            for(var k=0;k<myPreferencesJSONObject.length;k++)
                            {
                                if(parseInt(itemId) === parseInt(myPreferencesJSONObject[k]["id"]))
                                {
                                    preSelected = true;
                                    break;
                                }
                            }
                        }

                        if(imageurl.indexOf("src=") > -1)
                        {
                            var startPos = imageurl.indexOf("src=")+5;
                            var endPos;
                            if(imageurl.indexOf("width") > -1)
                                endPos = imageurl.indexOf("width")-2;
                            else
                                endPos = imageurl.indexOf("style")-2;

                            imageurl = imageurl.substring(startPos, endPos);
                        }

                        if(preSelected)
                            searchResultsFavoriteHtml = '<li><label class="switch"><input id="' + itemId + '" type="checkbox" name="' + url + '" value="' + imageurl + '" title="' + title + '" checked><div class="slider round"></div></label><label class="itemName">' + title + '</label></li>';
                        else
                            searchResultsFavoriteHtml = '<li><label class="switch"><input id="' + itemId + '" type="checkbox" name="' + url + '" value="' + imageurl + '" title="' + title + '"><div class="slider round"></div></label><label class="itemName">' + title + '</label></li>';
                        
                        //searchResultsFavoriteHtml = '<li><label class="switch"><input id="' + itemId + '" type="checkbox" name="' + url + '" value="' + imageurl + '" title="' + title + '"><div class="slider round"></div></label><label class="itemName">' + title + '</label></li>';
                        var toBeReplaced = "{quicklaunch}";
                        var position = searchResultsHtml.indexOf(toBeReplaced);
                        if (position > -1)
                            searchResultsHtml = [searchResultsHtml.slice(0, position), searchResultsFavoriteHtml, searchResultsHtml.slice(position)].join('');
                    }
                    
                    searchResultsHtml = searchResultsHtml.replace(/\{.*?\}\s?/g, '&nbsp;');
                    $('#FavoritesToolsDiv').html(searchResultsHtml);
                    var setStatus = onoff === "On"? true : false;
                    $('#chkboxOnOff').attr('checked', setStatus);
                }
                else
                {
                    //$('#HRToolsUserDiv').html("<h3>My HR Tools not found ...</h3>");
                }

            });
            call.fail(function (data) {
                CCI_Common.LogException(_spPageContextInfo.userId, 'Favorites Tools App', _spPageContextInfo.siteAbsoluteUrl, JSON.stringify(data));
            });
        },
        error: function (data, errorCode, errorMessage) {
            CCI_Common.LogException(_spPageContextInfo.userId, 'Favorites Tools App', _spPageContextInfo.siteAbsoluteUrl, errorMessage);
        }
    });
}

//Gets my preferences.
function getMyITToolsPreferences()
{
    var myPreferences = GetFromCache("myFavoritesToolsPrefCache");
    var myPrefAllOnOff = GetFromCache("myFavToolsPrefOnOff");
    //If cache is not empty, get the values from it.
    if (typeof (myPreferences) !== "undefined" && myPreferences !== null)
    {
        myPreferencesJSONObject = $.parseJSON(myPreferences);
        if(myPreferencesJSONObject.length > 0)
            getFavoriteIcons(myPreferencesJSONObject,myPrefAllOnOff);
        else
            getMyFavoritePreferencesFromList();
    }
    else
        getMyFavoritePreferencesFromList();
}

//Gets my preferences from list.
function getMyFavoritePreferencesFromList()
{
    var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('" + PreferencesListName + "')/Items?";
    requestUri += "$select=ID,CCI_x002d_AllOnOff,CCI_x002d_Preferences";
    requestUri += "&$filter=CCI_x002d_UserID eq " + _spPageContextInfo.userId;
    var requestHeaders = { "accept": "application/json;odata=verbose" };
    $.ajax({
        url: requestUri,
        contentType: "application/json;odata=verbose",
        headers: requestHeaders,
        success: onGetPreferencesSuccess,
        error: onError
    });
}

//Success method.
function onGetPreferencesSuccess(data, request) {
    var items = data.d.results;
    if(items.length > 0)
    {
        for (i = 0; i < items.length; i++) {
            var userPreferenceItem = items[i];
            myPreferencesId = userPreferenceItem.ID;
            var preferences = userPreferenceItem.CCI_x002d_Preferences;
            var onoff = userPreferenceItem.CCI_x002d_AllOnOff;
            SetToCache("myFavoritesToolsPrefCache", preferences);
            SetToCache("myFavToolsPrefOnOff", onoff);
            myPreferencesJSONObject = $.parseJSON(preferences);
            getFavoriteIcons(myPreferencesJSONObject,onoff);
        }
    }
    //else
    //{
    //    searchResultsHtml += '</div>';
    //    $('#FavoritesToolsDiv').html("<h3>Retreiving Links ...</h3>");
    //    searchQueryText = "ListID:" + linksListId + ' RefinableInt01 > 0';
    //    getLinks();
    //}
    searchResultsHtml += '</div></div></div>';
    $('#FavoritesToolsDiv').html("<h3>Populating Drop Down ...</h3>");
    searchQueryText = "ListID:" + iconsListId + ' RefinableInt01 > 0';
    populateFavoritesDropDown(myPreferencesJSONObject,onoff);
}

//Error method.
function onError(error) {
    if (error !== "undefined") {
        console.log(JSON.stringify(error));
        CCI_Common.LogException(_spPageContextInfo.userLoginName, "Favorites Tools App", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
    }
}

//Select Deselect checkboxes.
function SelectDeSelectCheckBox()
{
    var status = $("#chkboxOnOff").is(':checked');
    jQuery('#myHRFav input').each(function () {
        var chkbox = this;
        chkbox.checked= status;
    });
}

//Cancels the drop down selection.
function cancelDropDownSelection()
{
    //Get values from cache.
    var myPreferences = GetFromCache("myFavoritesToolsPrefCache");
    //If cache is not empty.
    if (typeof (myPreferences) !== "undefined" && myPreferences !== null)
    {
        myPreferencesJSONObject = $.parseJSON(myPreferences);
        if(myPreferencesJSONObject.length > 0)
        {
            var myPrefAllOnOff = GetFromCache("myFavToolsPrefOnOff");
            var setStatus = myPrefAllOnOff === "On"? true : false;
            jQuery('.switch input').each(function () {
                var chkbox1 = this;
                chkbox1.checked = setStatus;
            });
                
            if(!setStatus)
            {
                jQuery('#myHRFav input').each(function () {
                    var chkbox = this;
                    for(var i=0;i<myPreferencesJSONObject.length;i++)
                        if(parseInt(myPreferencesJSONObject[i]["id"]) === parseInt(chkbox.id))
                            chkbox.checked = true;
                });
            }
        }
        else
        {
            jQuery('#myHRFav input').each(function () {
                var chkbox = this;
                chkbox.checked = false;
            });
            $('#chkboxOnOff').attr('checked', false);
        }
    }
    myHRsettingclose();
}

//Saves Preferences to the list.
function SavePreferences()
{
    var myPreferences = '';
    var myPreferencesCount = 0;
    var validRequest = true;

    jQuery('#myHRFav input:checked').each(function () {
        myPreferencesCount+=1;
    });

    if(myPreferencesCount > 12)
    {
        alert("Please select up to 12 links to appear in your favorites.");
        validRequest=false;
    }

    if(validRequest)
    {
        var status = $("#chkboxOnOff").is(':checked');
        var AllOnOff = status === true ? "On" : "Off";

        if(myPreferencesId === 0)
        {
            var itemCreateInfo = new SP.ListItemCreationInformation();
            var oListItem = preferencesList.addItem(itemCreateInfo);

            oListItem.set_item('Title', 'My Favorites Preference!');
            oListItem.set_item('CCI_x002d_UserID', _spPageContextInfo.userId);
            oListItem.set_item('CCI_x002d_AllOnOff', AllOnOff);
            oListItem.update();
            context.load(oListItem);

            context.executeQueryAsync(
               function (sender, args) {
                   myPreferencesId = oListItem.get_id();
                   jQuery('#myHRFav input:checked').each(function () {
                       var selectedchkbox = this;
                       myPreferences+="{\"id\":" + selectedchkbox.id + ", \"title\":\"" + selectedchkbox.title + "\", \"url\":\"" + selectedchkbox.name + "\", \"imageurl\":\"" + $(this).val() + "\", \"listitemid\":\"" + myPreferencesId + "\"},";
                   });

                   myPreferences = myPreferences.substring(0,myPreferences.length-1);
                   myPreferences = '[' + myPreferences + ']';
                   oListItem.set_item('CCI_x002d_Preferences', myPreferences);
                   oListItem.update();
                   context.load(oListItem);

                   context.executeQueryAsync(
                      function (sender, args) {
                          SetToCache("myFavoritesToolsPrefCache", myPreferences);
                          SetToCache("myFavToolsPrefOnOff", AllOnOff);
                          alert("Favorites Saved successfully.");
                          refreshMyFavoriteSection(myPreferences);
                      },
                       onError
                     );
               },
               onError
             );
        }
        else
        {
            var oListItem = preferencesList.getItemById(myPreferencesId);
            jQuery('#myHRFav input:checked').each(function () {
                var selectedchkbox = this;
                myPreferences+="{\"id\":" + selectedchkbox.id + ", \"title\":\"" + selectedchkbox.title + "\", \"url\":\"" + selectedchkbox.name + "\", \"imageurl\":\"" + $(this).val() + "\", \"listitemid\":\"" + myPreferencesId + "\"},";
            });

            myPreferences = myPreferences.substring(0,myPreferences.length-1);
            myPreferences = '[' + myPreferences + ']';
            oListItem.set_item('CCI_x002d_AllOnOff', AllOnOff);
            oListItem.set_item('CCI_x002d_Preferences', myPreferences);
            oListItem.update();
            context.load(oListItem);

            context.executeQueryAsync(
               function (sender, args) {
                   SetToCache("myFavoritesToolsPrefCache", myPreferences);
                   SetToCache("myFavToolsPrefOnOff", AllOnOff);
                   alert("Favorites Saved successfully.");
                   refreshMyFavoriteSection(myPreferences);
               },
                onError
              );
        }
    }
}

//Refreshed the favorite pane and saving.
function refreshMyFavoriteSection(myPreferences)
{
    var searchFavResults = '';
    var myPreferencesJSONObject = $.parseJSON(myPreferences);
    for(var i=0;i<myPreferencesJSONObject.length;i++)
    {
        var url = myPreferencesJSONObject[i]["url"];
        var imageurl = myPreferencesJSONObject[i]["imageurl"];
        var title = myPreferencesJSONObject[i]["title"];

        if(url.indexOf(siteUrl) > -1)
            searchFavResults += '<div class="col-md-2 col-xs-2 myHRicons"><a href="' + url + '" target="_blank"><img title="' + title + '" src="' + imageurl + '"/></a></div>';
        else
            searchFavResults += '<div class="col-md-2 col-xs-2 myHRicons"><a href="' + url + '"><img title="' + title + '" src="' + imageurl + '"/></a></div>';            
    }
    $('#myFavTools').html(searchFavResults);
    myHRsettingclose();
}

//Saves item to cache.
function SetToCache(itemName,value) {
    if (typeof (Storage) !== "undefined") {
        window.sessionStorage.setItem(itemName, value);
    }
}

//Get item from cache.
function GetFromCache(itemName){
    if (typeof (Storage) !== "undefined") {
        if (window.sessionStorage.getItem(itemName) != null) {
            var result = window.sessionStorage.getItem(itemName);
            return result;
        }
    }
}

//Create a json string.
function CreateJsonString(name, array) {
    var jsonObj = [];
    for (var i = 0; i <= array.length - 1; i++) {
        item = {}
        item["Item"] = array[i];

        jsonObj.push(item);
    }
    return name + ":" + JSON.stringify(jsonObj);
}

//Get Links from list.
function getLinks(myPreferencesJSONObject)
{
    var headers = {
        "Accept": "application/json;odata=verbose",
        "content-Type": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val()
    }

    var endPointUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/search/postquery";
    var searchQuery = {
        'request': {
            '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
            'Querytext': searchQueryText,
            'RowLimit' : '6',
            'SortList' : 
            {
                'results' : [
                    {
                        'Property':'RefinableInt01',
                        'Direction': '0'
                    }
                ]
            },
            'SelectProperties' : {
                'results' : [
                    'Title',
                    'ListItemID',
                    'RefinableString14'
                ]
            }
        }
    };
    var call = jQuery.ajax({
        url: endPointUrl,
        type: "POST",
        data: JSON.stringify(searchQuery),
        headers: headers,
        dataType: 'json'
    });

    call.done(function (data, textStatus, jqXHR) {
        var queryResults = data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results;
        if (queryResults.length > 0) {
            var listItemsCounter = 0;
            var webUrl = _spPageContextInfo.webServerRelativeUrl;
            searchResultsHtml += '<div class="MyHRlinks"><ul>';
            for (var i = 0; i < queryResults.length; i++) {
                var r = queryResults[i];
                var cells = r.Cells;
                var title = '';
                var itemId = '';
                var url = '';

                for (var x = 0; x < cells.results.length; x++) {
                    var c = cells.results[x];
                    switch(c.Key){
                        case "ListItemID": itemId = c.Value; break;
                        case "Title": title = c.Value; break;
                        case "RefinableString14": url = c.Value; break;
                    }
                }
                searchResultsHtml += '<li><a href="' + url + '">' + title + '</a></li>';
            }

            searchResultsHtml += '</ul></div></div></div></div>';
            $('#FavoritesToolsDiv').html("<h3>Populating Drop Down ...</h3>");
            searchQueryText = "ListID:" + iconsListId + ' RefinableInt01 > 0';
            populateFavoritesDropDown(myPreferencesJSONObject);
        }
        else
        {
            $('#FavoritesToolsDiv').html("<h3>Favorites not found ...</h3>");
        }
    });
    call.fail(function (data) {
        CCI_Common.LogException(_spPageContextInfo.userId, 'Favorites Tools App', _spPageContextInfo.siteAbsoluteUrl, JSON.stringify(data));
    });
}

//Document ready method of JQuery.
$(document).ready(function () {
    $('#FavoritesToolsDiv').html("<h3>Loading Apps</h3>");
    loadFavResources();
});

</script>
<div id="FavoritesToolsDiv"></div>