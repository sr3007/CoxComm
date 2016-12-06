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

var UserIDcustom = "CCI_x002d_Userid"; //CCI-Userid
var Recent_Channel = "CCI_x002d_RecentChannel" //CCI-RecentChannel
var MetadataHeadingChannel_Company = "Company"; // used for Company Channel 

//Metadata headings for First time loggedin user
var DefaultSetting_Trending = "Trending";
var DefaultSetting_Product = "Products";
var DefaultSetting_Location = "<Location>"; // Dynamic user location
var DefaultSetting_Department = "<Department>"; //Dynamic user department
var DefaultSetting_CoxBusiness = "Cox Business";
var DefaultSetting_Industry = "Industry";
//RefinableString109 - used for Recent Channel


//Variables
var NewsListName = "News Article";
var NewsPreferenceListName = "NewsPreference";
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
var listGuid;
var listItemId;
var itemKey;
var listItemCollectionNewsGrid = [];
var contextNewsGrid;
var spcontext;
var user;
var scriptbase = _spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*---------------- Document ready method-----------------*/
$(document).ready(function () {
    $.getScript(scriptbase + "SP.js", function () {
        $.getScript(scriptbase + "SP.Taxonomy.js", function () {
            $.getScript(scriptbase + "SP.UserProfiles.js", function () {
                 $.getScript(scriptbase + "Reputation.js", function () {
                     $.getScript(scriptbase + "SP.RequestExecutor.js", loadResourcesNewsGrid);
                });
            });
        });
    });
});
/*--------------End of Document ready method--------------*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function loadResourcesNewsGrid() {
    $("#flexiselDemo4").empty();
	$('#flexiselDemo4').trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
    NewsCarousalItems = "";
    contextNewsGrid = SP.ClientContext.get_current();
    user = contextNewsGrid.get_web().get_currentUser();
    hostweb = contextNewsGrid.get_web();
    NewsPreferenceList = hostweb.get_lists().getByTitle(NewsPreferenceListName);
    articleList = hostweb.get_lists().getByTitle(NewsListName);
    contextNewsGrid.load(user);
    contextNewsGrid.load(articleList);
    contextNewsGrid.load(NewsPreferenceList);
    contextNewsGrid.executeQueryAsync(onGetResourcesNewsGridSuccess, onGetResourcesNewsGridFail);
}

function onGetResourcesNewsGridSuccess() {
    username = user.get_title();
    useremail = user.get_email();
    NewsArticleListGUID = articleList.get_id(); // List GUID
    NewsPreferenceListGUID = NewsPreferenceList.get_id();
    getNewsPreferenceUserSpecific();
}

// This function is executed if the above call fails
function onGetResourcesNewsGridFail(sender, args) {
    alert('Failed to load resources. Error:' + args.get_message());
}

function getNewsPreferenceUserSpecific() {
    var queryNewsPreference = new SP.CamlQuery();
   // queryNewsPreference.set_viewXml("<View><Query><Where><Eq><FieldRef Name='UserID'/><Value Type='User'>" + _spPageContextInfo.userLoginName + "</Value></Eq></Where></Query></View>");
    queryNewsPreference.set_viewXml("<View><Query><Where><Eq><FieldRef Name='" + UserIDcustom + "'/><Value Type='User'>" + _spPageContextInfo.userLoginName + "</Value></Eq></Where></Query></View>");

    var NewsPreferencelistItem = NewsPreferenceList.getItems(queryNewsPreference);
    //context.load(NewsPreferencelistItem);
    contextNewsGrid.load(NewsPreferencelistItem, 'Include(' + MetadataHeading_Companies + ',' + MetadataHeading_COE + ',' + MetadataHeading_Departments + ',' + MetadataHeading_Division + ',' + MetadataHeading_Industry + ',' + MetadataHeading_Locations + ',' + MetadataHeading_Product + ',' + MetadataHeading_Topic + ',' + Recent_Channel + ')');

    NewsCarousalItems = "<li class=\"nbs-flexisel-item flex-counter3\"><input type='button' id='btnnew' class='buttonLink active' value='New' onclick='getNewsgridResults(\"btnnew\", \"New\", \" \");'></li>";
    contextNewsGrid.executeQueryAsync(function () {
        getNewsgridResults("btnnew", "New", " ");

        var taxEnumerator = NewsPreferencelistItem.getEnumerator();
        if(NewsPreferencelistItem.get_count() >= 1)
        {
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

                createChannel(MetadataHeading_Companies, currentTerm, companies, RecentChannel);
                createChannel(MetadataHeading_COE, currentTerm, coe, RecentChannel);
                createChannel(MetadataHeading_Departments, currentTerm, department, RecentChannel);
                createChannel(MetadataHeading_Division, currentTerm, divisions, RecentChannel);
                createChannel(MetadataHeading_Industry, currentTerm, industry, RecentChannel);
                createChannel(MetadataHeading_Locations, currentTerm, userlocation, RecentChannel);
                createChannel(MetadataHeading_Product, currentTerm, product, RecentChannel);
                createChannel(MetadataHeading_Topic, currentTerm, topic, RecentChannel);
            }
        }
        else {
            NewsCarousalItems += "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button' id='btnnew' class='buttonLink' value='Company' onclick='getNewsgridResults(\"btncompany\", \"Company\", \"Product\");'></li>";
            getUserPropertiesNewsGrid();
        }
        $("#flexiselDemo4").append(NewsCarousalItems);
        flexiSliderReload();

    }, function (sender, args) {
        console.log(args.get_message());
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
    endPointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/search/postquery";

    /*------Remove and set Active class------*/
    $('#btnnew').removeClass("active");
    $('#btncompany').removeClass("active");
    for (var i = 0; i < ChannelCount; i++) {
        var btnid = "#btn" + i;
        $(btnid).removeClass("active");
    }
    buttonid = '#' + buttonid;
    $(buttonid).addClass("active");
    /*------End of remove and set Active class------*/


    if (fieldName == "New")     //RefinableString107 for Companies
    {
        searchQueryText = "ListID:" + NewsArticleListGUID;
    }
    else if (fieldName == MetadataHeading_Companies_blank)     //RefinableString107 for Companies
    {
        searchQueryText = "ListID:" + NewsArticleListGUID;
        if (UserCompanies != null) {
            if (UserCompanies.get_count() > 0) {
                for (var j = 0; j < UserCompanies.get_count() ; j++) {
                    var ChannelName = UserCompanies.get_item(j).$0_1; //Label
                    searchQueryText += " RefinableString108:" + ChannelName;
                }
            }
        }
    }
    else if (fieldName == "Company")
    {
 
        //var fieldValueSplit = String(fieldValue).split(';');
        searchQueryText = "ListID:" + NewsArticleListGUID;
        searchQueryText += " RefinableString107:" + MetadataHeadingChannel_Company;

        if (UserCompanies != null) {
            if (UserCompanies.get_count() > 0) {
                for (var j = 0; j < UserCompanies.get_count() ; j++) {
                    var ChannelName = UserCompanies.get_item(j).$0_1; //Label
                    searchQueryText += " RefinableString107:" + ChannelName;
                }
            }
        }
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

    searchQuerycallNewsGrid(searchQueryText);

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

        if (queryResults.length > 0) {
            listItemsCounter = 0;
            fillDivcellsNewsGrid(queryResults, "otherchannel");
        }
        if (queryResults.length < 9) // 
        {
            //Merge with Company result set to make it 9 items


   
            //var fieldValueSplit = String(UserCompanies).split(';');
            searchQueryText = "ListID:" + NewsArticleListGUID;
            searchQueryText += " RefinableString107:" + MetadataHeadingChannel_Company;


            for (var j = 0; j < UserCompanies.get_count() ; j++) {
                var ChannelName = UserCompanies.get_item(j).$0_1; //Label
                searchQueryText += " RefinableString107:" + ChannelName;
                searchQueryText += " RefinableString108:" + ChannelName;
            }
            //searchQueryText += " RefinableString107:" + MetadataHeading_Product_blank;
            searchQueryText += " RefinableString108:" + MetadataHeading_Product_blank;

            searchQuerycallNewsGrid(searchQueryText);
            call.done(function (data, textStatus, jqXHR) {
                var queryResults = data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                fillDivcellsNewsGrid(queryResults, "company");

            });
           // ItemIDCollection = '';
            //ItemIDCollectionCount = 0;
        }
    });
    call.fail(function (data) {
        alert("Failure" + JSON.stringify(data));
    });
}

/*--------------Method used to get user profile properties--------------*/
function getUserPropertiesNewsGrid() {
   var clientContext = new SP.ClientContext.get_current();
   var peopleManager = new SP.UserProfiles.PeopleManager(clientContext);
   userProfileProperties = peopleManager.getMyProperties();
   clientContext.load(userProfileProperties);
   clientContext.executeQueryAsync(onRequestSuccess, onRequestFail);
}
function onRequestSuccess() {
    console.log(userProfileProperties.get_userProfileProperties()['WorkEmail']);
    console.log(userProfileProperties.get_userProfileProperties()['PreferredName']);
    console.log(userProfileProperties.get_userProfileProperties()['WorkPhone']);
    console.log(userProfileProperties.get_userProfileProperties()['Location']);
    console.log(userProfileProperties.get_userProfileProperties()['Department']);

    userWorkEmail = userProfileProperties.get_userProfileProperties()['WorkEmail'];
    PreferredName = userProfileProperties.get_userProfileProperties()['PreferredName'];
    WorkPhone = userProfileProperties.get_userProfileProperties()['WorkPhone'];
    curr_Location = userProfileProperties.get_userProfileProperties()['Location'];
    curr_Department = userProfileProperties.get_userProfileProperties()['Department'];

    //Load default channels
    DefaultChannel1stTime(DefaultSetting_Trending);
    DefaultChannel1stTime(DefaultSetting_Product);
    DefaultChannel1stTime(DefaultSetting_Location);
    DefaultChannel1stTime(DefaultSetting_Department);
    DefaultChannel1stTime(DefaultSetting_CoxBusiness);
    DefaultChannel1stTime(DefaultSetting_Industry);
}
function onRequestFail(sender, args) { alert(args.get_message()); }
/*--------------End of Method used to get user profile properties--------------*/

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

            NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + _MainHeading.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + _MainHeading + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + MetadataHeading_Division + "\", \"" + _MainHeading + "\" );'></li>";
        }
        else {
            NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + _MainHeading.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + _MainHeading + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MainHeading + "\", \"" + _MainHeading + "\" );'></li>";
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
            if (_MetadataHeadingItems.get_count() == 0)
            {
                ItemTitle = currentTerm.get_item(MetadataHeading_Product);
                NewsCarousalItems += "<li class=\"nbs-flexisel-item flex-counter7\"><input type='button' id='btncompany' class='buttonLink' value='Company'  onclick='getNewsgridResults(\"btncompany\", \"" + MetadataHeading_Companies_blank + "\", \"" + ItemTitle + "\");'></li>";
            }
            else
            {
                NewsCarousalItems += "<li class=\"nbs-flexisel-item flex-counter7\"><input type='button' id='btncompany' class='buttonLink' value='Company'  onclick='getNewsgridResults(\"btncompany\", \"Company\", \"" + ItemTitle + "\");'></li>";
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
                            NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + ChannelName.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink recent' value='" + ChannelName + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MetadataHeading + "\", \"" + ChannelName + "\" );'></li>";
                        }
                        else {
                            NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + ChannelName.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + ChannelName + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MetadataHeading + "\", \"" + ChannelName + "\" );'></li>";
                        }
                    }
                    else {
                        NewsCarousalItems += "<li class=\"nbs-flexisel-item  flex-counter" + ChannelName.length + "\"><input type='button' id='btn" + ChannelCount + "' class='buttonLink' value='" + ChannelName + "' onclick='getNewsgridResults(\"" + 'btn' + ChannelCount + "\", \"" + _MetadataHeading + "\", \"" + ChannelName + "\" );'></li>";
                    }
                    ChannelCount++;
                }
            }
        }
    }
}
/*---------------- End of Method used for user preferred Channel-----------*/

/*---------------- Method used for Search Query Filter setting------------------*/
function searchQuerycallNewsGrid(searchQueryText)
{
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
                    }
                ]
            },
            'SelectProperties': {
                'results': [
                    'Title',
                    'RefinableString11',
                    'CCI-ShortDescriptionOWSMTXT',
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
function fillDivcellsNewsGrid(queryResults, mergeChannel)
{
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
                case "RefinableString11": pictureURL = c.Value; break;
                case "CCI-ShortDescriptionOWSMTXT": NewsShortDescription = c.Value; break;
                case "Title": title = c.Value; break;
            }
        }
        var flagforLikes = 0;
        if (mergeChannel == "otherchannel") {
            ItemIDCollection += '|' + itemId + '|';
            ItemIDCollectionCount++;
        }
        else
        {
            flagforLikes = 0;
            if (ItemIDCollection.indexOf('|' + itemId + '|') != -1) {
                flagforLikes = 1;
            }
        }
        if (flagforLikes == 0) {
            var startPos = pictureURL.indexOf("src=") + 5;
            var endPos = pictureURL.indexOf("style") - 2;
            pictureURL = pictureURL.substring(startPos, endPos);
            if (pictureURL.indexOf("width") > -1)
                pictureURL = pictureURL.substring(0, pictureURL.indexOf("width") - 2);
            pictureURL = pictureURL + "?RenditionID=4";
            listItemCollectionNewsGrid[listItemsCounter] = itemId;

            //RedirectUrl = SP.ClientContext.get_current().get_url() + "/pages/NewsArticle.aspx?ListItemID=" + itemId + "&morelinks=yes&" + fieldName + "=" + fieldValue;
            RedirectUrl = SP.ClientContext.get_current().get_url() + "/pages/NewsArticle.aspx?ListItemID=" + itemId + "&morelinks=yes";

            if (title.length > 20) {
                title = title.substring(0, 20) + "...";
            }
            if (NewsShortDescription.length > 60) {
                NewsShortDescription = NewsShortDescription.substring(0, 60) + "...";
            }
            likesCount = 0;
            members = null;
            tdData = "<h3 class=\"mob_accordian\">" + title + "</h3>" +
        "<div class=\"box_accordian\"><a href='" + RedirectUrl + "'><image class=\"img-responsive\" Title='" + NewsShortDescription + " ' src='" + pictureURL +"'/></a>";
            tdData += "<div>";
            tdData += 
                 "<a class='likecount' id='NewsGridlikecount" + itemId + "'>" + likesCount + "</a>" +
                        "<a href='#' class='like' onclick=\"javascript: LikePage('{" + NewsArticleListGUID + "}', '" + itemId + "','NewsGrid')\">" +
                               " <i class='fa fa-thumbs-up'></i></a>" +
                               "<a href=\"#\" class=\"LikeButton\" id=\"NewsGridlikebutton" + itemId + "\"  style=\"display:none;\">" + likeDisplay + "</a>" +
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
        getLikeCountsforNewsGrid(itemId); 
    }
}
/*---------------- End of Method used to fill Grid cells------------------*/

/*---------------- Method to Get & Set Like count------------------*/
function getLikeCountsforNewsGrid(itemId) {
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Counter\'>' + itemId + '</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');

    var collListItem = articleList.getItems(camlQuery);
    contextNewsGrid.load(collListItem);
    likesCount = 0;
    contextNewsGrid.executeQueryAsync(
        function () {
            likeDisplay = true;
            var result = '';
            var listItemEnumerator = collListItem.getEnumerator();
            while (listItemEnumerator.moveNext()) {
                var oListItem = listItemEnumerator.get_current();
                likesCount = oListItem.get_item('LikesCount');
                members = oListItem.get_item('LikedBy');
                var likeDisplay = true;
                var result = '';
                if (members != null) {
                    for (var i = 0; i < members.length; i++) {
                        var member = members[i];
                        if (member.get_email().trim().toLowerCase() === _spPageContextInfo.userLoginName) {
                            //display unlike  
                            likeDisplay = false;
                        }
                    }
                }
                var like = '';
                if (likeDisplay) {
                    like = 'Like';
                }
                else {
                    like = 'Unlike';
                }
                
            }
            ChangeNewsGridLikeText(likeDisplay, likesCount, "NewsGridlikebutton" + itemId, "NewsGridlikecount" + itemId);
            //ChangeLikeText(likeDisplay, likesCount, "newsarticle");
            //ChangeLikeText(likeDisplay, likesCount, "TrendingNews");
            //ChangeLikeText(likeDisplay, likesCount, "NewsGrid");
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
    alert('Failed to get likes. Error:' + args.get_message());
}
/*---------------- End of Method to Get & Set Like count------------------*/