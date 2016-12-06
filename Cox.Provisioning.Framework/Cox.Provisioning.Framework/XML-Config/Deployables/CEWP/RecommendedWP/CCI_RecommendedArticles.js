<script>
var NewsListName = "CCI-NewsArticle";
var NewsPreferenceListName = "CCI-NewsPreference";
//var NewsListKey = "CCINewsArticle";
var NewsListKey = "NewsArticlePagesLibrary";
var NewsPreferenceListKey = "CCINewsPreference";
var username;
var useremail;
var businessunit;
var department;
var userlocation;
var coe;
var division;
var industry;
var product;
var topic;
var companies;
var factory;
var appContextSite;
var NewsPreferenceList;
var articleList;
var NewsPreferenceListID;
var articleListID;
var searchQueryText;
var hostweb;
var newshostweb;

var listGuid;
var listItemId;
var itemKey;
var listItemCollection = [];
var context;
var newscontext;
var user;

var scriptbase = _spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/";

$(document).ready(function () {
    $('#related-content-results').html("<h3>Loading Apps ...</h3>");
    $.getScript(scriptbase + "SP.js",
        function () {
            $.getScript(scriptbase + "Reputation.js",
                function () {
                    $.getScript(scriptbase + "SP.RequestExecutor.js", loadResources);
                }
            );
        }
    );
});

function loadResources()
{
    context = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
    newscontext = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl + "/" + CCI_Common.GetConfig('NewsPageLibrarySourceSite') + "/");
    user = context.get_web().get_currentUser();
    hostweb = context.get_web();
    newshostweb = newscontext.get_web();
    articleListID = CCI_Common.GetConfig(NewsListKey);
    //articleListID = "9AFEFB0E-26BE-4FE8-ABC0-A19F84615DB4";
    NewsPreferenceListID = CCI_Common.GetConfig(NewsPreferenceListKey);
    //NewsPreferenceList = hostweb.get_lists().getByTitle(NewsPreferenceListName);
    //articleList = hostweb.get_lists().getByTitle(NewsListName);

    NewsPreferenceList = hostweb.get_lists().getById(NewsPreferenceListID);
    articleList = newshostweb.get_lists().getByTitle('Pages');

    context.load(user);
    //context.load(articleList);
    context.load(NewsPreferenceList);
    context.executeQueryAsync(onGetResourcesSuccess,onGetResourcesFail);
}

function onGetResourcesSuccess() {
    newscontext.load(articleList);
    newscontext.executeQueryAsync(test,onGetResourcesFail);
}

function test()
{
    username = user.get_title();
    useremail = user.get_email();
    //articleListID = articleList.get_id();
    //NewsPreferenceListID = NewsPreferenceList.get_id();

    searchQueryText = "ListID:" + NewsPreferenceListID + " RefinableString100:" + useremail + "'&selectproperties='RefinableString103,RefinableString101,RefinableString105,RefinableString106,RefinableString102,RefinableString108,RefinableString109,RefinableString107'";
    //$('#related-content-results').html("<h3>Retreiving News Preferences ...</h3>");
    getNewsPreference(searchQueryText);
}

// This function is executed if the above call fails
function onGetResourcesFail(sender, args) {
    //alert('Failed to load resources. Error:' + args.get_message());
}

function getNewsPreference(query)
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
                        $('#related-content-results').text('News Preferences not found for the user: ' + username);
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
                            searchQueryText = "ListID:" + articleListID;
                                                                    
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

                            //searchQueryText += "'&selectproperties='Title,RefinableString11,LikesCount,ListItemID'";
                            //searchQueryText += "'";
                            //$('#related-content-results').html("<h3>Retreiving News Articles ...</h3>");
                            getNewsResults();
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

function getNewsResults()
{
    var headers = {
        "Accept": "application/json;odata=verbose",
        "content-Type": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val()
    }

    var endPointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/search/postquery";
    var searchQuery = {
        'request': {
            '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
            'Querytext': searchQueryText,
            'RowLimit' : '4',
            'SortList' : 
            {
                'results' : [
                    {
                        'Property':'RefinableDate01',
                        'Direction': '1'
                    }
                ]
            },
            'SelectProperties' : {
                'results' : [
                    'CCI-NewsHeadLineOWSTEXT',
                    'CCI-NewsArticleImageOWSIMGE',
                    'CCI-DescriptionOWSMTXT',
                    'ListItemID'
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
            var searchResultsHtml = '<div class="box_warp"><div class="row custom_space"><div class="col-sm-12 box_warp"><div class="custom-box-warp mobile-custom-space gradient_bg_Grey"><h2>Recommended Articles</h2><hr/><div class="row">';
            for (var i = 0; i < queryResults.length; i++) {
                var r = queryResults[i];
                var cells = r.Cells;
                var title = '';
                var description = '';
                var pictureURL = '';
                var itemId = '';

                for (var x = 0; x < cells.results.length; x++) {
                    var c = cells.results[x];
                    switch(c.Key){
                        case "ListItemID": itemId = c.Value; break;
                        case "CCI-NewsArticleImageOWSIMGE": pictureURL = c.Value; break;
                        case "CCI-NewsHeadLineOWSTEXT": title = c.Value; break;
                        case "CCI-DescriptionOWSMTXT": description = c.Value; break;
                    }

                }
                if(title != null)
                {
                    if (title.length > 83) {
                        title = title.substring(0, 83) + "...";
                    }
                    if (description != null) {
                        if (description.length > 196) {
                            description = description.substring(0, 196) + " ...";
                        }
                    }
                    else
                    {
                        description = "";
                    }

                    var articlePage = webUrl+'/pages/NewsArticle.aspx?ListItemID='+itemId+'&Source=Recommended';
                    var startPos = pictureURL.indexOf("src=")+5;
                    var endPos = pictureURL.indexOf("style")-2;
                    pictureURL = pictureURL.substring(startPos, endPos);
                    if(pictureURL.indexOf("width")> -1)
                        pictureURL = pictureURL.substring(0, pictureURL.indexOf("width")-2);
                    //pictureURL = pictureURL + "?RenditionID=14";
                    searchResultsHtml += "<div class='col-xs-6 col-md-12 side_thumb_pro'><div class='item_box  mobile-custom-space'><a><h3>" +
                    title +
                    "</h3></a><div class='box_accordian'><img  class='image_fit' src='" + pictureURL + "'/><div class='LikeSection'><a class='likecount' id='RecommendedNewslikecount" + itemId + "'></a>&nbsp;<a href='#' class='like' onclick=\"javascript: LikeRecommended(" + itemId + ");\"><i class='fa fa-thumbs-up'></i><a href='#' id='RecommendedNewslikebutton" + itemId + "' class='LikeButton'  style='display:none;'></a></a></div><div class='overlay'> <a href='" + articlePage + "' class='expand'>" + description + "</a></div> </div></div></div>";
                    listItemCollection[listItemsCounter] = itemId;
                }
                listItemsCounter++;
            }
            searchResultsHtml += "</div></div></div></div></div>";
            $('#related-content-results').html(searchResultsHtml);
            for (var i = 0; i < listItemCollection.length; i++) {
                var itemId = listItemCollection[i];
                getRecommmendedLikes(itemId);
            }
        }
        else
        {
            $('#related-content-results').html("<h3>No recommended news articles found ...</h3>");
        }
    });
    call.fail(function (data) {
        //alert("Failure" + JSON.stringify(data));
    });
}

function getRecommmendedLikes(itemId) {
        
    var likebuttonid = "RecommendedNewslikebutton" + itemId;
    var likecountid = "RecommendedNewslikecount" + itemId;
    /*
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Counter\'>' + itemId + '</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');
    var collListItem = articleList.getItems(camlQuery);
    newscontext.load(collListItem);
    */
    var oListItem = articleList.getItemById(itemId);
    newscontext.load(oListItem, "LikedBy", "ID", "LikesCount");
    newscontext.executeQueryAsync(
        function () {
            var likeDisplay = true;
            var result = '';
            //alert(oListItem.get_item('LikedBy'));
            var $v_0 = oListItem.get_item('LikedBy');
            var likesCountInfo = oListItem.get_item('LikesCount');
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
            
            ChangeRecommmendedLikeText(likeDisplay, likesCountInfo, likebuttonid, likecountid);
            ChangeLikeText(likeDisplay, likesCountInfo, "newsarticle");
            ChangeLikeText(likeDisplay, likesCountInfo, "TrendingNews");
            ChangeLikeText(likeDisplay, likesCountInfo, "newsrollup");
        },
        Function.createDelegate(this, onQueryFailed));
}

function ChangeRecommmendedLikeText(like, count, likebuttonid, likecountid) {
        
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
function LikeRecommended(itemId) {
    var like = false;
    var likeButtonText = $("#RecommendedNewslikebutton" + itemId).text();
    listGuid = articleList.get_id();
        
    if (likeButtonText != "") {
        if (likeButtonText == "Like")
            like = true;
            
        EnsureScriptFunc('reputation.js', 'Microsoft.Office.Server.ReputationModel.Reputation', function () {
            Microsoft.Office.Server.ReputationModel.Reputation.setLike(newscontext, listGuid, itemId, like);
            newscontext.executeQueryAsync(
                function () {
                    ExecuteOrDelayUntilScriptLoaded(function () { getRecommmendedLikes(itemId) }, "sp.js");
                }, function (sender, args) {
                    // Do something if error
                    //alert('Request failed while setting like ' + args.get_message() + '\n' + args.get_stackTrace());
                });
        });
    }
}
</script>
<div id="related-content-results"></div>