<script>
    var NewsListName = "News Article";
var NewsPreferenceListName = "NewsPreference";
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

var listGuid;
var listItemId;
var itemKey;
var listItemCollection = [];
var context;
var user;

var scriptbase = _spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/";

$(document).ready(function () {
    $('#related-content-results').html("<h3>Loading, please wait...</h3>");
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
    context = SP.ClientContext.get_current();
    user = context.get_web().get_currentUser();
    hostweb = context.get_web();
    NewsPreferenceList = hostweb.get_lists().getByTitle(NewsPreferenceListName);
    articleList = hostweb.get_lists().getByTitle(NewsListName);
    context.load(user);
    context.load(articleList);
    context.load(NewsPreferenceList);
    context.executeQueryAsync(onGetResourcesSuccess,onGetResourcesFail);
}

function onGetResourcesSuccess() {
    username = user.get_title();
    useremail = user.get_email();
    articleListID = articleList.get_id();
    NewsPreferenceListID = NewsPreferenceList.get_id();
    searchQueryText = "ListID:" + NewsPreferenceListID + " RefinableString100:" + useremail + "'&selectproperties='RefinableString103,RefinableString101,RefinableString105,RefinableString106,RefinableString102,RefinableString108,RefinableString109,RefinableString107'";
    $('#related-content-results').html("<h3>Retreiving News Preferences ...</h3>");
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
                                var endPos = String(coe).indexOf("GP0")-1;
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

                            //Department
                            if (department != undefined || department != null || department.length > 0) {
                                var endPos = String(department).indexOf("GP0")-1;
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

                            //Division
                            if (division != undefined || division != null || division.length > 0) {
                                var endPos = String(division).indexOf("GP0")-1;
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

                            //Industry
                            if (industry != undefined || industry != null || industry.length > 0) {
                                var endPos = String(industry).indexOf("GP0")-1;
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

                            //Location
                            if (userlocation != undefined || userlocation != null || userlocation.length > 0) {
                                var endPos = String(userlocation).indexOf("GP0")-1;
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
                                                                    
                            //Companies
                            if (companies != undefined || companies != null || companies.length > 0) {
                                var endPos = String(companies).indexOf("GP0")-1;
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

                            //Product
                            if (product != undefined || product != null || product.length > 0) {
                                var endPos = String(product).indexOf("GP0")-1;
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

                            //Topic
                            if (topic != undefined || topic != null || topic.length > 0) {
                                var endPos = String(topic).indexOf("GP0")-1;
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

                            //searchQueryText += "'&selectproperties='Title,RefinableString11,LikesCount,ListItemID'";
                            //searchQueryText += "'";
                            $('#related-content-results').html("<h3>Retreiving News Articles ...</h3>");
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

    //'Querytext': 'Birthday>"' + now2k.subtract('days', 1).format("MM-DD-YYYY") + '" AND Birthday<"' + now2k.add('days', 31).format("MM-DD-YYYY") + '"',
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
                    },
                    {
                        'Property':'RefinableDate03',
                        'Direction': '0'
                    }
                ]
            },
            'SelectProperties' : {
                'results' : [
                    'Title',
                    'RefinableString11',
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
            var searchResultsHtml = '<div class="box_warp"><div class="row custom_space"><div class="col-sm-12 box_warp"><div class="custom-box-warp mobile-custom-space"><h2 class="panel-title mob_accordian">Recommended Articles</h2><hr/><div class="box_accordian">';
            for (var i = 0; i < queryResults.length; i++) {
                var r = queryResults[i];
                var cells = r.Cells;
                var title = '';
                var pictureURL = '';
                var itemId = '';

                for (var x = 0; x < cells.results.length; x++) {
                    var c = cells.results[x];
                    switch(c.Key){
                        case "ListItemID": itemId = c.Value; break;
                        case "RefinableString11": pictureURL = c.Value; break;
                        case "Title": title = c.Value; break;
                    }

                }
                ////alert(itemId + ", " + pictureURL + ", " + title);
                var articlePage = webUrl+'/pages/NewsArticle.aspx?ListItemID='+itemId;
                var startPos = pictureURL.indexOf("src=")+5;
                var endPos = pictureURL.indexOf("style")-2;
                pictureURL = pictureURL.substring(startPos, endPos);
                if(pictureURL.indexOf("width")> -1)
                    pictureURL = pictureURL.substring(0, pictureURL.indexOf("width")-2);
                pictureURL = pictureURL + "?RenditionID=14";
                searchResultsHtml += "<div class='side_thumb_pro'><div class='item_box  mobile-custom-space'><a href='" + articlePage + "'><h3 class='mob_accordian'>" +
                title +
                "</h3></a><div class='box_accordian'><img  class='image_fit' src='" + pictureURL + "'/><div class='LikeSection'><a class='likecount' id='RecommendedNewslikecount" + itemId + "'></a><a href='#' class='like' onclick=\"javascript: LikeRecommended(" + itemId + ");\"><i class='fa fa-thumbs-up'></i><a href='#' id='RecommendedNewslikebutton" + itemId + "' class='LikeButton'  style='display:none;'></a></a></div> </div></div></div>";
                listItemCollection[listItemsCounter] = itemId;
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
    /*
                        var restUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?querytext='" + searchQueryText;
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
                                                            $('#related-content-results').text('No related articles were found');
                                                        }
                                                        else {
                                                            var listItemsCounter = 0;
                                                            var searchResultsHtml = '<div class="col-sm-4 box_warp"><div class="row custom_space"><div class="col-sm-12 box_warp"><div class="panel panel-default custom-box-warp mobile-custom-space"><h2 class="panel-title mob_accordian">Recommended Articles</h2><div class="box_accordian">';
                                                            $.each(results, function (index, result) {
                                                                if(listItemsCounter < 4)
                                                                {
                                                                    var pictureURL = String(result.Cells.results[3].Value);
                                                                    var startPos = pictureURL.indexOf("src=")+5;
                                                                    var endPos = pictureURL.indexOf("style")-2;
                                                                    pictureURL = pictureURL.substring(startPos, endPos);
                                                                    if(pictureURL.indexOf("width")> -1)
                                                                        pictureURL = pictureURL.substring(0, pictureURL.indexOf("width")-2);
                                                                    pictureURL = pictureURL + "?RenditionID=1";
                                                                    searchResultsHtml += "<div class='side_thumb_pro'><div class='item_box  mobile-custom-space'><h3 class='mob_accordian'>" +
                                                                    result.Cells.results[2].Value +
                                                                    "</h3><div class='box_accordian'><img  class='image_fit' src='" + pictureURL + "'/><div class='LikeSection'><a href='#' class='like'><span class='likecount' id='RecommendedNewslikecount" + result.Cells.results[5].Value + "' onclick=\"javascript: LikePage(" + result.Cells.results[5].Value + ");\"></span><a href='#' id='RecommendedNewslikebutton" + result.Cells.results[5].Value + "' class='LikeButton'  style='display:none;'></a></a></div> </div></div></div>";
                                                                    listItemCollection[listItemsCounter] = result.Cells.results[5].Value;
                                                                    listItemsCounter++;
                                                                }
                                                            });
                                                            searchResultsHtml += "</div></div></div></div></div>";
                                                            $('#related-content-results').html(searchResultsHtml);
                                                            for (var i = 0; i < listItemCollection.length; i++) {
                                                                var itemId = listItemCollection[i];
                                                                //$("#RecommendedNewslikecount" + itemId).click(function () { LikePage(itemId) });
                                                                getLikes(itemId);
                                                            }
                                                        }
                                                    },
                                                    error: function (error) {
                                                        //alert(JSON.stringify(error));
                                                    }
                                    });
    */
}

function getRecommmendedLikes(itemId) {
        
    var likebuttonid = "RecommendedNewslikebutton" + itemId;
    var likecountid = "RecommendedNewslikecount" + itemId;
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Counter\'>' + itemId + '</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');
    var collListItem = articleList.getItems(camlQuery);
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
                        //  //alert(result);
                    }
                }
                else
                    likesCountInfo = 0;
            }
            ChangeRecommmendedLikeText(likeDisplay, likesCountInfo, likebuttonid, likecountid);
            ChangeLikeText(likeDisplay, likesCountInfo, "newsarticle");
            ChangeLikeText(likeDisplay, likesCountInfo, "TrendingNews");
            ChangeLikeText(likeDisplay, likesCountInfo, "NewsGrid");
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
            Microsoft.Office.Server.ReputationModel.Reputation.setLike(context, listGuid, itemId, like);
            context.executeQueryAsync(
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