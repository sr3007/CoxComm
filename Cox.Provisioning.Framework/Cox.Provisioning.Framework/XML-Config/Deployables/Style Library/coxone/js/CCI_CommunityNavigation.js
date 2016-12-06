(function () {
    'use strict';
    var NavigationMasterListName = "CCI-Navigation";
    var NavigationChildListName = "CCI-NavigationChild";

    var NavigationMasterListKey = "CCINavigation";
    var NavigationChildListKey = "CCINavigationChild";

    var username;
    var useremail;
    var navigationMasterList;
    var navigationChildList;
    var navigationMasterListId;
    var navigationChildListId;
    var context;
    var webtitle;
    var user;
    var searchQueryText;
    var hostweb;
    var searchResultsHtml;
    var siteUrl;

    function renderNavigation()
    {
        loadResources();
    }

    //Load resources such as lists, current user etc.
    function loadResources()
    {
        siteUrl = _spPageContextInfo.webServerRelativeUrl;
        NavigationMasterListKey = NavigationMasterListKey + _spPageContextInfo.webTitle.replace(/\s/g, "");
        NavigationChildListKey = NavigationChildListKey + _spPageContextInfo.webTitle.replace(/\s/g, "");

        //alert(NavigationMasterListKey);
        //alert(NavigationChildListKey);

        context = new SP.ClientContext(siteUrl);
        user = context.get_web().get_currentUser();
        hostweb = context.get_web();

        navigationMasterListId = CCI_Common.GetConfig(NavigationMasterListKey);
        navigationChildListId = CCI_Common.GetConfig(NavigationChildListKey);

        //navigationMasterList = hostweb.get_lists().getByTitle(NavigationMasterListName);
        //navigationChildList = hostweb.get_lists().getByTitle(NavigationChildListName);

        navigationMasterList = hostweb.get_lists().getById(navigationMasterListId);
        navigationChildList = hostweb.get_lists().getById(navigationChildListId);

        context.load(user);
        context.load(navigationMasterList);
        context.load(navigationChildList);
        context.load(hostweb);
        context.executeQueryAsync(onGetResourcesSuccess,onGetResourcesFail);
    }

    //On successful resource loading.
    function onGetResourcesSuccess() {
        username = user.get_title();
        useremail = user.get_email();
        webtitle = hostweb.get_title();
        navigationMasterListId = navigationMasterList.get_id();
        navigationChildListId = navigationChildList.get_id();
        searchQueryText = "ListID:" + navigationMasterListId + " RefinableInt02:1";
        $('#communitycommunitynavigationdiv').html("<h3>Retreiving Navigation ...</h3>");
        getNewsMasterDetails();
    }

    // This function is executed if the above call fails
    function onGetResourcesFail(sender, args) {
        alert('Failed to load resources. Error:' + args.get_message());
        CCI_Common.LogException(_spPageContextInfo.userId, 'Community Navigation App', _spPageContextInfo.siteAbsoluteUrl, args.get_message());
    }

    //Getting navigation from master list.
    function getNewsMasterDetails()
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
                        'RowLimit' : '10',
                        'SortList' : 
                        {
                            'results' : [
                                {
                                        'Property':'RefinableInt03',
                                        'Direction': '0'
                                }
                            ]
                        },
                        'SelectProperties' : {
                            'results' : [
                                'RefinableString04',
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
                    searchResultsHtml = '<h2>{SiteTitle}</h2><div class="box_warp"><div class="custom-box-warp accordian_menus_custom clearfix"><div id="accordian_custom">';
                    for (var i = 0; i < queryResults.length; i++) {
                        var r = queryResults[i];
                        var cells = r.Cells;
                        var title = '';
                        var itemId = '';

                            for (var x = 0; x < cells.results.length; x++) {
                                var c = cells.results[x];
                                switch(c.Key){
                                case "ListItemID": itemId = c.Value; break;
                                case "RefinableString04": title = c.Value; break;
                                }

                            }
                        
                        searchResultsHtml += '<div class="accordian_box"><div class="heading_wrp"> <a data-toggle="collapse" data-parent="#accordian_custom" href="#accordian0' + itemId + '" aria-expanded="true" aria-controls="collapseOne">' + title + '</a></div><div id="accordian0' + itemId + '" class="panel-collapse collapse in" role="tabpanel"><ul class="acc_menuside">{MainTitle' + title + '}</ul></div></div>';
                        
                    }
                    searchResultsHtml += '{GlobalLinks}</div></div></div>';
                    searchQueryText = "ListID:" + navigationChildListId + " RefinableInt02:1";
                    getNewsChildDetails();
                }
                else
                {
                    $('#communitynavigationdiv').html("<h3>Navigation not found ...</h3>");
                }
                });
                call.fail(function (data) {
                    alert("Failure" + JSON.stringify(data));
                    CCI_Common.LogException(_spPageContextInfo.userId, 'Community Navigation App', _spPageContextInfo.siteAbsoluteUrl, JSON.stringify(data));
                });
            },
			error: function (data, errorCode, errorMessage) {
			    alert(errorMessage)
			    CCI_Common.LogException(_spPageContextInfo.userId, 'Community Navigation App', _spPageContextInfo.siteAbsoluteUrl, errorMessage);
			}
		});
    }

    //Getting child navigation from navigation sub list.
    function getNewsChildDetails()
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
                        'RowLimit' : '100',
                        'SortList' : 
                        {
                            'results' : [
                                {
                                        'Property':'RefinableInt03',
                                        'Direction': '0'
                                }
                            ]
                        },
                        'SelectProperties' : {
                            'results' : [
                                'RefinableString111',
                                'RefinableString112',
                                'RefinableString113',
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
                    for (var i = 0; i < queryResults.length; i++) {
                        var r = queryResults[i];
                        var cells = r.Cells;
                        var title = '';
                        var parenttitle = '';
                        var menuurl = '';
                        var itemId = '';
                        var searchNavChildResultsHtml = '';

                            for (var x = 0; x < cells.results.length; x++) {
                                var c = cells.results[x];
                                switch(c.Key){
                                case "ListItemID": itemId = c.Value; break;
                                case "RefinableString111": title = c.Value; break;
                                case "RefinableString112": menuurl = c.Value; break;
                                case "RefinableString113": parenttitle = c.Value; break;
                                }

                            }

                        //If there is no lookup column set for child navigation.
                        if(parenttitle != '')
                        {
                            searchNavChildResultsHtml = "<li> <a href='" + menuurl + "'>" + title + "</a></li>";
                            var toBeReplaced = "{MainTitle" + parenttitle + "}";
                            var position = searchResultsHtml.indexOf(toBeReplaced);
                            if (position > -1)
                                searchResultsHtml = [searchResultsHtml.slice(0, position), searchNavChildResultsHtml, searchResultsHtml.slice(position)].join('');
                        }
                    }
                    
                    var toBeReplaced = "{SiteTitle}";
                    var position = searchResultsHtml.indexOf(toBeReplaced);
                    searchResultsHtml = [searchResultsHtml.slice(0, position), document.getElementsByTagName("title")[0].innerHTML, searchResultsHtml.slice(position)].join('');
                    searchResultsHtml = searchResultsHtml.replace(/\{.*?\}\s?/g, '&nbsp;');
                    $('#communitynavigationdiv').html(searchResultsHtml);
                }
                else
                {
                    $('#communitynavigationdiv').html("<h3>Navigation not found ...</h3>");
                }
                });
                call.fail(function (data) {
                    alert("Failure" + JSON.stringify(data));
                    CCI_Common.LogException(_spPageContextInfo.userId, 'Community Navigation App', _spPageContextInfo.siteAbsoluteUrl, JSON.stringify(data));
                });
    }

    $(document).ready(function () {
        renderNavigation();
    });
})();