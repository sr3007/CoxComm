'use strict';


var hostUrl = '/' + window.location.pathname.split('/')[1] + '/' + window.location.pathname.split('/')[2] + '/';
var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";

//Metadata headings for fixed Columns

var MetadataHeading_COE = "CCI_x002d_COE"; //"CCI-COE";
var MetadataHeading_Departments = "CCI_x002d_Departments"; //"CCI-Departments";
var MetadataHeading_Division = "CCI_x002d_Division"; //"CCI-Division";   CCI_x002d_Division
var MetadataHeading_Industry = "CCI_x002d_Industry"; //"CCI-Industry";
var MetadataHeading_Locations = "CCI_x002d_Locations"; //"CCI-Locations";
var MetadataHeading_Product = "CCI_x002d_Product"; //"CCI-Product";
var MetadataHeading_Topic = "CCI_x002d_Topics"; //"CCI-Topic";
var MetadataHeading_Companies = "CCI_x002d_Companies" //"CCI-Companies";
var MetadataHeading_Companies_blank = "Company_blank" //"Company blank";
var MetadataHeading_Product_blank = "Product";

var UserIDcustom = "CCI_x002d_UserID"; //CCI-Userid
var Recent_Channel = "CCI_x002d_RecentChannels" //CCI-RecentChannel


//Metadata headings for fixed Columns
/*
var MetadataHeading_COE = "COE"; //"COE";
var MetadataHeading_Departments = "Departments"; //"CCI-Departments";
var MetadataHeading_Division = "Division"; //"CCI-Division";   CCI_x002d_Division
var MetadataHeading_Industry = "Industry"; //"CCI-Industry";
var MetadataHeading_Locations = "Locations"; //"CCI-Locations";
var MetadataHeading_Product = "Product"; //"CCI-Product";
var MetadataHeading_Topic = "Topic"; //"CCI-Topic";
var MetadataHeading_Companies = "Companies" //"CCI-Companies";
var MetadataHeading_Companies_blank = "Company_blank" //"Company blank";
var MetadataHeading_Product_blank = "Product";

var UserIDcustom = "UserID"; //CCI-Userid
var Recent_Channel = "CCI_x002d_RecentChannel" //CCI-RecentChannel
*/


var MetadataHeadingChannel_Company = "Company"; // used for Company Channel 

//Metadata headings for First time loggedin user
var DefaultSetting_Trending = "Trending";
var DefaultSetting_Product = "Product";
var DefaultSetting_Location = "<Location>"; // Dynamic user location
var DefaultSetting_Department = "<Department>"; //Dynamic user department
var DefaultSetting_CoxBusiness = "Cox Business";
var DefaultSetting_Industry = "Industry";
//RefinableString109 - used for Recent Channel


//Variables
var NewsArticleGUID = '';
//var DefaultChannels = [];
var NewsPageLibrarySite = '';
//var NewsArticleKey = "CCINewsArticle";
var NewsArticleKey = "NewsArticlePagesLibrary";
var NewsPreferenceKey = "CCINewsPreference";
var NewsPageLibrarySourceSite = "NewsPageLibrarySourceSite";
var NewsListName = "CCI-NewsArticle";
var NewsPreferenceListName = "CCI-NewsPreference";
var NewsPreferencelistItem = '';
var UserPreferenceDataExist = 0;
var userProfileProperties;
var userWorkEmail;
var PreferredName;
var WorkPhone;
var curr_Location;
var curr_Department;
var RedirectUrl = "";
var NewsCarousalItems;
var NewsArticleListGUID;
var ChannelCount = 0; //used except "New" and "Company"
var _MainHeading;
var likesCount = 0;
var members = null;
var likeDisplay = true;
var RefinableString_fieldName;
var ItemIDCollection = '';
var ItemIDCollectionCount = 0;
var UserCompanies = '';
var headers = '';
var endPointUrl = '';
var call = '';
var tdData = '';
var listItemsCounter = 0;
var username;
var useremail;
var department;
var userlocation;
var coe;
var divisions;
var industry;
var product;
var topic;
var companies;
var NewsPreferenceList;
var articleList;
var NewsPreferenceListGUID;
var searchQueryText;
var hostweb;
var hostPagesLibraryweb;
var listGuid;
var listItemId;
var itemKey;
var listItemCollectionNewsGrid = [];
var contextNewsGridTiles;
var contextNewsArticlePagesLibrary;
var spcontext;
var userNG;
var siteUrl;
var scriptbase = _spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*---------------- Document ready method-----------------*/
$(document).ready(function () {
    $.getScript(scriptbase + "SP.js", function () {
        $.getScript(scriptbase + "SP.Taxonomy.js", function () {
            //$.getScript(scriptbase + "SP.UserProfiles.js", function () {
                $.getScript(scriptbase + "Reputation.js", function () {
                    $.getScript(scriptbase + "SP.RequestExecutor.js", loadResourcesNewsGrid);
                });
            //});
        });
    });
});
/*--------------End of Document ready method--------------*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function loadResourcesNewsGrid() {
    $("#flexiselDemo4").empty();

    $('#flexiselDemo4').trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');

    NewsCarousalItems = "";
    //contextNewsGridTiles = SP.ClientContext.get_current // Used for NewsPreference list
    contextNewsGridTiles = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
    hostweb = contextNewsGridTiles.get_web();
    //user = contextNewsGridTiles.get_web().get_currentUser();
    userNG = hostweb.get_currentUser();

    //NewsPreferenceList = hostweb.get_lists().getByTitle(NewsPreferenceListName);

    var NewsPreferenceGUID = CCI_Common.GetConfig(NewsPreferenceKey);
    NewsPreferenceList = hostweb.get_lists().getById(NewsPreferenceGUID);

    //articleList = hostweb.get_lists().getById(NewsArticleGUID);

    contextNewsGridTiles.load(userNG);
    //contextNewsGridTiles.load(articleList);
    contextNewsGridTiles.load(NewsPreferenceList);
    contextNewsGridTiles.executeQueryAsync(onGetResourcesNewsGridSuccess, onGetResourcesNewsGridFail);
}

    function onGetResourcesNewsGridSuccess() {

        //////////////////////////////////
        NewsPageLibrarySite = CCI_Common.GetConfig(NewsPageLibrarySourceSite);
        siteUrl = _spPageContextInfo.siteAbsoluteUrl + '/' + NewsPageLibrarySite + '/';
        contextNewsArticlePagesLibrary = new SP.ClientContext(siteUrl);
        hostPagesLibraryweb = contextNewsArticlePagesLibrary.get_web();
        NewsArticleGUID = CCI_Common.GetConfig(NewsArticleKey);
        /////////////////////////////////

        username = userNG.get_title();
        useremail = userNG.get_email();

        //NewsArticleListGUID = articleList.get_id(); // List GUID
        NewsArticleListGUID = CCI_Common.GetConfig(NewsArticleKey); // List GUID

        NewsPreferenceListGUID = NewsPreferenceList.get_id();

        getNewsPreferenceUserSpecific();
    }

    // This function is executed if the above call fails
    function onGetResourcesNewsGridFail(sender, args) {
        console.log('Failed to load resources. Error:' + args.get_message());
        CCI_Common.LogException(_spPageContextInfo.userId, 'NewsGrid:loadResourcesNewsGrid', _spPageContextInfo.siteAbsoluteUrl, args.get_message());
    }

    function getNewsPreferenceUserSpecific() {
        var queryNewsPreference = new SP.CamlQuery();
        //queryNewsPreference.set_viewXml("<View><Query><Where><Eq><FieldRef Name='" + UserIDcustom + "'/><Value Type='User'>" + _spPageContextInfo.userLoginName + "</Value></Eq></Where></Query></View>");
        queryNewsPreference.set_viewXml("<View><Query><Where><Eq><FieldRef Name=\"" + UserIDcustom + "\" LookupId=\"TRUE\" /><Value Type=\"Lookup\">" + _spPageContextInfo.userId + "</Value></Eq></Where></Query></View>");


        NewsPreferencelistItem = NewsPreferenceList.getItems(queryNewsPreference);
        //context.load(NewsPreferencelistItem);
        contextNewsGridTiles.load(NewsPreferencelistItem, 'Include(' + MetadataHeading_Companies + ',' + MetadataHeading_COE + ',' + MetadataHeading_Departments + ',' + MetadataHeading_Division + ',' + MetadataHeading_Industry + ',' + MetadataHeading_Locations + ',' + MetadataHeading_Product + ',' + MetadataHeading_Topic + ',' + Recent_Channel + ')');
        //contextNewsGridTiles.load(NewsPreferencelistItem);

        NewsCarousalItems += "<li class=\"nbs-flexisel-item flex-counter3\"><input type='button' id='btnnew' class='buttonLink active' value='New' onclick='getNewsgridResults(\"btnnew\", \"New\", \" \");'><span></span></li>";
        getNewsgridResults("btnnew", "New", " ");
        var peopleManager = new SP.UserProfiles.PeopleManager(contextNewsGridTiles);
        userProfileProperties = peopleManager.getMyProperties();
        contextNewsGridTiles.load(userProfileProperties);



        contextNewsGridTiles.executeQueryAsync(function () {

            //////////////////////////////////////////////////////////////////////////////////

            var taxEnumerator = NewsPreferencelistItem.getEnumerator();
            if (NewsPreferencelistItem.get_count() >= 1) {
                while (taxEnumerator.moveNext()) {
                    var currentTerm = taxEnumerator.get_current(); //Label
                    coe = currentTerm.get_item(MetadataHeading_COE);
                    department = currentTerm.get_item(MetadataHeading_Departments);
                    divisions = currentTerm.get_item(MetadataHeading_Division);
                    industry = currentTerm.get_item(MetadataHeading_Industry);
                    userlocation = currentTerm.get_item(MetadataHeading_Locations);
                    product = currentTerm.get_item(MetadataHeading_Product);
                    topic = currentTerm.get_item(MetadataHeading_Topic);
                    companies = currentTerm.get_item(MetadataHeading_Companies);
                    var RecentChannel = currentTerm.get_item(Recent_Channel);

                    // NewsCarousalItems += "<li class=\"nbs-flexisel-item flex-counter8\"><input type='button' id='btnTrending' class='buttonLink' value='Trending' onclick='getNewsgridResults(\"btnTrending\", \"Trending\", \"Trending\");'><span></span></li>";


                    createChannel(MetadataHeading_Companies, currentTerm, companies, RecentChannel);

                    curr_Location = CCI_Common.GetUserProfilePropertyValue('Location');
                    curr_Department = CCI_Common.GetUserProfilePropertyValue('Department');

                    if (curr_Location.toLowerCase().indexOf("error:") >= 0) {
                        curr_Location = userProfileProperties.get_userProfileProperties()['SPS-Location'];
                    }
                    if (curr_Department.toLowerCase().indexOf("error:") >= 0) {
                        curr_Department = userProfileProperties.get_userProfileProperties()['SPS-Department'];
                    }
                    //Load default channels
                    DefaultChannel1stTime(DefaultSetting_Trending);

                    /*DefaultChannel1stTime(DefaultSetting_Product);
                    if (curr_Location != undefined) {
                        if (curr_Location.trim().length > 0) {
                            if (userlocation.get_count() < 1) {
                                DefaultChannel1stTime(DefaultSetting_Location);
                            }
                        }
                    }
                    if (curr_Department != undefined) {
                        if (curr_Department.trim().length > 0) {
                            if (department.get_count() < 1) {
                                DefaultChannel1stTime(DefaultSetting_Department);
                            }
                        }
                    }
                    if (divisions.get_count() < 1) {
                        DefaultChannel1stTime(DefaultSetting_CoxBusiness);
                    }
                    if (industry.get_count() < 1) {
                        DefaultChannel1stTime(DefaultSetting_Industry);
                    }
                    */

                    /////////////////////////////////////////////////////////////////////////////////////////

                    createChannel(MetadataHeading_COE, currentTerm, coe, RecentChannel);
                    createChannel(MetadataHeading_Departments, currentTerm, department, RecentChannel);
                    createChannel(MetadataHeading_Division, currentTerm, divisions, RecentChannel);
                    createChannel(MetadataHeading_Industry, currentTerm, industry, RecentChannel);
                    createChannel(MetadataHeading_Locations, currentTerm, userlocation, RecentChannel);
                    //createChannel(MetadataHeading_Product, currentTerm, product, RecentChannel);  //Already added as default channels, so commented
                    createChannel(MetadataHeading_Topic, currentTerm, topic, RecentChannel);


                }

            }
            else {
                NewsCarousalItems += "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button' id='btnnew' class='buttonLink' value='Company' onclick='getNewsgridResults(\"btncompany\", \"Company\", \"Product\");'><span></span></li>";
                curr_Location = CCI_Common.GetUserProfilePropertyValue('Location');
                curr_Department = CCI_Common.GetUserProfilePropertyValue('Department');

                if (curr_Location.toLowerCase().indexOf("error:") >= 0) {
                    curr_Location = userProfileProperties.get_userProfileProperties()['SPS-Location'];
                }
                if (curr_Department.toLowerCase().indexOf("error:") >= 0) {
                    curr_Department = userProfileProperties.get_userProfileProperties()['SPS-Department'];
                }
                //Load default channels
                DefaultChannel1stTime(DefaultSetting_Trending);
                DefaultChannel1stTime(DefaultSetting_Product);
                if (curr_Location != undefined) {
                    if (curr_Location.trim().length > 0) {
                        DefaultChannel1stTime(DefaultSetting_Location);
                    }
                }
                if (curr_Department != undefined) {
                    if (curr_Department.trim().length > 0) {
                        DefaultChannel1stTime(DefaultSetting_Department);
                    }
                }
                DefaultChannel1stTime(DefaultSetting_CoxBusiness);
                DefaultChannel1stTime(DefaultSetting_Industry);
                /////////////////////////////////////////////////////////////////////////////////////////
            }

            $("#flexiselDemo4").append(NewsCarousalItems);
            flexiSliderReload();




            //////////////////////////////////////////////////////////////////////////////////

        }, function (sender, args) {
            console.log(args.get_message());
            CCI_Common.LogException(_spPageContextInfo.userId, 'NewsGrid:getNewsPreferenceUserSpecific', _spPageContextInfo.siteAbsoluteUrl, args.get_message());
        });
    }

    function getNewsgridResults(buttonid, fieldName, fieldValue) {
        ItemIDCollection = '';
        ItemIDCollectionCount = 0;
        headers = {
            "Accept": "application/json;odata=verbose",
            "content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        }

        NewsPageLibrarySite = CCI_Common.GetConfig(NewsPageLibrarySourceSite); //NewsArtifacts

        //endPointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/search/postquery";
        endPointUrl = _spPageContextInfo.webAbsoluteUrl + "/" + NewsPageLibrarySite + "/_api/search/postquery";

        /*------Remove and set Active class------*/
        $('#btnnew').removeClass("active");
        $('#btncompany').removeClass("active");
        $('#btnTrending').removeClass("active");
        for (var i = 0; i < ChannelCount; i++) {
            var btnid = "#btn" + i;
            $(btnid).removeClass("active");
        }
        buttonid = '#' + buttonid;
        $(buttonid).addClass("active");
        /*------End of remove and set Active class------*/


        if (fieldName == "New")     //RefinableString107 for Companies
        {
            searchQueryText = "ListID:" + NewsArticleListGUID + " contentclass:\"STS_ListItem\"";
        }
        else if (fieldName == MetadataHeading_Companies_blank)     //RefinableString107 for Companies
        {
            searchQueryText = "ListID:" + NewsArticleListGUID;

            if (UserCompanies != null) {
                if (UserCompanies != "") {
                    var companiesCount = UserCompanies.get_data().length;
                    //if (UserCompanies.length > 0) {
                    if (companiesCount > 0) {
                        //if (UserCompanies.get_count() > 0) {
                        //for (var j = 0; j < UserCompanies.get_count() ; j++) {
                        //   var ChannelName = UserCompanies.get_item(j).$0_1; //Label

                        for (var j = 0; j < companiesCount ; j++) {
                            var ChannelName = UserCompanies.get_data()[j].$0_1; //Label
                            if (j == 0) {
                                searchQueryText += " RefinableString108:" + ChannelName;
                            }
                            else {
                                searchQueryText += " OR RefinableString108:" + ChannelName;
                            }

                        }
                        //}
                    }
                }
            }
        }
        else if (fieldName == "Company") {

            //var fieldValueSplit = String(fieldValue).split(';');
            searchQueryText = "ListID:" + NewsArticleListGUID;
            searchQueryText += " RefinableString107:" + MetadataHeadingChannel_Company;
            searchQueryText += " OR RefinableString108:" + MetadataHeadingChannel_Company;

            if (UserCompanies != null) {
                if (UserCompanies != "") {
                    var companiesCount = UserCompanies.get_data().length;
                    //if (UserCompanies.length > 0) {
                    if (companiesCount > 0) {
                        //if (UserCompanies.get_count() > 0) {
                        //for (var j = 0; j < UserCompanies.get_count() ; j++) {
                        //   var ChannelName = UserCompanies.get_item(j).$0_1; //Label

                        for (var j = 0; j < companiesCount ; j++) {
                            var ChannelName = UserCompanies.get_data()[j].$0_1; //Label
                            searchQueryText += " OR RefinableString107:" + ChannelName;
                            searchQueryText += " OR RefinableString108:" + ChannelName;
                        }
                        //}
                    }
                }
            }



        }
        else if (fieldName == DefaultSetting_Trending) {

            searchQueryText = "ListID:" + NewsArticleListGUID;
            searchQueryText += " RefinableString10:0";
        }
        else if (fieldName == DefaultSetting_Product) {

            searchQueryText = "ListID:" + NewsArticleListGUID;
            searchQueryText += " RefinableString108";
        }
        else {
            if (fieldName == MetadataHeading_COE) {
                RefinableString_fieldName = "RefinableString103";
                //searchQueryText = "ListID:" + NewsArticleListGUID + "'&selectproperties='RefinableString103:" + fieldValue + "'";
            }
            if (fieldName == MetadataHeading_Departments) {
                RefinableString_fieldName = "RefinableString101";
            }
            if (fieldName == MetadataHeading_Division) {
                RefinableString_fieldName = "RefinableString105";
            }
            if (fieldName == MetadataHeading_Industry) {
                RefinableString_fieldName = "RefinableString106";
            }
            if (fieldName == MetadataHeading_Locations) {
                RefinableString_fieldName = "RefinableString102";
            }
            if (fieldName == MetadataHeading_Product) {
                RefinableString_fieldName = "RefinableString108";
            }
            if (fieldName == MetadataHeading_Topic) {
                RefinableString_fieldName = "RefinableString109";
            }
            searchQueryText = "ListID:" + NewsArticleListGUID + " " + RefinableString_fieldName + ":" + fieldValue;
        }
        if (fieldName == DefaultSetting_Trending) {
            searchQuerycallNewsGridTrending(searchQueryText);
        }
        else
        {
            searchQuerycallNewsGrid(searchQueryText);
        }

        call.done(function (data, textStatus, jqXHR) {

            $(document).trigger('function_GetListGuid_complete'); // used for flexisel carousal 

            var queryResults = data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results;

            tdData = "";
            $("#tdNewsArticle1").empty();
            $("#tdNewsArticle2").empty();
            $("#tdNewsArticle3").empty();
            $("#tdNewsArticle4").empty();
            $("#tdNewsArticle5").empty();
            $("#tdNewsArticle6").empty();
            $("#tdNewsArticle7").empty();
            $("#tdNewsArticle8").empty();
            $("#tdNewsArticle9").empty();

            if (queryResults.length == 0) {
                listItemsCounter = 0;
            }
            if (queryResults.length > 0) {
                listItemsCounter = 0;
                if (fieldName == "New") {
                    fillDivcellsNewsGrid(queryResults, "otherchannel", "New");
                }
                else if (fieldName == "Company") {
                    fillDivcellsNewsGrid(queryResults, "otherchannel", "Company");
                }
                else if (fieldName == MetadataHeading_Companies_blank)
                {
                    fillDivcellsNewsGrid(queryResults, "otherchannel", "Company");
                }
                else if (fieldName == "Trending") {
                    fillDivcellsNewsGrid(queryResults, "otherchannel", "Trending");
                }

                else {
                    fillDivcellsNewsGrid(queryResults, "otherchannel", fieldValue);
                }
            }
            if (queryResults.length < 9) // 
            {
                //Merge with Company result set to make it 9 items

                //var fieldValueSplit = String(UserCompanies).split(';');
                searchQueryText = "ListID:" + NewsArticleListGUID;
                searchQueryText += " RefinableString107:" + MetadataHeadingChannel_Company;
                searchQueryText += " OR RefinableString108:" + MetadataHeadingChannel_Company

                if (UserCompanies != null) {
                    if (UserCompanies != "") {
                        var companiesCount = UserCompanies.get_data().length;
                        if (companiesCount > 0) {
                            for (var j = 0; j < companiesCount ; j++) {
                                var ChannelName = UserCompanies.get_data()[j].$0_1; //Label
                                searchQueryText += " OR RefinableString107:" + ChannelName;
                                searchQueryText += " OR RefinableString108:" + ChannelName;
                            }
                        }
                    }
                }


                //searchQueryText += " RefinableString107:" + MetadataHeading_Product_blank;
                searchQueryText += " OR RefinableString108:" + MetadataHeading_Product_blank;

                searchQuerycallNewsGrid(searchQueryText);
                call.done(function (data, textStatus, jqXHR) {
                    var queryResults = data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                    fillDivcellsNewsGrid(queryResults, "company", "Company");

                });
            }

            //Like/UnLike
            for (var i = 0; i < listItemCollectionNewsGrid.length; i++) {
                var itemId = listItemCollectionNewsGrid[i];
                getLikeCountsforNewsGridTiles(itemId);
            }

            //End of LIke/UnLike

        });
        call.fail(function (data) {
            console.log("Failure" + JSON.stringify(data));
            CCI_Common.LogException(_spPageContextInfo.userId, 'NewsGrid:getNewsgridResults', _spPageContextInfo.siteAbsoluteUrl, JSON.stringify(data));
        });
    }

    /*---------------- Method used for Default Channel for 1st time Loggedin User------------------*/
    function DefaultChannel1stTime(_MainHeading) {
        if (_MainHeading == DefaultSetting_Location) {
            _MainHeading = curr_Location;
        }
        if (_MainHeading == DefaultSetting_Department) {
            _MainHeading = curr_Department;
        }
        if (_MainHeading.trim().length > 0) {

            if (_MainHeading == DefaultSetting_CoxBusiness) {

                NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + _MainHeading.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + _MainHeading + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + MetadataHeading_Division + "\", \"" + _MainHeading + "\" );'><span></span></li>";
            }
            else {
                NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + _MainHeading.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + _MainHeading + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MainHeading + "\", \"" + _MainHeading + "\" );'><span></span></li>";
            }
            ChannelCount++;
        }
    }
    /*---------------- End of Method used for Default Channel for 1st time Loggedin User-----------*/

    /*---------------- Method used for user preferred Channel------------------*/
    function createChannel(_MetadataHeading, currentTerm, _MetadataHeadingItems, RecentAddedItems) {
        if (_MetadataHeadingItems != undefined || _MetadataHeadingItems != null || _MetadataHeadingItems.length > 0) {
            var ItemTitle = currentTerm.get_item(_MetadataHeading);

            if (_MetadataHeading == MetadataHeading_Companies) {
                if (_MetadataHeadingItems.get_count() == 0) {
                    ItemTitle = currentTerm.get_item(MetadataHeading_Product);
                    NewsCarousalItems += "<li class=\"nbs-flexisel-item flex-counter7\"><input type='button' id='btncompany' class='buttonLink' value='Company'  onclick='getNewsgridResults(\"btncompany\", \"" + MetadataHeading_Companies_blank + "\", \"" + ItemTitle + "\");'><span></span></li>";
                }
                else {
                    NewsCarousalItems += "<li class=\"nbs-flexisel-item flex-counter7\"><input type='button' id='btncompany' class='buttonLink' value='Company'  onclick='getNewsgridResults(\"btncompany\", \"Company\", \"" + ItemTitle + "\");'><span></span></li>";
                }
                UserCompanies = ItemTitle;
            }
            else {
                for (var j = 0; j < ItemTitle.get_count() ; j++) {
                    var ChannelName = ItemTitle.get_item(j).$0_1; //Label
                    if (ChannelName != undefined || ChannelName != null || ChannelName.length > 0) {

                        if (RecentAddedItems != undefined || RecentAddedItems != null) {
                            var RecentAddedItemsSplit = RecentAddedItems.split(',');

                            if (RecentAddedItemsSplit.indexOf(ChannelName) > -1) {
                                NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + ChannelName.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink recent' value='" + ChannelName + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MetadataHeading + "\", \"" + ChannelName + "\" );'><span></span></li>";
                            }
                            else {
                                NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + ChannelName.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + ChannelName + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MetadataHeading + "\", \"" + ChannelName + "\" );'><span></span></li>";
                            }
                        }
                        else {
                            NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + ChannelName.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + ChannelName + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MetadataHeading + "\", \"" + ChannelName + "\" );'><span></span></li>";
                        }
                        ChannelCount++;
                    }
                }
            }
        }
    }
    /*---------------- End of Method used for user preferred Channel-----------*/

    /*---------------- Method used for Search Query Filter setting------------------*/
    function searchQuerycallNewsGrid(searchQueryText) {
        var searchQuery = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': searchQueryText,
                'RowLimit': '9',
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableDate01',
                            'Direction': '1'
                        },
                        {
                            'Property': 'RefinableDate03',
                            'Direction': '0'
                        },
                        {
                            'Property': 'RefinableInt00',
                            'Direction': '0'
                        }
                    ]
                },
                'SelectProperties': {
                    'results': [
                        'Title',
                        //'RefinableString11',
                        'CCI-NewsArticleImageOWSIMGE',
                        'CCI-DescriptionOWSMTXT',
                        'ListItemID'
                    ]
                }
            }
        };

        call = jQuery.ajax({
            url: endPointUrl,
            type: "POST",
            data: JSON.stringify(searchQuery),
            headers: headers,
            dataType: 'json'
        });
    }

    function searchQuerycallNewsGridTrending(searchQueryText) {
        var searchQuery = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': searchQueryText,
                'RowLimit': '9',
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableInt00',
                            'Direction': '1'
                        },
                        {
                            'Property': 'RefinableDate01',
                            'Direction': '0'
                        },
                        {
                            'Property': 'RefinableDate03',
                            'Direction': '0'
                        }
                    ]
                },
                'SelectProperties': {
                    'results': [
                        'Title',
                        //'RefinableString11',
                        'CCI-NewsArticleImageOWSIMGE',
                        'CCI-DescriptionOWSMTXT',
                        'ListItemID'
                    ]
                }
            }
        };

        call = jQuery.ajax({
            url: endPointUrl,
            type: "POST",
            data: JSON.stringify(searchQuery),
            headers: headers,
            dataType: 'json'
        });
    }
    /*---------------- End of Method used for Search Query Filter setting------------------*/

    /*---------------- Method used to fill Grid cells------------------*/
    function fillDivcellsNewsGrid(queryResults, mergeChannel, fieldValue) {
        for (var i = 0; i < queryResults.length; i++) {
            tdData = "";
            var r = queryResults[i];
            var cells = r.Cells;
            var title = '';
            var pictureURL = '';
            var itemId = '';
            var NewsShortDescription = '';

            for (var x = 0; x < cells.results.length; x++) {
                var c = cells.results[x];
                switch (c.Key) {
                    case "ListItemID": itemId = c.Value; break;
                        //case "RefinableString11": pictureURL = c.Value; break;
                    case "CCI-NewsArticleImageOWSIMGE": pictureURL = c.Value; break;
                    case "CCI-DescriptionOWSMTXT": NewsShortDescription = c.Value; break;
                        //case "CCI-Description": NewsShortDescription = c.Value; break;
                    case "Title": title = c.Value; break;
                }
            }
            var flagforLikes = 0;
            if (mergeChannel == "otherchannel") {
                ItemIDCollection += '|' + itemId + '|';
                ItemIDCollectionCount++;
            }
            else {
                flagforLikes = 0;
                if (ItemIDCollection.indexOf('|' + itemId + '|') != -1) {
                    flagforLikes = 1;
                }
            }
            if (flagforLikes == 0) {
                if (pictureURL != null) {
                    var startPos = pictureURL.indexOf("src=") + 5;
                    var endPos = pictureURL.indexOf("style") - 2;
                    pictureURL = pictureURL.substring(startPos, endPos);
                    if (pictureURL.indexOf("width") > -1)
                        pictureURL = pictureURL.substring(0, pictureURL.indexOf("width") - 2);
                    // pictureURL = pictureURL + "?RenditionID=8";
                    pictureURL = pictureURL;
                }
                listItemCollectionNewsGrid[listItemsCounter] = itemId;

                RedirectUrl = SP.ClientContext.get_current().get_url() + "/pages/NewsArticle.aspx?ListItemID=" + itemId + "&morelinks=yes&Source=NewsGrid&NewsChannel=" + fieldValue;

                //if (title.length > 43) {
                if (title.length > 83) {
                    title = title.substring(0, 83) + "...";
                }
                if (NewsShortDescription != null) {
                    if (NewsShortDescription.length > 196) {
                        NewsShortDescription = NewsShortDescription.substring(0, 196) + " ...";
                    }
                }
                else {
                    NewsShortDescription = "";
                }
                likesCount = 0;
                members = null;
                tdData = "<h3 class=\"mob_accordian\">" + title + "</h3>" +
            "<div class=\"box_accordian\"><div class=\"slide_image\"><a href='" + RedirectUrl + "'><image class=\"img-responsive\" Title='" + NewsShortDescription + " ' src='" + pictureURL + "'/></a></div>";
                tdData += "<div class=\"slide_section\">";
                tdData +=
                     "<div class='slide_like'><a class='likecount' id='NewsGridlikecount" + itemId + "'>" + likesCount + "</a>" +
                            "<a href='#' class='like' onclick=\"javascript: LikePage('{" + NewsArticleListGUID + "}', '" + itemId + "','NewsGrid')\">" +
                                   " <i class='fa fa-thumbs-up'></i></a>" +
                                   "<a href=\"#\" class=\"LikeButton\" id=\"NewsGridlikebutton" + itemId + "\"  style=\"display:none;\">" + likeDisplay + "</a></div>" +
                                   "<div class='overlay'> <a href='" + RedirectUrl + "' class='expand'>" + NewsShortDescription + "</a></div></div></div>";

                if (listItemsCounter == 0) {
                    $("#tdNewsArticle1").append(tdData);
                } if (listItemsCounter == 1) {
                    $("#tdNewsArticle2").append(tdData);
                } if (listItemsCounter == 2) {
                    $("#tdNewsArticle3").append(tdData);
                } if (listItemsCounter == 3) {
                    $("#tdNewsArticle4").append(tdData);
                } if (listItemsCounter == 4) {
                    $("#tdNewsArticle5").append(tdData);
                } if (listItemsCounter == 5) {
                    $("#tdNewsArticle6").append(tdData);
                } if (listItemsCounter == 6) {
                    $("#tdNewsArticle7").append(tdData);
                } if (listItemsCounter == 7) {
                    $("#tdNewsArticle8").append(tdData);
                } if (listItemsCounter == 8) {
                    $("#tdNewsArticle9").append(tdData);
                }
                listItemsCounter++;
            }
        }
        for (var i = 0; i < listItemCollectionNewsGrid.length; i++) {
            var itemId = listItemCollectionNewsGrid[i];
            getLikeCountsforNewsGridTiles(itemId);


        }
    }
    /*---------------- End of Method used to fill Grid cells------------------*/

    /*---------------- Method to Get & Set Like count------------------*/

    function getLikeCountsforNewsGridTiles(itemId) {
        var likebuttonid = "NewsGridlikebutton" + itemId;
        var likecountid = "NewsGridlikecount" + itemId;
        contextNewsArticlePagesLibrary = new SP.ClientContext(siteUrl);
        hostPagesLibraryweb = contextNewsArticlePagesLibrary.get_web();
        articleList = hostPagesLibraryweb.get_lists().getById(NewsArticleGUID);

        var oListItem1 = articleList.getItemById(itemId);
        contextNewsArticlePagesLibrary.load(articleList);
        contextNewsArticlePagesLibrary.load(oListItem1, "LikedBy", "ID", "LikesCount");
        contextNewsArticlePagesLibrary.executeQueryAsync(
            function () {
                var likeDisplay = true;
                var result = '';
                var $v_0 = oListItem1.get_item('LikedBy');
                var likesCountInfo = oListItem1.get_item('LikesCount');
                if (!SP.ScriptHelpers.isNullOrUndefined($v_0)) {
                    for (var $v_1 = 0, $v_2 = $v_0.length; $v_1 < $v_2; $v_1++) {
                        var $v_3 = $v_0[$v_1];
                        if ($v_3.get_lookupId() === _spPageContextInfo.userId) {
                            likeDisplay = false;
                        }
                    }
                }
                else
                    likesCountInfo = 0;

                ChangeNewsGridLikeText(likeDisplay, likesCountInfo, likebuttonid, likecountid);
            },
            Function.createDelegate(this, onQueryFailed));
    }

    function ChangeNewsGridLikeText(like, count, likebuttonid, likecountid) {
        if (like) {
            $("#" + likebuttonid).text('Like');
        }
        else {
            $("#" + likebuttonid).text('Unlike');
        }

        var htmlstring = String(count);
        var htmlstring1 = String(count);
        if (count > 0) {
            $("#" + likecountid).html(htmlstring)
        }
        else {
            $("#" + likecountid).html(htmlstring1);
        }
    }


    function onQueryFailed(sender, args) {
        console.log('Failed to get likes. Error:' + args.get_message());
        CCI_Common.LogException(_spPageContextInfo.userId, 'NewsGrid:Failed to get likes', _spPageContextInfo.siteAbsoluteUrl, args.get_message());
    }
/*---------------- End of Method to Get & Set Like count------------------*/