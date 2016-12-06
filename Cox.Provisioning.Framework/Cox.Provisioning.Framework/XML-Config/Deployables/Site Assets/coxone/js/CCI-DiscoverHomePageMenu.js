<script>
    'use strict';
    var MenuCategoryListName = "CCI-MegaMenuSubCategoryMasterList";
    var SubMenuListName = "CCI-MegaSubMenuMaster";

    var MenuCategoryListKey = "CCIMegaMenuSubCategoryMasterList";
    var SubMenuListKey = "CCIMegaSubMenuMaster";

    var MenuCategoryList;
    var SubMenuList;
    
    var MenuCategoryListId;
    var SubMenuListId;
    
    var menuCategory = [];
    var subMenu = [];
    var tags = [];
    var siteUrl;
    var context;
    var hostweb;
    var searchQueryText;

    var menuHeaderHtml = '<div class="Discovermenu">';
    var menuFooterHtml = '</div>';
    
    var searchResultsHtml = '';
    var mygroups = [];

    function loadDiscoverResources() {
        context = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
        hostweb = context.get_web();
        onGetDiscoverResourcesSuccess();
    }

    function onGetDiscoverResourcesSuccess() {
        MenuCategoryListId = CCI_Common.GetConfig(MenuCategoryListKey);
        SubMenuListId = CCI_Common.GetConfig(SubMenuListKey);
        renderDiscoverMenu();
    }

    // This function is executed if the above call fails
    function onGetDiscoverResourcesFail(sender, args) {
        //alert('Failed to load resources. Error:' + args.get_message());
    }

    function renderDiscoverMenu() {
        siteUrl = _spPageContextInfo.siteAbsoluteUrl;
        var context = new SP.ClientContext(siteUrl);
                searchQueryText = "ListID:" + MenuCategoryListId + " RefinableInt02:1 RefinableString123:Discover";
                getDiscoverCategories().then(
					function (menuCategories) {
					    this.menuCategory = menuCategories;
					    searchQueryText = "ListID:" + SubMenuListId + " RefinableInt02:1";
					    getDiscoverSubMenus().then(
                            function (subMenu) {
                                //Do something with sub menu collection...
                                searchResultsHtml += menuFooterHtml;
                                searchResultsHtml = searchResultsHtml.replace(/\{.*?\}\s?/g, '&nbsp;');
                                $('#DiscoverDiv').html(searchResultsHtml);
                                //renderMobileMenu();
                            },
                            function (error) {
                                console.log(error.get_message());
                            }
                        );
					},
					function (error) {
					    console.log(error.get_message());
					}
				);
    }

    function getDiscoverCategories() {
        var deferredDiscover = $.Deferred();
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
                'RowLimit': '30',
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableInt03',
                            'Direction': '0'
                        }
                    ]
                },
                'SelectProperties': {
                    'results': [
                        'ListItemID',
                        'RefinableString124',
                        'CCI-Description',
                        'RefinableString06',
                        'RefinableString126',
                        'RefinableString123'
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
                searchResultsHtml = menuHeaderHtml;
                for (var i = 0; i < queryResults.length; i++) {
                    var r = queryResults[i];
                    var cells = r.Cells;
                    var itemId = '';
                    var menusubcategorytitle = '';
                    var menusubcategorydesc = '';
                    var menusubcategoryurl = '';
                    var menurenderstyle = '';
                    var menumastertitle = '';

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "ListItemID": itemId = c.Value; break;
                            case "RefinableString124": menusubcategorytitle = c.Value; break;
                            case "CCI-Description": menusubcategorydesc = c.Value; break;
                            case "RefinableString06": menusubcategoryurl = c.Value; break;
                            case "RefinableString126": menurenderstyle = c.Value; break;
                            case "RefinableString123": menumastertitle = c.Value; break;
                        }
                    }

                    var mainMenuCategoryItem = [];
                    mainMenuCategoryItem[0] = itemId;
                    mainMenuCategoryItem[1] = menusubcategorytitle;
                    mainMenuCategoryItem[2] = menusubcategorydesc;
                    mainMenuCategoryItem[3] = menusubcategoryurl;
                    mainMenuCategoryItem[4] = menumastertitle;
                    mainMenuCategoryItem[5] = menurenderstyle;
                    menuCategory[i] = mainMenuCategoryItem;

                    
                    searchResultsHtml += "<div class='col-sm-3'><h2 class='dropdown-header'>" + menusubcategorytitle + "</h2>{menuCategoryTitle" + menusubcategorytitle + "}</div>";
                }
                //searchResultsHtml += "</div></li>";
                deferredDiscover.resolve(menuCategory);
            }
            else {
                $('#DiscoverDiv').html("<h3>Menu not found ...</h3>");
            }

        });
        call.fail(function (data) {
            alert("Failure" + JSON.stringify(data));
        });
        return deferredDiscover.promise();
    }

    function getDiscoverSubMenus() {
        var deferred1Discover = $.Deferred();
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
                'RowLimit': '1000',
                'SortList':
                {
                    'results': [
                        {
                            'Property': 'RefinableInt03',
                            'Direction': '0'
                        }
                    ]
                },
                'SelectProperties': {
                    'results': [
                        'ListItemID',
                        'RefinableString127',
                        'CCI-Description',
                        'RefinableString06',
                        'RefinableString111'
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
                var searchSubMenuResultsHtml = "";
                var searchSubMenuHorizontalResultsHtml = "";
                var preHorizontalCounter = 0;
                var mygroupsprocessed = 0;

                for (var z = 0; z < queryResults.length; z++) {
                    var r = queryResults[z];
                    var cells = r.Cells;
                    var itemId = '';
                    var menusubcategorytitle = '';
                    var submenutitle = '';
                    var submenudesc = '';
                    var submenuurl = '';

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "ListItemID": itemId = c.Value; break;
                            case "RefinableString127": menusubcategorytitle = c.Value; break;
                            case "CCI-Description": submenudesc = c.Value; break;
                            case "RefinableString06": submenuurl = c.Value; break;
                            case "RefinableString111": submenutitle = c.Value; break;
                        }
                    }
                    
                    for (var i = 0; i < menuCategory.length; i++) {
                        if (menuCategory[i][1] == menusubcategorytitle) {
                            var preHorizontalDiv = "<div class='col-sm-3'><ul class='check_side_area'>";

                                    searchSubMenuResultsHtml = "<ul class='check_side_area'><li> <a href='" + submenuurl + "'> " + submenutitle + "</a></li></ul>";
                                    var toBeReplaced = "{menuCategoryTitle" + menusubcategorytitle + "}";
                                    var position = searchResultsHtml.indexOf(toBeReplaced);
                                    if (position > -1)
                                        searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                    break;
                        }
                    }
                }
                deferred1Discover.resolve(subMenu);
            }
            else {
                $('#DiscoverDiv').html("<h3>Menu not found ...</h3>");
            }

        });
        call.fail(function (data) {
            alert("Failure" + JSON.stringify(data));
        });
        return deferred1Discover.promise();
    }

    $(document).ready(function () {
        loadDiscoverResources();
    });
</script>
<div id="DiscoverDiv"></div>