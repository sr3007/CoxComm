<script>
'use strict';
//var NewsArticleListKey = "CCINewsArticle";
var NewsArticleListKey = "NewsArticlePagesLibrary";
var NewsPreferenceListKey = "CCINewsPreference";
var NewsPreferenceListID;
var siteUrl;
var context;
var hostweb;
var searchQueryText;
var newsArticleId;
var newsArticleList;
var searchResultsHtml = "";
var searchResultsMainHtml = "";
var startNumber = 0;
var rowLimit = 4;
var newsArticleIds = [];
var source = '';
var newsChannel = '';
var currentListItemId = 0;
var username;
var useremail;
var user;

function loadRollupNewsResources()
{
    siteUrl = _spPageContextInfo.siteAbsoluteUrl + "/" + CCI_Common.GetConfig('NewsPageLibrarySourceSite') + "/";
    context = new SP.ClientContext(siteUrl);
    hostweb = context.get_web();
    user = context.get_web().get_currentUser();
    newsArticleId = CCI_Common.GetConfig(NewsArticleListKey);
    NewsPreferenceListID = CCI_Common.GetConfig(NewsPreferenceListKey);
    newsArticleList = hostweb.get_lists().getById(newsArticleId);
    context.load(newsArticleList);
    context.load(user);
    context.executeQueryAsync(onGetSuccess,onGetFail);
}

function onGetSuccess() {
    username = user.get_title();
    useremail = user.get_email();
    currentListItemId = GetUrlKeyValue("ListItemID", false, location.href);
    source = GetUrlKeyValue("Source", false, location.href);
    newsChannel = GetUrlKeyValue("NewsChannel", false, location.href);

    if(source === "Carousel")
        newsChannel = 'Company';
    else if(source === "NewsGrid")
    {
        if(newsChannel === "New")
            newsChannel = 'Latest';
        else
            newsChannel = newsChannel;
    }
    else
        newsChannel = source;
    
    if(newsChannel === "Recommended")
    {
        searchQueryText = "ListID:" + NewsPreferenceListID + " RefinableString100:" + useremail + "'&selectproperties='RefinableString103,RefinableString101,RefinableString105,RefinableString106,RefinableString102,RefinableString108,RefinableString109,RefinableString107'";
        getNewsPreference1(searchQueryText);
    }
    else if(newsChannel === "Company")
    {
        searchQueryText = "ListID:" + NewsPreferenceListID + " RefinableString100:" + useremail + "'&selectproperties='RefinableString108,RefinableString107'";
        getNewsPreferenceForCompany(searchQueryText);
    }
    else
    {
        searchQueryText = "ListID:" + newsArticleId + " RefinableString101:" + newsChannel + " OR RefinableString102:" + newsChannel + " OR RefinableString103:" + newsChannel + " OR RefinableString105:" + newsChannel  + " OR RefinableString106:" + newsChannel + " OR RefinableString107:" + newsChannel + " OR RefinableString108:" + newsChannel + " OR RefinableString109:" + newsChannel;
        renderNewsRollup(startNumber,rowLimit, newsChannel);
    }
}

function getNewsPreferenceForCompany(query)
{
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo",
        type: "POST",
        headers: { "Accept": "application/json; odata=verbose"},
        success: function (data) {
            $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue);
            var restUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?querytext='" + query;
            $.ajax({
                url: restUrl,
                type: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose",
                    "Content-Type": "application/json; odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results
                    if (results.length == 0) {
                        $('#NewsRollupDiv').text('News Preferences not found for the user: ' + username);
                    }
                    else {
                        $.each(results, function (index, result) {
                            product = result.Cells.results[2].Value;
                            companies = result.Cells.results[3].Value;
                                                                    
                            var previousValueFound = false;
                            searchQueryText = "ListID:" + newsArticleId;
                                                                    
                            //Companies
                            if (companies != undefined || companies != null || companies.length > 0) {
                                if(companies != '')
                                {
                                    var endPos = String(companies).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        companies = String(companies).substring(0, endPos);

                                    var companiess = String(companies).split(';');

                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString107:\"" + companiess[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString107:\"" + companiess[0] + "\"";

                                    for(var i=1;i<companiess.length;i++)
                                    {
                                        searchQueryText += " OR RefinableString107:\"" + companiess[i] + "\"";
                                    }
                                    previousValueFound = true;
                                }
                            }

                            //Product
                            if (product != undefined || product != null || product.length > 0) {
                                if(product != '')
                                {
                                    var endPos = String(product).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        product = String(product).substring(0, endPos);

                                    var products = String(product).split(';');

                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString108:\"" + products[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString108:\"" + products[0] + "\"";

                                    for(var i=1;i<products.length;i++)
                                    {
                                        searchQueryText += " OR RefinableString108:\"" + products[i] + "\"";
                                    }
                                    previousValueFound = true;
                                }
                            }

                            renderNewsRollup(startNumber,rowLimit, newsChannel);
                        });
                    }
                },
                error: function (error) {
                    //alert(error);
                }
            });
        },
        error: function (data, errorCode, errorMessage) {
            //alert(errorMessage)
        }
    });
}

function getNewsPreference1(query)
{
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo",
        type: "POST",
        headers: { "Accept": "application/json; odata=verbose"},
        success: function (data) {
            $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue);
            var restUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?querytext='" + query;
            $.ajax({
                url: restUrl,
                type: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose",
                    "Content-Type": "application/json; odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {
                    var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results
                    if (results.length == 0) {
                        $('#NewsRollupDiv').text('News Preferences not found for the user: ' + username);
                    }
                    else {
                        $.each(results, function (index, result) {
                            coe = result.Cells.results[2].Value;
                            department = result.Cells.results[3].Value;
                            division = result.Cells.results[4].Value;
                            industry = result.Cells.results[5].Value;
                            userlocation = result.Cells.results[6].Value;
                            product = result.Cells.results[7].Value;
                            topic = result.Cells.results[8].Value;
                            companies = result.Cells.results[9].Value;
                                                                    
                            var previousValueFound = false;
                            searchQueryText = "ListID:" + newsArticleId;
                                                                    
                            //COE
                            if (coe != undefined || coe != null || coe.length > 0) {
                                if(coe != '')
                                {
                                    var endPos = String(coe).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        coe = String(coe).substring(0, endPos);

                                    var coes = String(coe).split(';');
                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString103:\"" + coes[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString103:\"" + coes[0] + "\"";

                                    for (var i = 1; i < coes.length; i++) {
                                        searchQueryText += " OR RefinableString103:\"" + coes[i] + "\"";
                                    }

                                    previousValueFound = true;
                                }
                            }

                            //Department
                            if (department != undefined || department != null || department.length > 0) {
                                if(department != '')
                                {
                                    var endPos = String(department).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        department = String(department).substring(0, endPos);

                                    var departments = String(department).split(';');

                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString101:\"" + departments[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString101:\"" + departments[0] + "\"";

                                    for(var i=1;i<departments.length;i++)
                                    {
                                        searchQueryText += " OR RefinableString101:\"" + departments[i] + "\"";
                                    }
                                    previousValueFound = true;
                                }
                            }

                            //Division
                            if (division != undefined || division != null || division.length > 0) {
                                if(division != '')
                                {
                                    var endPos = String(division).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        division = String(division).substring(0, endPos);

                                    var divisions = String(division).split(';');
                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString105:\"" + divisions[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString105:\"" + divisions[0] + "\"";

                                    for (var i = 1; i < divisions.length; i++) {
                                        searchQueryText += " OR RefinableString105:\"" + divisions[i] + "\"";
                                    }

                                    previousValueFound = true;
                                }
                            }

                            //Industry
                            if (industry != undefined || industry != null || industry.length > 0) {
                                if(industry != '')
                                {
                                    var endPos = String(industry).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        industry = String(industry).substring(0, endPos);

                                    var industries = String(industry).split(';');
                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString106:\"" + industries[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString106:\"" + industries[0] + "\"";

                                    for (var i = 1; i < industries.length; i++) {
                                        searchQueryText += " OR RefinableString106:\"" + industries[i] + "\"";
                                    }

                                    previousValueFound = true;
                                }
                            }

                            //Location
                            if (userlocation != undefined || userlocation != null || userlocation.length > 0) {
                                if(userlocation != '')
                                {
                                    var endPos = String(userlocation).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        userlocation = String(userlocation).substring(0, endPos);

                                    var userlocations = String(userlocation).split(';');
                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString102:\"" + userlocations[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString102:\"" + userlocations[0] + "\"";

                                    for (var i = 1; i < userlocations.length; i++) {
                                        searchQueryText += " OR RefinableString102:\"" + userlocations[i] + "\"";
                                    }

                                    previousValueFound = true;
                                }
                            }
                                                                    
                            //Companies
                            if (companies != undefined || companies != null || companies.length > 0) {
                                if(companies != '')
                                {
                                    var endPos = String(companies).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        companies = String(companies).substring(0, endPos);

                                    var companiess = String(companies).split(';');

                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString107:\"" + companiess[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString107:\"" + companiess[0] + "\"";

                                    for(var i=1;i<companiess.length;i++)
                                    {
                                        searchQueryText += " OR RefinableString107:\"" + companiess[i] + "\"";
                                    }
                                    previousValueFound = true;
                                }
                            }

                            //Product
                            if (product != undefined || product != null || product.length > 0) {
                                if(product != '')
                                {
                                    var endPos = String(product).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        product = String(product).substring(0, endPos);

                                    var products = String(product).split(';');

                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString108:\"" + products[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString108:\"" + products[0] + "\"";

                                    for(var i=1;i<products.length;i++)
                                    {
                                        searchQueryText += " OR RefinableString108:\"" + products[i] + "\"";
                                    }
                                    previousValueFound = true;
                                }
                            }

                            //Topic
                            if (topic != undefined || topic != null || topic.length > 0) {
                                if(topic != '')
                                {
                                    var endPos = String(topic).indexOf("GP0")-1;
                                    if(endPos > -1)
                                        topic = String(topic).substring(0, endPos);

                                    var topics = String(topic).split(';');

                                    if (previousValueFound)
                                        searchQueryText += " OR RefinableString109:\"" + topics[0] + "\"";
                                    else
                                        searchQueryText += " RefinableString109:\"" + topics[0] + "\"";

                                    for(var i=1;i<topics.length;i++)
                                    {
                                        searchQueryText += " OR RefinableString109:\"" + topics[i] + "\"";
                                    }
                                    previousValueFound = true;
                                }
                            }
                            renderNewsRollup(startNumber,rowLimit, newsChannel);
                        });
                    }
                },
                error: function (error) {
                    //alert(error);
                }
            });
        },
        error: function (data, errorCode, errorMessage) {
            //alert(errorMessage)
        }
    });
}

// This function is executed if the above call fails
function onGetFail(sender, args) {
    //alert('Failed to load resources. Error:' + args.get_message());
}

function renderNewsRollup(startNumber, rowLimit, newsChannel)
{
    if(newsChannel === 'Trending')
    {
        searchQueryText = "ListID:" + newsArticleId + " RefinableString10:0 ListItemId<>" + currentListItemId;
        var endPointUrl = siteUrl + "/_api/search/postquery";
        var searchQuery = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': searchQueryText,
                'StartRow' : startNumber,
                'RowLimit': rowLimit,
                'SelectProperties': {
                    'results': [
                        'CCI-NewsHeadLineOWSTEXT',
                        'CCI-NewsArticleImageOWSIMGE',
                        'AuthorOWSUSER',
                        'ListItemId',
                        'ListId',
                        'CCI-BylineOWSTEXT',
                        'RefinableString08',
                        'RefinableString118'
                    ]
                },
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableInt00',
                            'Direction': '1'
                        }
                    ]
                }
            }
        };
    }
    else if(newsChannel === "Recommended" || newsChannel === "Company")
    {
        searchQueryText += " (ListItemId<>null AND ListItemId<>" + currentListItemId + ")";
        var endPointUrl = siteUrl + "/_api/search/postquery";
        var searchQuery = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': searchQueryText,
                'StartRow' : startNumber,
                'RowLimit': rowLimit,
                'SelectProperties': {
                    'results': [
                        'CCI-NewsHeadLineOWSTEXT',
                        'CCI-NewsArticleImageOWSIMGE',
                        'AuthorOWSUSER',
                        'ListItemId',
                        'ListId',
                        'CCI-BylineOWSTEXT',
                        'PublishingPageContentOWSHTML',
                        'RefinableString118'
                    ]
                },
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableDate01',
                            'Direction': '1'
                        }
                    ]
                }
            }
        };
    }
    else if(newsChannel === "Latest")
    {
        searchQueryText = "ListID:" + newsArticleId + " (ListItemId<>null AND ListItemId<>" + currentListItemId + ")";
        var endPointUrl = siteUrl + "/_api/search/postquery";
        var searchQuery = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': searchQueryText,
                'StartRow' : startNumber,
                'RowLimit': rowLimit,
                'SelectProperties': {
                    'results': [
                        'CCI-NewsHeadLineOWSTEXT',
                        'CCI-NewsArticleImageOWSIMGE',
                        'AuthorOWSUSER',
                        'ListItemId',
                        'ListId',
                        'CCI-BylineOWSTEXT',
                        'PublishingPageContentOWSHTML',
                        'RefinableString118'
                    ]
                },
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableDate01',
                            'Direction': '1'
                        }
                    ]
                }
            }
        };
    }
    else
    {
        searchQueryText += " (ListItemId<>null AND ListItemId<>" + currentListItemId + ")";
        var endPointUrl = siteUrl + "/_api/search/postquery";
        var searchQuery = {
            'request': {
                '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                'Querytext': searchQueryText,
                'StartRow' : startNumber,
                'RowLimit': rowLimit,
                'SelectProperties': {
                    'results': [
                        'CCI-NewsHeadLineOWSTEXT',
                        'CCI-NewsArticleImageOWSIMGE',
                        'AuthorOWSUSER',
                        'ListItemId',
                        'ListId',
                        'CCI-BylineOWSTEXT',
                        'PublishingPageContentOWSHTML',
                        'RefinableString118'
                    ]
                },
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableDate01',
                            'Direction': '1'
                        }
                    ]
                }
            }
        };
    }

    var headers = {
        "Accept": "application/json;odata=verbose",
        "content-Type": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val()
    }
    
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
            searchResultsHtml = '';
            for (var i = 0; i < queryResults.length; i++) {
                var r = queryResults[i];
                var cells = r.Cells;
                var title = '';
                var itemId = '';
                var pictureUrl = '';
                var pictureMarkup = '';
                var listId = '';
                var byline = '';
                var articleContent = '';
                var newsTags = '';
                var authors2= '';
                var author = '';

                for (var x = 0; x < cells.results.length; x++) {
                    var c = cells.results[x];
                    switch (c.Key) {
                        case "CCI-NewsHeadLineOWSTEXT": title = c.Value; break;
                        case "ListItemId": itemId = c.Value; break;
                        case "CCI-NewsArticleImageOWSIMGE": pictureUrl = c.Value; break;
                        case "AuthorOWSUSER": authors2 = c.Value; break;
                        case "ListId": listId = c.Value; break;
                        case "CCI-BylineOWSTEXT": byline = c.Value; break;
                        case "PublishingPageContentOWSHTML": articleContent = c.Value; break;
                        case "RefinableString118": newsTags = c.Value; break;
                    }
                }
                /*
                                    var endPos = String(newsTags).indexOf("GP0")-1;
                                    var temp420 = String(newsTags).substring(0, endPos);
                                    var tags = String(temp420).split(';');
                                    var newstags1='';
                                    for (var i = 0; i < tags.length; i++) {
                                        newstags1 += tags[i] + ", ";
                                    }
                                    newsTags = newstags1.substring(0,newstags1.length-2);
                */
                if (title != null)
                {
                    var temp = [];
                    temp[0] = itemId;
                    temp[1] = title;
                    newsArticleIds[newsArticleIds.length] = temp;

                    //author =authors2.split("|")[1];
                    /*
                    if(pictureUrl != null)
                    {
                        if(pictureUrl.indexOf("src=") > -1)
                        {
                            var startPos = pictureUrl.indexOf("src=")+5;
                            var endPos = pictureUrl.indexOf("style")-2;
                            pictureMarkup = pictureUrl.substring(startPos, endPos);
                        }
                        pictureMarkup = pictureMarkup + "?RenditionID=12";
                    }
                    */
                    if(byline === null)
                        byline = "";
    
                    searchResultsHtml += '<div class="ms-webpart-chrome-title"><span><h2 class="ms-webpart-titleText">' + newsChannel + ' News </h2></span></div><div class="row news_box top-new-box"><div class="box_accordian padd_comon"><div class="share_like_row"><div class="left_side"><h3>' + title + '</h3><h3><span>' + byline + '</span></h3></div><div class="share_social"><ul><li><div class="LikeSection"><a class="likecount" id="newsrolluplikecount' + itemId + '"></a><a href="#" class="like" onclick="javascript: LikePage(\'' + listId + '\', ' + itemId + ', \'newsrollup\')">&nbsp;<i class="fa fa-thumbs-up"></i><a href="#" class="LikeButton" id="newsrolluplikebutton' + itemId + '" style="display:none;"></a></a></div></li><li><a href="#" id="share' + itemId + '" class="share_icon"><i class="fa fa-share-alt"></i></a></li></ul></div></div><div class="content_row"><div id="myImg' + itemId + '" class="img_data left_side_img"><!--<img class="image_fit" src="' + pictureMarkup + '" />--></div><p>' + articleContent + '</p><div id="myModal' + itemId + '" class="modal"><span id="closeBtn' + itemId + '" class="close">x</span><img class="modal-content" id="img01' + itemId + '"><div id="caption' + itemId + '"></div></img></div><div class="clearfix"></div><div></div><div class="clearfix"></div><a href="#" id="lnkViewComments' + itemId + '" class="comments-view">Add/View Comments</a><div class="comments' + itemId + '"><iframe id="discussions' + itemId + '" scrolling="yes" class="discussionframe"></iframe></div></div></div></div></br>';
                }
            }
                
            searchResultsMainHtml +=searchResultsHtml;
            $('#NewsRollupDiv').html(searchResultsMainHtml + '<div class="col-xs-12"><div class="loadMore"><a href="#" id="showmore">Show More Results</a></div></div>');

            for(var j=0;j<newsArticleIds.length;j++)
            {
                //console.log(newsArticleIds[j][0]);
                getRollupNewsLikes(parseInt(newsArticleIds[j][0]));
                bindEvents(parseInt(newsArticleIds[j][0]), newsArticleIds[j][1]);
                getCommentsSection(parseInt(newsArticleIds[j][0]), newsArticleIds[j][1]);
            }
                
        }
        else {
            $('#NewsRollupDiv').html(searchResultsMainHtml + '<div class="col-xs-12"><div class="loadMore"><a href="#">No results found...</a></div></div>');
            for(var j=0;j<newsArticleIds.length;j++)
            {
                getRollupNewsLikes(parseInt(newsArticleIds[j][0]));
                bindEvents(parseInt(newsArticleIds[j][0]), newsArticleIds[j][1]);
                getCommentsSection(parseInt(newsArticleIds[j][0]), newsArticleIds[j][1]);
            }
        }
    });
    call.fail(function (data) {
        //alert("Failure" + JSON.stringify(data));
    });

}

function getRollupNewsLikes(itemId) {
    var likebuttonid = "newsrolluplikebutton" + itemId;
    var likecountid = "newsrolluplikecount" + itemId;
    var ctx = new SP.ClientContext(siteUrl);
    hostweb = ctx.get_web();
    newsArticleList = hostweb.get_lists().getById(newsArticleId);
    var oListItem1 = newsArticleList.getItemById(itemId);
    ctx.load(newsArticleList);
    ctx.load(oListItem1, "LikedBy", "ID", "LikesCount");
    ctx.executeQueryAsync(
        function () {
            var likeDisplay = true;
            var result = '';
            //alert(oListItem1.get_item('LikedBy'));
            var $v_0 = oListItem1.get_item('LikedBy');
            var likesCountInfo = oListItem1.get_item('LikesCount');
            if (!SP.ScriptHelpers.isNullOrUndefined($v_0)) {
                for (var $v_1 = 0, $v_2 = $v_0.length; $v_1 < $v_2; $v_1++) {
                    var $v_3 = $v_0[$v_1];
                    if ($v_3.get_lookupId() === _spPageContextInfo.userId) {
                        //cb(true, item.get_item('LikesCount'));
                        likeDisplay = false;
                    }
                }
            }
            else
                likesCountInfo = 0;
            
            ChangeNewsRollupLikeText(likeDisplay, likesCountInfo, likebuttonid, likecountid);
        },
        Function.createDelegate(this, onQueryFailed));
}

function ChangeNewsRollupLikeText(like, count, likebuttonid, likecountid) {
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
    //alert('Failed to get likes. Error:' + args.get_message());
}

function bindEvents(itemId, title)
{
    var articleLink = _spPageContextInfo.siteAbsoluteUrl + "/pages/NewsArticle.aspx?ListItemID=" + itemId;
    var formattedBody = "Article Title: " + title + "\n Article Link: " + articleLink;
    $("#share" + itemId).attr("href", "mailto:?subject=" + title + "&body=" + encodeURIComponent(formattedBody));
    /*
        var modal = document.getElementById("myModal"+itemId);
    
                        // Get the image and insert it inside the modal - use its "alt" text as a caption
                        var img = document.getElementById("myImg"+itemId);
                        var modalImg = document.getElementById("img01"+itemId);
                        var captionText = document.getElementById("caption"+itemId);
                
                        img.onclick = function(){
                            modal.style.display = "block";
    
    
                            var someimage = document.getElementById("myImg"+itemId);
                            var myimg = someimage.getElementsByTagName('img')[0];
                            var mysrc = myimg.src;
                            var newsrc =mysrc.split("?", 1);
    
                            modalImg.src = newsrc;
    
    
                        }
                
                        // Get the <span> element that closes the
                        var span = document.getElementById("closeBtn"+itemId);
    
                        // When the user clicks on <span> (x), close the modal
                        span.onclick = function() {
                            modal.style.display = "none";
                        }
        */
    var showMoreButton = document.getElementById("showmore");

    if(showMoreButton != null)
    {
        showMoreButton.onclick = function(){
            startNumber = startNumber + rowLimit;
            renderNewsRollup(startNumber,rowLimit,newsChannel);
        }
    }

    $('.comments' + itemId).hide();
    /*
        $('#s4-workspace').scroll(function() {
            var aTop = $('#showmore').height();
            if($(this).scrollTop()>=aTop){
                alert('Happening...');
                startNumber = startNumber + rowLimit;
                renderNewsRollup(startNumber,rowLimit);
            }
        });
    */
}

function getCommentsSection(itemId, title)
{
    var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('CCI-NewsDiscussions')/items?$select=ID,Title,FileRef,Created,Author/Title,Folder/ItemCount&$expand=Author,Folder&$filter=NewsArticleID eq " + itemId;
    //alert(restUrl);
    $.ajax({
        url: restUrl,
        type: "GET",
        headers: {
            "Accept": "application/json; odata=verbose",
            "Content-Type": "application/json; odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            var webUrl = _spPageContextInfo.webServerRelativeUrl;
            var pageUrl;
            var commentcount = 0;

            if (data.d.results.length > 0) {
                pageUrl = webUrl + '/Lists/CCINewsDiscussions/Flat.aspx?ListItemId=' + itemId + '&IsDlg=1&RootFolder=' + data.d.results[0]["FileRef"];
                $.each(data.d.results, function (index, item) {
                    commentcount = item.Folder["ItemCount"];
                });
                commentcount++;
            }
            else
            {
                pageUrl = webUrl + '/Lists/CCINewsDiscussions/NewForm.aspx?NewsArticleID=' + itemId + '&Title=' + title + '&Source=' + webUrl + '/Pages/NewsCommentsIntermediatePage.aspx?ListItemId=' + itemId;
            }

            $("#lnkViewComments" + itemId).text('Add/View Comments (' + commentcount + ')');
            $('#discussions' + itemId).attr('src', pageUrl);
            $("#lnkViewComments" + itemId).click(function(){
                $('.comments' + itemId).toggle();
            });
        },
        error: function (error) {
            CCI_Common.LogException(_spPageContextInfo.userId, 'News Article App', _spPageContextInfo.siteAbsoluteUrl, JSON.stringify(error));
        }
    });

}

$(document).ready(function () {
    loadRollupNewsResources();
});

function getURLParameters(paramName)
{
    var sURL = window.document.URL.toString();
    if (sURL.indexOf("?") > 0)
    {
        var arrParams = sURL.split("?");
        var arrURLParams = arrParams[1].split("&");
        var arrParamNames = new Array(arrURLParams.length);
        var arrParamValues = new Array(arrURLParams.length);

        var i = 0;
        for (i = 0; i<arrURLParams.length; i++)
        {
            var sParam =  arrURLParams[i].split("=");
            arrParamNames[i] = sParam[0];
            if (sParam[1] != "")
                arrParamValues[i] = unescape(sParam[1]);
            else
                arrParamValues[i] = "No Value";
        }

        for (i=0; i<arrURLParams.length; i++)
        {
            if (arrParamNames[i] == paramName)
            {
                //alert("Parameter:" + arrParamValues[i]);
                return arrParamValues[i];
            }
        }
        return "No Parameters Found";
    }
}

</script>
<div id="NewsRollupDiv"></div>