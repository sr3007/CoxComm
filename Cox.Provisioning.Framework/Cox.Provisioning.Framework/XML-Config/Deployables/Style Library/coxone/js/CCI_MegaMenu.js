(function () {
    'use strict';
    var MainMenuListName = "CCI-MegaMenuMasterList";
    var MenuCategoryListName = "CCI-MegaMenuSubCategoryMasterList";
    var SubMenuListName = "CCI-MegaSubMenuMaster";

    var MainMenuListKey = "CCIMegaMenuMasterList";
    var MenuCategoryListKey = "CCIMegaMenuSubCategoryMasterList";
    var SubMenuListKey = "CCIMegaSubMenuMaster";

    var MainMenuList;
    var MenuCategoryList;
    var SubMenuList;
    var MainMenuListId;
    var MenuCategoryListId;
    var SubMenuListId;
    var mainMenu = [];
    var menuCategory = [];
    var subMenu = [];
    var tags = [];
    var siteUrl;
    var context;
    var hostweb;
    var searchQueryText;

    var menuHeaderHtml = '<div class="outer_header"><div class="row"><div class="menu"><button class="btn btn-mobile-menu"><i class="fa  fa-align-justify"></i></button></div><div class="menu-custom-collapse" id="navbar"><ul class="nav navbar-nav">';
    var menuHeaderHtmlMobile = '<div id="dl-menu" class="dl-menuwrapper"><button class="dl-trigger" type="button" data-toggle="collapse" data-target=".dl-menu">Open Menu</button><ul class="dl-menu">';

    var menuFooterHtml = '</ul></div></div>';
    var menuFooterHtmlMobile = '</ul></div>';

    var searchResultsHtml = '';
    var mygroups = [];

    var myLocalLocalCommunityCount = 0;
    var myLocalTeamsLeadershipCount = 0;
    var myLocalLocalResourcesCount = 0;
    var myLocalOtherRegionsCount = 0;
    var myWorkCount = 0;
    var myWorkPopularWorkToolsCount = 0;
    var myHRCount = 0;
    var myHRpopularHRToolsCount = 0;
    var myWorkMyDataCount = 0;
    var myWorkFormsPoliciesCount = 0;
    var myHRHealthLivingCount = 0;
    var myHRTimeMoneyCount = 0;
    var myHRCareerJourneyCount = 0;
    var myHRManagementCount = 0;
    var discoverDepartmentCount = 0;
    var discoverInitiativesCount = 0;
    var discoverLocationsCount = 0;
    var discoverCoeCount = 0;
    var discoverNewsCount = 0;
    var discoverDivisionsCount = 0;
    var discoverProductCount = 0;
    var discoverHelpCount = 0;

    var myLocalLocalCommunityCountMax = 8;
    var myLocalTeamsLeadershipCountMax = 8;
    var myLocalLocalResourcesCountMax = 8;
    var myLocalOtherRegionsCountMax = 8;
    var myWorkCountMax = 5;
    var myWorkPopularWorkToolsCountMax = 11;
    var myHRCountMax = 9;
    var myHRpopularHRToolsCountMax = 11;
    var myWorkMyDataCountMax = 4;
    var myWorkFormsPoliciesCountMax = 4;
    var myHRTimeMoneyCountMax = 8;
    var myHRHealthLivingCountMax = 8;
    var myHRCareerJourneyCountMax = 8;
    var myHRManagementCountMax = 8;
    var discoverDepartmentCountMax = 11;
    var discoverInitiativesCountMax = 4;
    var discoverLocationsCountMax = 6;
    var discoverCoeCountMax = 4;
    var discoverNewsCountMax = 4;
    var discoverDivisionsCountMax = 4;
    var discoverProductCountMax = 4;
    var discoverHelpCountMax = 4;

    function loadResources() {
        context = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
        hostweb = context.get_web();
        onGetResourcesSuccess();
        /*
        MainMenuList = hostweb.get_lists().getByTitle(MainMenuListName);
        MenuCategoryList = hostweb.get_lists().getByTitle(MenuCategoryListName);
        SubMenuList = hostweb.get_lists().getByTitle(SubMenuListName);
        context.load(MainMenuList);
        context.load(MenuCategoryList);
        context.load(SubMenuList);
        context.executeQueryAsync(onGetResourcesSuccess, onGetResourcesFail);
        */
    }

    function onGetResourcesSuccess() {
        //MainMenuListId = MainMenuList.get_id();
        //MenuCategoryListId = MenuCategoryList.get_id();
        //SubMenuListId = SubMenuList.get_id();

        MainMenuListId = CCI_Common.GetConfig(MainMenuListKey);
        MenuCategoryListId = CCI_Common.GetConfig(MenuCategoryListKey);
        SubMenuListId = CCI_Common.GetConfig(SubMenuListKey);

        renderMenu();
    }

    // This function is executed if the above call fails
    function onGetResourcesFail(sender, args) {
        //alert('Failed to load resources. Error:' + args.get_message());
    }

    function renderMenu() {
        siteUrl = _spPageContextInfo.siteAbsoluteUrl;
        getMyGroups();
        var context = new SP.ClientContext(siteUrl);
        searchQueryText = "ListID:" + MainMenuListId + " RefinableInt02:1";
        getMainMenus().then(
            function (mainMenu) {
                this.mainMenu = mainMenu;
                searchQueryText = "ListID:" + MenuCategoryListId + " RefinableInt02:1";
                getMainMenusCategories().then(
					function (menuCategories) {
					    this.menuCategory = menuCategories;
					    searchQueryText = "ListID:" + SubMenuListId + " RefinableInt02:1";
					    getSubMenus().then(
                            function (subMenu) {
                                //Do something with sub menu collection...
                                searchResultsHtml += menuFooterHtml;
                                searchResultsHtml = searchResultsHtml.replace(/\{.*?\}\s?/g, '&nbsp;');
                                $('#megamenudiv').html(searchResultsHtml);
                                renderMobileMenu();
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
            },
            function (error) {
                console.log(error.get_message());
            }
        );
    }

    function getMainMenus() {
        var def = $.Deferred();
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
                'RowLimit': '10',
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
                        'RefinableString04',
                        'RefinableString05',
                        'RefinableString06',
                        'RefinableString12',
                        'RefinableString120',
                        'RefinableString121',
                        'RefinableString122',
                        'RefinableString128'
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
                    var menutitle = '';
                    var menudesc = '';
                    var menuurl = '';
                    var menudesctitle = '';
                    var menudescbody = '';
                    var menudescbuttontitle = '';
                    var menudescbuttonurl = '';
                    var menutitlealias = '';

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "ListItemID": itemId = c.Value; break;
                            case "RefinableString04": menutitle = c.Value; break;
                            case "RefinableString05": menudesc = c.Value; break;
                            case "RefinableString06": menuurl = c.Value; break;
                            case "RefinableString12": menudesctitle = c.Value; break;
                            case "RefinableString120": menudescbody = c.Value; break;
                            case "RefinableString121": menudescbuttontitle = c.Value; break;
                            case "RefinableString122": menudescbuttonurl = c.Value; break;
                            case "RefinableString128": menutitlealias = c.Value; break;
                        }
                    }

                    if (menudesctitle == '') {
                        if (menuurl.indexOf(siteUrl) === -1) {
                            if (menutitle === "Discover") {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' target='_blank' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space DiscoverItem'><div class='col-sm-3 news_menus'> <a href='" + menudescbuttonurl + "' class='btn btn-primary custom-fill-btn'>" + menudescbuttontitle + "</a><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div>";
                            }
                            else {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' target='_blank' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space'><div class='col-sm-3 news_menus'> <a href='" + menudescbuttonurl + "' class='btn btn-primary custom-fill-btn'>" + menudescbuttontitle + "</a><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div>";
                            }
                        }
                        else {
                            if (menutitle === "Discover") {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space DiscoverItem'><div class='col-sm-3 news_menus'> <a href='" + menudescbuttonurl + "' class='btn btn-primary custom-fill-btn'>" + menudescbuttontitle + "</a><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div>";
                            }
                            else {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space'><div class='col-sm-3 news_menus'> <a href='" + menudescbuttonurl + "' class='btn btn-primary custom-fill-btn'>" + menudescbuttontitle + "</a><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div>";
                            }
                        }
                    }
                    else {
                        if (menuurl.indexOf(siteUrl) === -1) {
                            if (menutitle === "Discover") {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' target='_blank' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space DiscoverItem'><div class='col-sm-3 news_menus'> <h2 class='dropdown-header'>" +
                                menudesctitle + "</h2><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div></div>";
                            }
                            else {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' target='_blank' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space DiscoverItem'><div class='col-sm-3 news_menus'> <h2 class='dropdown-header'>" +
                                menudesctitle + "</h2><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div></div>";
                            }
                        }
                        else {
                            if (menutitle === "Discover") {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space DiscoverItem'><div class='col-sm-3 news_menus'> <h2 class='dropdown-header'>" +
                                menudesctitle + "</h2><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div></div>";
                            }
                            else {
                                searchResultsHtml += "<li class='dropdown  active'><a href='" + menuurl + "' aria-expanded='false' aria-haspopup='true' role='button' class='dropdown-toggle menu-divider'> " + menutitlealias + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space'><div class='col-sm-3 news_menus'> <h2 class='dropdown-header'>" +
                                menudesctitle + "</h2><p>" + menudescbody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{CCI_x002d_MenuTitle" + menutitle + "}{menuHorizontalTitle" + menutitle + "}</div></div>";
                            }
                        }
                    }
                }
                def.resolve(mainMenu);
            }
            else {
                $('#megamenudivtmp').html("<h3>Menu not found ...</h3>");
            }
        });
        call.fail(function (data) {
            ////alert("Failure" + JSON.stringify(data));
        });
        return def.promise();
    }

    function getMainMenusCategories() {
        var deferred = $.Deferred();
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
                        'RefinableString123',
                        'RefinableString128',
                        'RefinableString129'
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
                var searchMenuCategoryResultsHtml = "";
                for (var i = 0; i < queryResults.length; i++) {
                    var r = queryResults[i];
                    var cells = r.Cells;
                    var itemId = '';
                    var menusubcategorytitle = '';
                    var menusubcategorydesc = '';
                    var menusubcategoryurl = '';
                    var menurenderstyle = '';
                    var menumastertitle = '';
                    var menusubcategorytitlealias = '';
                    var menumaxlimit = 0;

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "ListItemID": itemId = c.Value; break;
                            case "RefinableString124": menusubcategorytitle = c.Value; break;
                            case "CCI-Description": menusubcategorydesc = c.Value; break;
                            case "RefinableString06": menusubcategoryurl = c.Value; break;
                            case "RefinableString126": menurenderstyle = c.Value; break;
                            case "RefinableString123": menumastertitle = c.Value; break;
                            case "RefinableString128": menusubcategorytitlealias = c.Value; break;
                            case "RefinableString129": menumaxlimit = c.Value; break;
                        }
                    }

                    var mainMenuCategoryItem = [];
                    mainMenuCategoryItem[0] = itemId;
                    mainMenuCategoryItem[1] = menusubcategorytitle;
                    mainMenuCategoryItem[2] = menusubcategorydesc;
                    mainMenuCategoryItem[3] = menusubcategoryurl;
                    mainMenuCategoryItem[4] = menumastertitle;
                    mainMenuCategoryItem[5] = menurenderstyle;
                    mainMenuCategoryItem[6] = menumaxlimit;
                    menuCategory[i] = mainMenuCategoryItem;

                    if (menurenderstyle == "Vertical") {
                        if (menumastertitle == "myWork")
                            searchMenuCategoryResultsHtml = "<div class='col-sm-3'><h2 class='dropdown-header'>" + menusubcategorytitlealias + "</h2>{menuCategoryTitle" + menusubcategorytitle + "}</div>";
                        else if (menumastertitle == "Discover")
                            searchMenuCategoryResultsHtml = "<div class='col-sm-2'><h2 class='dropdown-header'>" + menusubcategorytitlealias + "</h2>{menuCategoryTitle" + menusubcategorytitle + "}</div>";
                        else
                            searchMenuCategoryResultsHtml = "<div class='col-sm-3'><h2 class='dropdown-header'>" + menusubcategorytitlealias + "</h2>{menuCategoryTitle" + menusubcategorytitle + "}</div>";

                        var toBeReplaced = "{CCI_x002d_MenuTitle" + menumastertitle + "}";
                        var position = searchResultsHtml.indexOf(toBeReplaced);
                        if (position > -1)
                            searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');
                    }
                    else {
                        searchMenuCategoryResultsHtml = "<div class='col-sm-12'><div class='popular_work_wrap'><h2 class='dropdown-header'>" + menusubcategorytitlealias + "</h2>{menuHorizontalCategoryTitle" + menusubcategorytitle + "}</div></div>";
                        var toBeReplaced = "{menuHorizontalTitle" + menumastertitle + "}";
                        var position = searchResultsHtml.indexOf(toBeReplaced);
                        if (position > -1)
                            searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');
                    }
                }
                searchResultsHtml += "</div></li>";
                deferred.resolve(menuCategory);
            }
            else {
                $('#megamenudiv').html("<h3>Menu not found ...</h3>");
            }

        });
        call.fail(function (data) {
            ////alert("Failure" + JSON.stringify(data));
        });
        return deferred.promise();
    }

    function getSubMenus() {
        var deferred1 = $.Deferred();
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
                            if (submenutitle.indexOf("All") > -1) {
                                submenutitle = "<b>" + submenutitle + "</b>";
                            }


                            if (menuCategory[i][5] === "Vertical") {
                                if (menuCategory[i][1] === "My Groups") {
                                    if (mygroupsprocessed === 0) {
                                        for (var k = 0; k < mygroups.length; k++) {
                                            var mygroup = mygroups[k];
                                            searchSubMenuResultsHtml = "<ul class='check_side_area'><li> <a href='" + mygroup[1] + "'> " + mygroup[0] + "</a></li></ul>";
                                            var toBeReplaced = "{menuCategoryTitle" + menusubcategorytitle + "}";
                                            var position = searchResultsHtml.indexOf(toBeReplaced);
                                            if (position > -1)
                                                searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                        }
                                        mygroupsprocessed = 1;
                                    }
                                }
                                else {
                                    //myLocal
                                    if (menuCategory[i][4] === "myLocal") {
                                        if (menuCategory[i][1] === "Local Community") {
                                            if (myLocalLocalCommunityCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myLocalLocalCommunityCount++;
                                        }
                                        if (menuCategory[i][1] === "Teams & Leadership") {
                                            if (myLocalTeamsLeadershipCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myLocalTeamsLeadershipCount++;
                                        }
                                        if (menuCategory[i][1] === "Local Resources") {
                                            if (myLocalLocalResourcesCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myLocalLocalResourcesCount++;
                                        }
                                        if (menuCategory[i][1] === "Other Regions") {
                                            if (myLocalOtherRegionsCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myLocalOtherRegionsCount++;
                                        }
                                    }

                                    //myWork
                                    if (menuCategory[i][4] === "myWork") {
                                        if (menuCategory[i][1] === "My Data") {
                                            if (myWorkMyDataCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myWorkMyDataCount++;
                                        }
                                        if (menuCategory[i][1] === "Forms & Policies") {
                                            if (myWorkFormsPoliciesCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myWorkFormsPoliciesCount++;
                                        }
                                    }

                                    //myHR
                                    if (menuCategory[i][4] === "myHR") {
                                        if (menuCategory[i][1] === "Management") {
                                            if (myHRManagementCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myHRManagementCount++;
                                        }
                                        if (menuCategory[i][1] === "Health & Living") {
                                            if (myHRHealthLivingCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myHRHealthLivingCount++;
                                        }
                                        if (menuCategory[i][1] === "Time & Money") {
                                            if (myHRTimeMoneyCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myHRTimeMoneyCount++;
                                        }
                                        if (menuCategory[i][1] === "Career Journey") {
                                            if (myHRCareerJourneyCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                                if (submenutitle.indexOf("All") === -1)
                                                    continue;
                                            }
                                            else
                                                myHRCareerJourneyCount++;
                                        }
                                    }

                                    //Discover
                                    if (menuCategory[i][4] === "Discover") {
                                        if (menuCategory[i][1] === "Department") {
                                            if (discoverDepartmentCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverDepartmentCount++;
                                        }
                                        if (menuCategory[i][1] === "Initiatives") {
                                            if (discoverInitiativesCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverInitiativesCount++;
                                        }
                                        if (menuCategory[i][1] === "CEOs") {
                                            if (discoverCoeCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverCoeCount++;
                                        }
                                        if (menuCategory[i][1] === "Divisions") {
                                            if (discoverDivisionsCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverDivisionsCount++;
                                        }
                                        if (menuCategory[i][1] === "Help") {
                                            if (discoverHelpCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverHelpCount++;
                                        }
                                        if (menuCategory[i][1] === "Locations") {
                                            if (discoverLocationsCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverLocationsCount++;
                                        }
                                        if (menuCategory[i][1] === "News") {
                                            if (discoverNewsCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverNewsCount++;
                                        }
                                        if (menuCategory[i][1] === "Products") {
                                            if (discoverProductCount > parseInt(menuCategory[i][6].split(';')[0]))
                                                break;
                                            else
                                                discoverProductCount++;
                                        }
                                    }

                                    if (submenuurl.indexOf(siteUrl) === -1) {
                                        searchSubMenuResultsHtml = "<ul class='check_side_area'><li> <a href='" + submenuurl + "' target='_blank'> " + submenutitle + "</a></li></ul>";
                                    }
                                    else {
                                        searchSubMenuResultsHtml = "<ul class='check_side_area'><li> <a href='" + submenuurl + "'> " + submenutitle + "</a></li></ul>";
                                    }

                                    var toBeReplaced = "{menuCategoryTitle" + menusubcategorytitle + "}";
                                    var position = searchResultsHtml.indexOf(toBeReplaced);
                                    if (position > -1)
                                        searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                    break;
                                }
                            }
                            else {

                                //myWork
                                if (menuCategory[i][4] === "myWork") {
                                    if (menuCategory[i][1] === "Popular Work Tools") {
                                        if (myWorkPopularWorkToolsCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                            if (submenutitle.indexOf("All") === -1)
                                                continue;
                                        }
                                        else
                                            myWorkPopularWorkToolsCount++;
                                    }
                                }

                                //myHR
                                if (menuCategory[i][4] === "myHR") {
                                    if (menuCategory[i][1] === "Popular HR Tools") {
                                        if (myHRpopularHRToolsCount > parseInt(menuCategory[i][6].split(';')[0])) {
                                            if (submenutitle.indexOf("All") === -1)
                                                continue;
                                        }
                                        else
                                            myHRpopularHRToolsCount++;
                                    }
                                }

                                if (preHorizontalCounter === 0) {
                                    searchSubMenuHorizontalResultsHtml = preHorizontalDiv;
                                    if (submenuurl.indexOf(siteUrl) === -1) {
                                        searchSubMenuHorizontalResultsHtml += "<li> <a href='" + submenuurl + "' target='_blank'> " + submenutitle + "</a></li>";
                                    }
                                    else {
                                        searchSubMenuHorizontalResultsHtml += "<li> <a href='" + submenuurl + "'> " + submenutitle + "</a></li>";
                                    }
                                }
                                else {
                                    if (submenuurl.indexOf(siteUrl) === -1) {
                                        searchSubMenuHorizontalResultsHtml += "<li> <a href='" + submenuurl + "' target='_blank'> " + submenutitle + "</a></li>";
                                    }
                                    else {
                                        searchSubMenuHorizontalResultsHtml += "<li> <a href='" + submenuurl + "'> " + submenutitle + "</a></li>";
                                    }
                                }

                                preHorizontalCounter++;
                                if (preHorizontalCounter === 3) {
                                    searchSubMenuHorizontalResultsHtml += "</ul></div>";
                                    var toBeReplaced = "{menuHorizontalCategoryTitle" + menusubcategorytitle + "}";
                                    var position = searchResultsHtml.indexOf(toBeReplaced);
                                    if (position > -1)
                                        searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuHorizontalResultsHtml, searchResultsHtml.slice(position)].join('');
                                    searchSubMenuHorizontalResultsHtml = "";
                                    preHorizontalCounter = 0;
                                }
                                break;
                            }
                        }
                    }
                }
                deferred1.resolve(subMenu);
            }
            else {
                $('#megamenudiv').html("<h3>Menu not found ...</h3>");
            }

        });
        call.fail(function (data) {
            ////alert("Failure" + JSON.stringify(data));
        });
        return deferred1.promise();
    }

    function renderMobileMenu() {
        searchQueryText = "ListID:" + MainMenuListId + " RefinableInt02:1";
        getMainMenusMobile().then(
            function (mainMenu) {
                this.mainMenu = mainMenu;
                searchQueryText = "ListID:" + MenuCategoryListId + " RefinableInt02:1";
                getMainMenusCategoriesMobile().then(
                    function (menuCategories) {
                        this.menuCategory = menuCategories;
                        searchQueryText = "ListID:" + SubMenuListId + " RefinableInt02:1";
                        getSubMenusMobile().then(
                            function (subMenu) {
                                //Do something with sub menu collection...
                                searchResultsHtml += menuFooterHtmlMobile;
                                searchResultsHtml = searchResultsHtml.replace(/\{.*?\}\s?/g, '&nbsp;');
                                searchResultsHtml += "<script>$('#dl-menu' ).dlmenu({animationClasses : { classin : 'dl-animate-in-2', classout : 'dl-animate-out-2' }}); $('.btn-mobile-menu').click(function(){$('#dl-menu').toggleClass('open-mob-menu');});</script>";
                                $('#megamenudivmobile').html(searchResultsHtml);
                            },
                            function (error) {
                                console.log(error.get_message());
                            }
                        );//End of getSubMenusMobile
                    },
                    function (error) {
                        console.log(error.get_message());
                    }
                );//End of getMainMenusCategoriesMobile
            },
            function (error) {
                console.log(error.get_message());
            }
        );//End of getMainMenusMobile
    }

    function getMainMenusMobile() {
        var def = $.Deferred();
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
                'RowLimit': '10',
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
                        'RefinableString04',
                        'RefinableString05',
                        'RefinableString06',
                        'RefinableString12',
                        'RefinableString120',
                        'RefinableString121',
                        'RefinableString122',
                        'RefinableString128'
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
                searchResultsHtml = menuHeaderHtmlMobile;
                for (var i = 0; i < queryResults.length; i++) {
                    var r = queryResults[i];
                    var cells = r.Cells;
                    var itemId = '';
                    var menutitle = '';
                    var menudesc = '';
                    var menuurl = '';
                    var menudesctitle = '';
                    var menudescbody = '';
                    var menudescbuttontitle = '';
                    var menudescbuttonurl = '';
                    var menutitlealias = '';

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "ListItemID": itemId = c.Value; break;
                            case "RefinableString04": menutitle = c.Value; break;
                            case "RefinableString05": menudesc = c.Value; break;
                            case "RefinableString06": menuurl = c.Value; break;
                            case "RefinableString12": menudesctitle = c.Value; break;
                            case "RefinableString120": menudescbody = c.Value; break;
                            case "RefinableString121": menudescbuttontitle = c.Value; break;
                            case "RefinableString122": menudescbuttonurl = c.Value; break;
                            case "RefinableString128": menutitlealias = c.Value; break;
                        }
                    }
                    if (menudesctitle == '')
                        searchResultsHtml += "<li><a href='" + menuurl + "'>" + menutitlealias + "</a><ul class='dl-submenu'><li><a href='" + menudescbuttonurl + "'>" + menudescbuttontitle + "</a></li>{menuTitle" + menutitle + "}</ul></li>";
                    else
                        searchResultsHtml += "<li><a href='" + menuurl + "'>" + menutitlealias + "</a><ul class='dl-submenu'>{menuTitle" + menutitle + "}</ul></li>";

                }
                def.resolve(mainMenu);
            }
            else {
                $('#megamenudiv').html("<h3>Menu not found ...</h3>");
            }
        });
        call.fail(function (data) {
            ////alert("Failure" + JSON.stringify(data));
        });
        return def.promise();
    }

    function getMainMenusCategoriesMobile() {
        var deferred = $.Deferred();
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
                        'RefinableString123',
                        'RefinableString128',
                        'RefinableString129'
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
                var searchMenuCategoryResultsHtml = "";
                for (var i = 0; i < queryResults.length; i++) {
                    var r = queryResults[i];
                    var cells = r.Cells;
                    var itemId = '';
                    var menusubcategorytitle = '';
                    var menusubcategorydesc = '';
                    var menusubcategoryurl = '';
                    var menurenderstyle = '';
                    var menumastertitle = '';
                    var menusubcategorytitlealias = '';
                    var menumaxlimit = 0;

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "ListItemID": itemId = c.Value; break;
                            case "RefinableString124": menusubcategorytitle = c.Value; break;
                            case "CCI-Description": menusubcategorydesc = c.Value; break;
                            case "RefinableString06": menusubcategoryurl = c.Value; break;
                            case "RefinableString126": menurenderstyle = c.Value; break;
                            case "RefinableString123": menumastertitle = c.Value; break;
                            case "RefinableString128": menusubcategorytitlealias = c.Value; break;
                            case "RefinableString129": menumaxlimit = c.Value; break;
                        }
                    }

                    var mainMenuCategoryItem = [];
                    mainMenuCategoryItem[0] = itemId;
                    mainMenuCategoryItem[1] = menusubcategorytitle;
                    mainMenuCategoryItem[2] = menusubcategorydesc;
                    mainMenuCategoryItem[3] = menusubcategoryurl;
                    mainMenuCategoryItem[4] = menumastertitle;
                    mainMenuCategoryItem[5] = menurenderstyle;
                    mainMenuCategoryItem[6] = menumaxlimit;
                    menuCategory[i] = mainMenuCategoryItem;

                    searchMenuCategoryResultsHtml = "<li> <a href'#'>" + menusubcategorytitlealias + "</a><ul class='dl-submenu'>{menuCategoryTitle" + menusubcategorytitle + "}</ul></li>";
                    var toBeReplaced = "{menuTitle" + menumastertitle + "}";
                    var position = searchResultsHtml.indexOf(toBeReplaced);
                    searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');

                }
                deferred.resolve(menuCategory);
            }
            else {
                $('#megamenudiv').html("<h3>Menu not found ...</h3>");
            }

        });
        call.fail(function (data) {
            ////alert("Failure" + JSON.stringify(data));
        });
        return deferred.promise();
    }

    function getSubMenusMobile() {
        var deferred1 = $.Deferred();
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
                            if (menuCategory[i][1] === "My Groups") {
                                if (mygroupsprocessed === 0) {
                                    for (var k = 0; k < mygroups.length; k++) {
                                        var mygroup = mygroups[k];
                                        searchSubMenuResultsHtml = "<li> <a href='" + mygroup[1] + "'> " + mygroup[0] + "</a></li>";
                                        var toBeReplaced = "{menuCategoryTitle" + menusubcategorytitle + "}";
                                        var position = searchResultsHtml.indexOf(toBeReplaced);
                                        if (position > -1)
                                            searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                    }
                                    mygroupsprocessed = 1;
                                }
                            }
                            else {
                                searchSubMenuResultsHtml = "<li> <a href='" + submenuurl + "'>" + submenutitle + "</a></li>";
                                var toBeReplaced = "{menuCategoryTitle" + menusubcategorytitle + "}";
                                var position = searchResultsHtml.indexOf(toBeReplaced);
                                if (position > -1)
                                    searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                break;
                            }
                        }
                    }
                }
                deferred1.resolve(subMenu);
            }
            else {
                $('#megamenudivmobile').html("<h3>Menu not found ...</h3>");
            }

        });
        call.fail(function (data) {
            //alert("Failure" + JSON.stringify(data));
        });
        return deferred1.promise();
    }

    function getMyGroups() {
        var url = siteUrl + "/_api/search/query?querytext='path:\"" + siteUrl + "\" contentclass:STS_Web  WebTemplate=COMMUNITY'&rowlimit=5";
        $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json',
            success: function (data) {
                $.each(data.PrimaryQueryResult.RelevantResults.Table.Rows, function (index, row) {
                    var mygroup = [];
                    mygroup[0] = row.Cells[3].Value;
                    mygroup[1] = row.Cells[6].Value;
                    mygroups[index] = mygroup;
                });

                var rootLink = _spPageContextInfo.siteAbsoluteUrl.substring(0, _spPageContextInfo.siteAbsoluteUrl.indexOf('.'));
                var mySiteHostUrl = rootLink + "-my.sharepoint.com";
                var delveSiteUrl = mySiteHostUrl + "/_layouts/15/me.aspx" + "?v=work&p=" + _spPageContextInfo.userLoginName;

                var mygroup = [];
                mygroup[0] = "<b>All Groups</b>";
                mygroup[1] = delveSiteUrl;
                mygroups[mygroups.length] = mygroup;
            },
            error: function (error) {
                ////alert(JSON.stringify(error));
            }
        });
    }

    $(document).ready(function () {
        loadResources();
    });
})();