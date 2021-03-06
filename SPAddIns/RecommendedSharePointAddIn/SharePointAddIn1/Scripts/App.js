﻿'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");
var username;
var businessunit;
var department;
var userlocation;
var factory;
var appContextSite;
var NewsPreferenceList;
var articleList;
var NewsPreferenceListID;
var articleListID;
var searchQueryText;
var hostweb;

var listGuid;
var listItemId;
var itemKey;
var listItemCollection = [];

function initializePage()
{
    var context = SP.ClientContext.get_current();
    var user = context.get_web().get_currentUser();
    var hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    var appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
    //head = document.getElementsByTagName("head");
    //head[0].appendChild(linkAnimate);
    //head[0].appendChild(linkMain);
    //head[0].appendChild(linkFontAwesome);
    //head[0].appendChild(linkBootstrap);

    appContextSite = new SP.AppContextSite(context, hostweburl);
    hostweb = appContextSite.get_web();
    
    //var sProp = decodeURIComponent(getQueryStringParameter("NewsPreferenceListName"));
            
    //var eProp = decodeURIComponent(getQueryStringParameter("ArticleListName"));
            
    NewsPreferenceList = hostweb.get_lists().getByTitle("NewsPreferences");
    articleList = hostweb.get_lists().getByTitle("News");

    var scriptbase = hostweburl + "/_layouts/15/";

    $(document).ready(function () {
        $('#related-content-results').html("Loading, please wait...");
        $.getScript(scriptbase + "SP.js",
            function () {
                $.getScript(scriptbase + "Reputation.js",
                    function () {
                        $.getScript(scriptbase + "SP.RequestExecutor.js", getUserName);
                    }
                );
            }
        );
    });

    function getUserName() {
        context.load(user);
        context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
    }

            

    function getListIds() {
        context.load(articleList);
        context.load(NewsPreferenceList);
        context.executeQueryAsync(onGetListIdsSuccess,onGetListIdsFail);
    }

    function onGetListIdsSuccess() {
        articleListID = articleList.get_id();
        NewsPreferenceListID = NewsPreferenceList.get_id();
        searchQueryText = "ListID:" + NewsPreferenceListID + " RefinableString100:" + username + "'&selectproperties='Title,RefinableString100,RefinableString101,RefinableString102'";
        loadSPRequestExecutorJS(searchQueryText, articleListID);
    }

    // This function is executed if the above call is successful
    // It replaces the contents of the 'message' element with the user name
    function onGetUserNameSuccess() {
        username = user.get_title();
        getListIds();
    }

    // This function is executed if the above call fails
    function onGetUserNameFail(sender, args) {
        alert('Failed to get user name. Error:' + args.get_message());
    }

    // This function is executed if the above call fails
    function onGetListIdsFail(sender, args) {
        alert('Failed to get list ids. Error:' + args.get_message());
    }

    function loadSPRequestExecutorJS(query, articleId)
    {
        articleListID = articleId;
        searchQueryText = query;
        getNewsPreference();
    }

    function getNewsPreference() {
        //alert(searchQueryText);
        var searchUrl = appweburl + "/_api/search/query?querytext='" + searchQueryText;
        var executor = new SP.RequestExecutor(appweburl);
        executor.executeAsync(
            {
                url: searchUrl,
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" },
                success: onNewsPreferenceResultsSuccess,
                error: onGetSearchResultsFail
            }
        );
    }

    function onNewsPreferenceResultsSuccess(data) {
        var jsonObject = JSON.parse(data.body);
        var results = jsonObject.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
        if (results.length == 0) {
            $('#related-content-results').text('No News Preference found');
        }
        else {
            $.each(results, function (index, result) {
                department = result.Cells.results[4].Value;
                userlocation = result.Cells.results[5].Value;
            });
            var previousValueFound = false;
            searchQueryText = "ListID:" + articleListID;
            
            if (userlocation != undefined || userlocation != null || userlocation.length > 0) {
                var userlocations = String(userlocation).split(';');
                if (previousValueFound)
                    searchQueryText += " OR RefinableString07:\"" + userlocations[0] + "\"";
                else
                    searchQueryText += " RefinableString07:\"" + userlocations[0] + "\"";

                for (var i = 1; i < userlocations.length; i++) {
                    searchQueryText += " OR RefinableString07:\"" + userlocations[i] + "\"";
                }

                previousValueFound = true;
            }
            
            if (department != undefined || department != null || department.length > 0) {
                var departments = String(department).split(';');

                if (previousValueFound)
                    searchQueryText += " OR RefinableString02:\"" + departments[0] + "\"";
                else
                    searchQueryText += " RefinableString02:\"" + departments[0] + "\"";

                for(var i=1;i<departments.length;i++)
                {
                    searchQueryText += " OR RefinableString02:\"" + departments[i] + "\"";
                }
                
            }
            searchQueryText += "'&selectproperties='NewsTitle,PublishingImage,LikesCount,ListItemID'";
            getNewsResults();
        }
    }

    function getNewsResults() {
        //alert(searchQueryText);
        var searchUrl = appweburl + "/_api/search/query?querytext='" + searchQueryText;
        var executor = new SP.RequestExecutor(appweburl);
        executor.executeAsync(
            {
                url: searchUrl,
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" },
                success: onNewsGetSearchResultsSuccess,
                error: onGetSearchResultsFail
            }
        );
    }

    function onNewsGetSearchResultsSuccess(data) {
        var jsonObject = JSON.parse(data.body);
        var results = jsonObject.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
        var listItemsCounter = 0;
        if (results.length == 0) {
            $('#related-content-results').text('No related documents were found');
        }
        else {
            var searchResultsHtml = '<div class="col-sm-4 box_warp"><div class="row custom_space"><div class="col-sm-12 box_warp"><div class="panel panel-default custom-box-warp mobile-custom-space"><h2 class="panel-title mob_accordian">Recommended Articles</h2><div class="box_accordian">';
            $.each(results, function (index, result) {
                searchResultsHtml += "<div class='side_thumb_pro'><div class='item_box  mobile-custom-space'><h3 class='mob_accordian'>" +
                    result.Cells.results[2].Value +
                    "</h3><div class='box_accordian'>" + result.Cells.results[3].Value + "<div class='LikeSection'><a href='#' class='like'><span class='likecount' id='RecommendedNewslikecount" + result.Cells.results[5].Value + "'></span><a href='#' id='RecommendedNewslikebutton" + result.Cells.results[5].Value + "' class='LikeButton'></a></a></div> </div></div></div>";
                listItemCollection[listItemsCounter] = result.Cells.results[5].Value;
                listItemsCounter++;
            });
            searchResultsHtml += "</div></div></div></div></div>";
            $('#related-content-results').html(searchResultsHtml);
            for (var i = 0; i < listItemCollection.length; i++) {
                var itemId = listItemCollection[i];
                getLikes(itemId);
                $("#RecommendedNewslikecount" + itemId).click(function () { LikePage(itemId) });
            }
        }
    }

    function onGetSearchResultsFail(data, errorCode, errorMessage) {
        $('#related-content-results').text('An error occurred whilst searching for related content - ' + errorMessage);
    }

    // Function to retrieve a query string value.
    // For production purposes you may want to use
    //  a library to handle the query string.
    function getQueryStringParameter(paramToRetrieve) {
        var params =
            document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == paramToRetrieve)
                return singleParam[1];
        }
    }

    //Likes
    function LikePage(itemId) {
        var like = false;
        var likeButtonText = $("#RecommendedNewslikebutton" + itemId).text();
        //if (listGuid.indexOf("{") > -1)
        //    listGuid = listGuid.substring(1, listGuid.length - 1);
        listGuid = articleList.get_id();
        
        if (likeButtonText != "") {
            if (likeButtonText == "Like")
                like = true;
            //var hostWebContext = articleList.get_context();
            hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
            appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));

            var clientContext = new SP.ClientContext(appweburl);
            var factory = new SP.ProxyWebRequestExecutorFactory(appweburl);
            clientContext.set_webRequestExecutorFactory(factory);
            var appContextSite = new SP.AppContextSite(clientContext, hostweburl);
            
            var ctx = new SP.ClientContext(hostweburl);
            //var context = new SP.ClientContext(hostweburl);
            EnsureScriptFunc('reputation.js', 'Microsoft.Office.Server.ReputationModel.Reputation', function () {
                Microsoft.Office.Server.ReputationModel.Reputation.setLike(ctx, listGuid, itemId, like);
                clientContext.executeQueryAsync(
                    function () {
                        ExecuteOrDelayUntilScriptLoaded(function () { getLikes(listGuid, itemId) }, "sp.js");
                    }, function (sender, args) {
                        // Do something if error
                        alert('Request failed while setting like ' + args.get_message() + '\n' + args.get_stackTrace());
                    });
            });
        }
    }

    function getLikes(itemId) {
        
        var likebuttonid = "RecommendedNewslikebutton" + itemId;
        var likecountid = "RecommendedNewslikecount" + itemId;
        //alert("Getting Liked for = " + likebuttonid);

        var list = articleList;
        var item = list.getItemById(itemId);

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' +
            '<Value Type=\'Counter\'>' + itemId + '</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');
        var collListItem = list.getItems(camlQuery);
        context.load(collListItem);
        context.executeQueryAsync(
            function () {
                var likeDisplay = true;
                var result = '';
                var listItemEnumerator = collListItem.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var oListItem = listItemEnumerator.get_current();
                    var likesCountInfo = oListItem.get_item('LikesCount');
                    var members = oListItem.get_item('LikedBy');

                    if (members != null) {
                        for (var i = 0; i < members.length; i++) {
                            var member = members[i];
                            if (member.get_email().trim().toLowerCase() === _spPageContextInfo.userLoginName) {
                                //display unlike  
                                likeDisplay = false;
                            }
                            result += member.get_lookupValue() + '\n';
                            //  alert(result);
                        }
                    }
                }
                ChangeLikeText(likeDisplay, likesCountInfo, likebuttonid, likecountid);
            },
            Function.createDelegate(this, onQueryFailed));
    }

    function onQueryFailed(sender, args) {
        alert('Failed to get likes. Error:' + args.get_message());
    }

    function ChangeLikeText(like, count, likebuttonid, likecountid) {
        
        if (like) {
            $("#" + likebuttonid).text('Like');
        }
        else {
            $("#" + likebuttonid).text('Unlike');
        }
        
        var htmlstring = "(" + String(count) + ") " + "<i class='fa fa-thumbs-up'></i>";
        var htmlstring1 = "(" + String(count) + ") " + "<i class='fa fa-thumbs-up'></i>";
        if (count > 0) {
            $("#" + likecountid).html(htmlstring)
        }
        else {
            $("#" + likecountid).html(htmlstring1);
        }
    }
    
}
