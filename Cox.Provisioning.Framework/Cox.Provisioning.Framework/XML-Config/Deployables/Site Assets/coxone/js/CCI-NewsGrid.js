'use strict';


var hostUrl = '/' + window.location.pathname.split('/')[1] + '/' + window.location.pathname.split('/')[2] + '/';
var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";

//Metadata headings for fixed Columns
var MetadataHeading1 = "COE";
var MetadataHeading2 = "Departments";
var MetadataHeading3 = "Division";
var MetadataHeading4 = "Industry";
var MetadataHeading5 = "Locations";
var MetadataHeading6 = "Product";
var MetadataHeading7 = "Topic";
var MetadataHeading8 = "Companies";

//Metadata headings for First time loggedin user
var DefaultSetting1 = "Trending";
var DefaultSetting2 = "Products";
var DefaultSetting3 = "<Location>"; // Dynamic user location
var DefaultSetting4 = "<Department>"; //Dynamic user department
var DefaultSetting5 = "Cox Business";
var DefaultSetting6 = "Industry";

//Variables
var UserPreferenceDataExist = 0;
var userProfileProperties;
var userWorkEmail;
var PreferredName;
var WorkPhone;
var curr_Location;
var curr_Department;
var RedirectUrl = "";
var flgLearnMore = 0;
var NewsCarousalItems;
var ListGUIDNewsArticle;
var ChannelCount = 0; //used except "New" and "Company"

/*---------------- Document ready method-----------------*/
$(document).ready(function () {
    $.getScript(scriptbase + "SP.js", function () {
        $.getScript(scriptbase + "SP.Taxonomy.js", function () {
            $.getScript(scriptbase + "SP.UserProfiles.js", function () {
               // $.getScript(scriptbase + "Reputation.js", function () {
                    execOperation();
               // });
            });
        });
    });
});
/*--------------End of Document ready method--------------*/

/*--------------Method used to get user profile properties--------------*/

        function getUserProperties() {
            //if ($("#fstTimeUser").val() == "0")
            if(UserPreferenceDataExist == 0)
            {
            var clientContext = new SP.ClientContext.get_current();
            var peopleManager = new SP.UserProfiles.PeopleManager(clientContext);
            userProfileProperties = peopleManager.getMyProperties();
            clientContext.load(userProfileProperties);
            clientContext.executeQueryAsync(onRequestSuccess, onRequestFail);
            }
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

            //Custom method call
            DefaultChannel1stTime(DefaultSetting1);
            DefaultChannel1stTime(DefaultSetting2);
            DefaultChannel1stTime(DefaultSetting3);
            DefaultChannel1stTime(DefaultSetting4);
            DefaultChannel1stTime(DefaultSetting5);
            DefaultChannel1stTime(DefaultSetting6);
        }

        function onRequestFail(sender, args) { alert(args.get_message()); }
/*--------------End of Method used to get user profile properties--------------*/

/*---------------- Main method-----------------*/
function execOperation() {

    NewsCarousalItems = "";

    var context = new SP.ClientContext(hostUrl);
    var oWebsite = context.get_web();
    var collList = oWebsite.get_lists();
    context.load(collList, 'Include(Title, Id)');

    var listNewsPreference = collList.getByTitle('NewsPreference');

    var listNewsArticle = collList.getByTitle('News Article');

    NewsCarousalItems = "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button' id='new' class='buttonLink active' value='New' onclick='retrieveWebSite(\"new\", \"New\", \" \"," + null + ',' + null + ");'></li>" +
                       "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button' id='company' class='buttonLink' value='Company'  onclick='retrieveWebSite(\"company\", \"Company\", \" \"," + null + ',' + null + ");'></li>";

    var queryNewsPreference = new SP.CamlQuery();

    queryNewsPreference.set_viewXml("<View><Query><Where><Eq><FieldRef Name='UserID'/><Value Type='User'>" + _spPageContextInfo.userLoginName + "</Value></Eq></Where></Query></View>");

     var listItem = listNewsPreference.getItems(queryNewsPreference);


    //var listItem = listNewsPreference.getItemById(50);
    //context.load(listItem);
    context.load(listItem, 'Include(' + MetadataHeading1 + ',' + MetadataHeading2 + ',' + MetadataHeading3 + ',' + MetadataHeading4 + ',' + MetadataHeading5 + ',' + MetadataHeading6 + ',' + MetadataHeading7 + ',' + MetadataHeading8 + ',' + "RecentChannel" + ')');

    context.executeQueryAsync(function () {
        var taxEnumerator = listItem.getEnumerator();
        UserPreferenceDataExist = 1;
        //$("#fstTimeUser").val("1");

        while (taxEnumerator.moveNext()) {
            var currentTerm = taxEnumerator.get_current(); //Label
            var RecentAddedItems = currentTerm.get_item("RecentChannel");
            var RecentAddedItemsSplit = RecentAddedItems.split('|');

            //Custom method call
            createChannel(MetadataHeading1, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
            createChannel(MetadataHeading2, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
            createChannel(MetadataHeading3, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
            createChannel(MetadataHeading4, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
            createChannel(MetadataHeading5, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
            createChannel(MetadataHeading6, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
            createChannel(MetadataHeading7, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
            createChannel(MetadataHeading8, currentTerm, RecentAddedItemsSplit, context, listNewsArticle);
        }
        retrieveWebSite("new", "New", " ", context, listNewsArticle);
        getUserProperties();
        $("#flexiselDemo4").append(NewsCarousalItems);

    }, function (sender, args) {
        console.log(args.get_message());
    });
}
/*--------------End of Main method--------------*/

function retrieveWebSite(buttonid, fieldName, fieldValue, clientContext, list) {


    $('#new').removeClass("active");
    $('#company').removeClass("active");
    for (var i = 0; i < ChannelCount; i++)
    {
        var btnid = "#btn" + i;
        $(btnid).removeClass("active");
    }


    buttonid = '#' + buttonid;


    $(buttonid).addClass("active");
    //$('#new').addClass("active");

   // $(buttonid).addClass("active");

    if (clientContext == null && list == null) {
        clientContext = new SP.ClientContext(hostUrl);
        var oWebsite = clientContext.get_web();
        var collList = oWebsite.get_lists();
        clientContext.load(collList, 'Include(Title, Id)');
        list = collList.getByTitle('News Article');
    }
    
    //ListGUIDNewsArticle = GetListGuid('News Article');

    GetListGuid('News Article');

    var query = new SP.CamlQuery();
    if (fieldName == 'New') {
        query.set_viewXml("<View><Query><OrderBy><FieldRef Name='Modified' Ascending='False'/></OrderBy>" +
                            "</Query><RowLimit>9</RowLimit></View>");
    }
    else if (fieldName == 'Company') {
        query.set_viewXml("<View><Query><Where><IsNotNull><FieldRef Name='Companies' /></IsNotNull></Where><OrderBy><FieldRef Name='Modified' Ascending='False'/>" +
                            "</OrderBy></Query><RowLimit>9</RowLimit></View>");
    }
    else {
        query.set_viewXml("<View><Query><Where><Eq><FieldRef Name='" + fieldName + "' /><Value Type='TaxonomyFieldTypeMulti'>" + fieldValue +
                            "</Value></Eq></Where><OrderBy><FieldRef Name='Modified' Ascending='False' /></OrderBy></Query><RowLimit>9</RowLimit></View>");
    }
    var listItems = list.getItems(query);
    clientContext.load(listItems);
    //clientContext.load(listItems, 'Include(' + MetadataHeading1 + ',' + MetadataHeading2 + ',' + MetadataHeading3 + ',' + MetadataHeading4 + ',' + MetadataHeading5 + ',' + MetadataHeading6 + ',' + MetadataHeading7 + ',' + MetadataHeading8 + ',' + "ID, Title, CCI_x002d_NewsArticleImage, LikesCount, LikedBy, CCI_x002d_ShortDescription, LearnMoreLink" + ')');

    clientContext.executeQueryAsync(onSuccess, onError);
    function onSuccess() {
        var enumerator = listItems.getEnumerator();
        var txtHTML = "";
        var tdData = "";

        $("#tdNewsArticle1").empty();
        $("#tdNewsArticle2").empty();
        $("#tdNewsArticle3").empty();
        $("#tdNewsArticle4").empty();
        $("#tdNewsArticle5").empty();
        $("#tdNewsArticle6").empty();
        $("#tdNewsArticle7").empty();
        $("#tdNewsArticle8").empty();
        $("#tdNewsArticle9").empty();
        txtHTML += "<tr>";
        var k = 1;
        while (enumerator.moveNext()) {
            tdData = "";
            var oListItem = enumerator.get_current();
            var Fileurl = oListItem.get_item('FileRef');
            var FileName = oListItem.get_item('FileLeafRef');
            var ImageUrl = enumerator.get_current().get_item("CCI_x002d_NewsArticleImage").split('"')[3];
            var ItemID = enumerator.get_current().get_item("ID");
            var ItemTitle = enumerator.get_current().get_item("Title");
            var likesCount = enumerator.get_current().get_item("LikesCount") == null ? "0" : String(enumerator.get_current().get_item("LikesCount"));
            var members = enumerator.get_current().get_item("LikedBy");
            var NewsShortDescription = enumerator.get_current().get_item("CCI_x002d_ShortDescription");
            var ItemLearnMoreLink = enumerator.get_current().get_item("LearnMoreLink");

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

            if (ItemTitle.length > 20) {
                ItemTitle = ItemTitle.substring(0, 20) + "...";
            }
            if (NewsShortDescription.length > 60) {
                NewsShortDescription = NewsShortDescription.substring(0, 60) + "...";
            }
 
            RedirectUrl = SP.ClientContext.get_current().get_url() + "/pages/NewsArticle.aspx?ListItemID=" + ItemID + "&morelinks=yes&" + fieldName + "=" + fieldValue;

            tdData = "<h3 class=\"mob_accordian\">" + ItemTitle + "</h3>" +

//"<div class=\"box_accordian\"><image class=\"img-responsive\" Title='" + NewsShortDescription + " ' src='" + ImageUrl + "?RenditionID=9'/></a>" +
//            "<a href=\"#\" class=\"like\"><span class=\"likecount\" id=\"NewsGridlikecount" + ItemID + "\" onclick=\"javascript: LikePage('{" + ListGUIDNewsArticle + "}', '" + ItemID + "','NewsGrid')\">(" + likesCount + ") <i class=\"fa fa-thumbs-up\"></i></span></a><a href=\"#\" id=\"NewsGridlikebutton" + ItemID + "\" class=\"LikeButton\" style=\"display:none;\">" + like + "</a>";

            "<div class=\"box_accordian\"><a href='" + RedirectUrl + "'><image class=\"img-responsive\" Title='" + NewsShortDescription + " ' src='" + ImageUrl + "?RenditionID=4'/></a>" +
            "<a href=\"#\" class=\"thumb\"><span class=\"likecount\" id=\"NewsGridlikecount" + ItemID + "\" onclick=\"javascript: LikePage('{" + ListGUIDNewsArticle + "}', '" + ItemID + "','NewsGrid')\">(" + likesCount + ") <i class=\"fa fa-thumbs-up\"></i></span></a><a href=\"#\" id=\"NewsGridlikebutton" + ItemID + "\" class=\"LikeButton\" style=\"display:none;\">" + like + "</a><div class=\"overlay\"> <a href=\"" + RedirectUrl + "\" class=\"expand\">" + NewsShortDescription + "</a></div></div>";


            if (k == 1) {
                $("#tdNewsArticle1").append(tdData);
            }
            if (k == 2) {
                $("#tdNewsArticle2").append(tdData);
            } if (k == 3) {
                 $("#tdNewsArticle3").append(tdData);
            } if (k == 4) {
                 $("#tdNewsArticle4").append(tdData);
            } if (k == 5) {
                $("#tdNewsArticle5").append(tdData);
            } if (k == 6) {
                $("#tdNewsArticle6").append(tdData);
            } if (k == 7) {
                $("#tdNewsArticle7").append(tdData);
            } if (k == 8) {
                $("#tdNewsArticle8").append(tdData);
            } if (k == 9) {
                $("#tdNewsArticle9").append(tdData);
            }
            k++;
        }
    }
    function onError(sender, args) {
        alert(args.get_message());
    }
}

/*---------------- Method used for user preferred Channel------------------*/
function createChannel(_MainHeading, currentTerm, RecentAddedItemsSplit, clientContext, list) {
    var ItemTitle = currentTerm.get_item(_MainHeading);
    for (var j = 0; j < ItemTitle.get_count() ; j++) {
        var ChannelName = ItemTitle.get_item(j).$0_1; //Label

        if (RecentAddedItemsSplit.indexOf(ChannelName) > -1) {
            NewsCarousalItems += "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button' id='btn" + j + "' class='buttonLink recent' value='" + ChannelName + "' onclick='retrieveWebSite(\"" + 'btn' + j + "\", \"" + _MainHeading + "\", \"" + ChannelName + "\"," + null + ',' + null + ");'></li>";

        }
        else {
            NewsCarousalItems += "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button'  id='btn" + j + "' class='buttonLink' value='" + ChannelName + "' onclick='retrieveWebSite(\"" + 'btn' + j + "\", \"" + _MainHeading + "\", \"" + ChannelName + "\," + null + ',' + null + " );'></li>";
        }
        ChannelCount++;
    }
}
/*---------------- End of Method used for user preferred Channel-----------*/

/*---------------- Method used for Default Channel for 1st time Loggedin User------------------*/
function DefaultChannel1stTime(_MainHeading)
    {
    if (_MainHeading == "<Location>") {
        _MainHeading = curr_Location;
    }
    if (_MainHeading == "<Department>") {
        _MainHeading = curr_Department;
    }

    if (_MainHeading.trim().length > 0) {

        if (_MainHeading == "Cox Business") {
            NewsCarousalItems += "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button'  id='btn" + j + "' class='buttonLink' value='" + _MainHeading + "' onclick='retrieveWebSite(\"" + 'btn' + j + "\", \"" + "\"Divisions\", \"" + _MainHeading + "\"," + null + ',' + null + ");'></li>";

        }
        else {
            NewsCarousalItems += "<li class=\"nbs-flexisel-item\" style=\"width: 163.75px;\"><input type='button'  id='btn" + j + "' class='buttonLink' value='" + _MainHeading + "' onclick='retrieveWebSite(\"" + 'btn' + j + "\", \"" + _MainHeading + "\", \"" + _MainHeading + "\," + null + ',' + null + " );'></li>";
        }
        ChannelCount++;
    }
}
/*---------------- End of Method used for Default Channel for 1st time Loggedin User-----------*/

/*---------------- Method used to get ListGUID------------------*/
function GetListGuid(listTitle) {
    try {
        //REST Query to get the List Title 
        jQuery.ajax(
        {
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listTitle + "')?$select=Id",
            type: "GET",
            async: false,
            headers: { "Accept": "application/json;odata=verbose" },
            success: function (data, textStatus, xhr) {
                ListGUIDNewsArticle = data.d.Id;
                //return data.d.Id;
                console.log("List GUID: " + data.d.Id);
				$(document).trigger('function_GetListGuid_complete');
            },
            error: function (data, textStatus, xhr) {
                console.error("Error.");
            }
        });
    }
    catch (ex) {
        console.error(ex);
    }
}
/*----------------End of Method used to get ListGUID------------------*/
