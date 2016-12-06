(function () {
    'use strict';
    var username;
    var businessunit;
    var department;
    var userlocation;
    var operationalDepartmentandSubledger;
    var personaCT = 'PersonaCT';
    var menuMasterCT = 'MeaMenuMasterListCT';
    var mainMenu = [];
    var menuCategory = [];
    var subMenu = [];
    var tags = [];
    var siteUrl;

    var menuHeaderHtml = '<div class="outer_header"><div class="row"><div class="menu"><button class="btn btn-mobile-menu"><i class="fa  fa-align-justify"></i></button></div><div class="menu-custom-collapse" id="navbar"><ul class="nav navbar-nav">';
    var menuHeaderHtmlMobile = '<div id="dl-menu" class="dl-menuwrapper"><button class="dl-trigger" type="button" data-toggle="collapse" data-target=".dl-menu">Open Menu</button><ul class="dl-menu">';

    var menuFooterHtml = '</ul></div></div>';
    var menuFooterHtmlMobile = '</ul></div>';

    var searchResultsHtml = '';
    var user;
    var mygroups = [];

    function renderMobileMenu() {
        getUserProfileProperty("CareerLevel").then(
					function (jsonObject) {
					    ////alert(jsonObject);
					    var careerLevel = parseInt(jsonObject.substring(1, jsonObject.length - 1));
					    getUserProfileProperty("ManagerLevel").then(
                            function (jsonObject) {
                                ////alert(jsonObject);
                                var managerLevel = parseInt(jsonObject.substring(1, jsonObject.length - 1));

                                getMainMenusMobile("contenttype:MeaMenuMasterListCT'&selectproperties='MenuTitle,MenuDescription,MenuUrl'").then(
                                    function (mainMenu) {
                                        this.mainMenu = mainMenu;
                                        getMainMenusCategoriesMobile(careerLevel, managerLevel).then(
                                            function (menuCategories) {
                                                this.menuCategory = menuCategories;
                                                getSubMenusMobile(menuCategories, careerLevel, managerLevel).then(
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
                            },
                            function (error) {
                                console.log(error.get_message());
                            }
                            );//End of Manager Level
					},
					function (error) {
					    console.log(error.get_message());
					}
					);//End of Career Level
    }

    function renderMenu() {
        getMyGroups();
        siteUrl = _spPageContextInfo.siteAbsoluteUrl;
        var context = new SP.ClientContext(siteUrl);
        user = context.get_web().get_currentUser();
        context.load(user);
        context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
    }

    // This function is executed if the above call is successful
    // It replaces the contents of the 'message' element with the user name
    function onGetUserNameSuccess() {
        username = user.get_title();
        //getSearchResultsUsingREST("contenttype:" + personaCT + "'&selectproperties='CurrentUser,BusinessUnit,UserDepartment'");
        getUserProfileProperty("Location").then(
                function (jsonObject) {
                    var userlocation = jsonObject.substring(1, jsonObject.length - 1);
                    ////alert(userlocation);
                    getUserProfileProperty("CareerLevel").then(
                            function (jsonObject) {
                                ////alert(jsonObject);
                                var careerLevel = parseInt(jsonObject.substring(1, jsonObject.length - 1));
                                getUserProfileProperty("ManagerLevel").then(
                                    function (jsonObject) {
                                        ////alert(jsonObject);
                                        var managerLevel = parseInt(jsonObject.substring(1, jsonObject.length - 1));
                                        getUserProfileProperty("OperationalDepartmentandSubledger").then(
                                    function (jsonObject) {
                                        ////alert(jsonObject);
                                        var operationalDepartmentandSubledger = jsonObject;
                                        ////alert(operationalDepartmentandSubledger);
                                        getMainMenus1("contenttype:MeaMenuMasterListCT'&selectproperties='MenuTitle,MenuDescription,MenuUrl'").then(
                                            function (mainMenu) {
                                                this.mainMenu = mainMenu;
                                                getMainMenusCategories(careerLevel, managerLevel, userlocation, operationalDepartmentandSubledger).then(
                                                    function (menuCategories) {
                                                        this.menuCategory = menuCategories;
                                                        getSubMenus(menuCategories, careerLevel, managerLevel, userlocation, operationalDepartmentandSubledger).then(
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
                                                        //}
                                                    },
                                                    function (error) {
                                                        console.log(error.get_message());
                                                    }
                                                );
                                                //}
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
                            },
                            function (error) {
                                console.log(error.get_message());
                            }
                            );
                },
        function (error) {
            console.log(error.get_message());
        });
    }

    // This function is executed if the above call fails
    function onGetUserNameFail(sender, args) {
        //alert('Failed to get user name. Error:' + args.get_message());
    }
    function getSearchResultsUsingREST(queryText) {
        var searchUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/search/query?querytext='" + queryText;
        $.ajax(
        {
            url: searchUrl,
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: onGetSearchResultsSuccess,
            error: onGetSearchResultsFail
        });
    }

    function onGetSearchResultsSuccess(data) {
        //var jsonObject = JSON.parse(data.body);
        var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
        if (results.length == 0) {
            $('#megamenudiv').text('No related documents were found');
        }
        else {
            $.each(results, function (index, result) {
                //if (result.Cells.results[2].Value.indexOf(username) > -1) {
                businessunit = result.Cells.results[3].Value.substring(0, result.Cells.results[3].Value.indexOf(';'));
                department = result.Cells.results[4].Value.substring(0, result.Cells.results[4].Value.indexOf(';'));
                //}
            });

        }
    }

    function onGetSearchResultsFail(data, errorCode, errorMessage) {
        $('#megamenudiv').text('An error occurred whilst searching for related content - ' + errorMessage);
    }

    function getUserProfileProperty(profileProperty) {
        var userProfileDef = $.Deferred();
        var CareerLevelJSON = getUserProfilePropertyValue(profileProperty);
        userProfileDef.resolve(CareerLevelJSON);
        return userProfileDef.promise();
    }

    function getMyGroups() {
        var siteUrl = _spPageContextInfo.siteAbsoluteUrl;
        var url = siteUrl + "/_api/search/query?querytext='path:\"" + siteUrl + "\" contentclass:STS_Web'";
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

            },
            error: function (error) {
                //alert(JSON.stringify(error));
            }
        });
    }

    function getMainMenusMobile(queryText) {
        var def = $.Deferred();
        $.ajax({
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/contextinfo",
            type: "POST",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue);
                var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Mega Menu Master List')/Items?$select=ID,MenuTitle,MenuDescription,MenuUrl,MenuDescriptionTitle,MenuDescriptionBody,MenuDescriptionButtonTitle,MenuDescriptionButtonUrl&$filter=MenuIsVisible eq 1&$orderby=MenuOrderLevel asc";
                $.ajax({
                    url: restUrl,
                    type: "GET",
                    headers: {
                        "Accept": "application/json; odata=verbose",
                        "Content-Type": "application/json; odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        if (data.d.results.length > 0) {
                            searchResultsHtml = menuHeaderHtmlMobile;
                            $.each(data.d.results, function (index, item) {
                                var mainMenuItem = [];
                                mainMenuItem[0] = item.ID;
                                mainMenuItem[1] = item.MenuDescriptionTitle;
                                mainMenu[index] = mainMenuItem;

                                if (item.MenuDescriptionTitle == null) {
                                    searchResultsHtml += "<li><a href='" + item.MenuUrl + "'>" + item.MenuTitle + "</a><ul class='dl-submenu'><li><a href='" + item.MenuDescriptionButtonUrl + "'>" + item.MenuDescriptionButtonTitle + "</a></li>{menuTitle" + item.MenuTitle + "}</ul></li>";
                                    //searchResultsHtml += "<li><a href='" + item.MenuUrl + "'>" + item.MenuTitle + "</a><ul class='dl-submenu'>{menuTitle" + item.MenuTitle + "}</ul></li>";
                                }
                                else {
                                    searchResultsHtml += "<li><a href='" + item.MenuUrl + "'>" + item.MenuTitle + "</a><ul class='dl-submenu'>{menuTitle" + item.MenuTitle + "}</ul></li>";
                                }

                            });

                            def.resolve(mainMenu);
                        }
                    },
                    error: function (error) {
                        ////alert(JSON.stringify(error));
                        def.reject(sender, args);
                    }
                });
            },
            error: function (data, errorCode, errorMessage) {
                //alert(errorMessage)
            }
        });
        return def.promise();
    }

    function getMainMenusCategoriesMobile(careerLevel, managerLevel) {
        var deferred = $.Deferred();
        var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Mega Menu Sub Category Master List')/Items?$select=ID,MenuSubCategoryTitle,MenuSubCategoryDescription,MenuSubCategoryUrl,MenuRenderStyle,MegaMenuMasterTitle/MenuTitle&$expand=MegaMenuMasterTitle&$orderby=MenuOrderLevel asc&$filter=(MenuIsVisible eq 1)";
        $.ajax({
            url: restUrl,
            type: "GET",
            headers: {
                "Accept": "application/json; odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                if (data.d.results.length > 0) {
                    var searchMenuCategoryResultsHtml = "";
                    $.each(data.d.results, function (index, item) {

                        var mainMenuCategoryItem = [];
                        mainMenuCategoryItem[0] = item.ID;
                        mainMenuCategoryItem[1] = item.MenuSubCategoryTitle;
                        mainMenuCategoryItem[2] = item.MenuSubCategoryDescription;
                        mainMenuCategoryItem[3] = item.MenuSubCategoryUrl;
                        mainMenuCategoryItem[4] = item.MegaMenuMasterTitle;
                        mainMenuCategoryItem[5] = item.MenuRenderStyle;
                        menuCategory[index] = mainMenuCategoryItem;

                        if (item.MenuSubCategoryTitle === "People Management") {
                            if (careerLevel >= 10 && managerLevel >= 5) {
                                searchMenuCategoryResultsHtml = "<li> <a href'#'>" + item.MenuSubCategoryTitle + "</a><ul class='dl-submenu'>{menuCategoryTitle" + item.MenuSubCategoryTitle + "}</ul></li>";
                                var toBeReplaced = "{menuTitle" + item.MegaMenuMasterTitle["MenuTitle"] + "}";
                                var position = searchResultsHtml.indexOf(toBeReplaced);
                                if (position > -1)
                                    searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');
                            }
                        }
                        else {
                            searchMenuCategoryResultsHtml = "<li> <a href'#'>" + item.MenuSubCategoryTitle + "</a><ul class='dl-submenu'>{menuCategoryTitle" + item.MenuSubCategoryTitle + "}</ul></li>";
                            var toBeReplaced = "{menuTitle" + item.MegaMenuMasterTitle["MenuTitle"] + "}";
                            var position = searchResultsHtml.indexOf(toBeReplaced);
                            if (position > -1)
                                searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');
                        }

                    });
                    deferred.resolve(menuCategory);
                }
            },
            error: function (error) {
                ////alert(JSON.stringify(error));
                deferred.reject(sender, args);
            }
        });
        //}
        return deferred.promise();
    }

    function getSubMenusMobile(menuCategory, careerLevel, managerLevel) {
        var deferred1 = $.Deferred();
        var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Mega Sub Menu Master')/Items?$select=ID,MegaMenuSubCategoryMasterTitle/MenuSubCategoryTitle,SubMenuTitle,SubMenuDescription,SubMenuUrl&$expand=MegaMenuSubCategoryMasterTitle&$orderby=MenuOrderLevel asc&$filter=(MenuIsVisible eq 1)&$top=1000";
        $.ajax({
            url: restUrl,
            type: "GET",
            headers: {
                "Accept": "application/json; odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                if (data.d.results.length > 0) {
                    var searchSubMenuResultsHtml = "";
                    var mygroupsprocessed = 0;
                    $.each(data.d.results, function (index, item) {

                        for (var i = 0; i < menuCategory.length; i++) {
                            if (menuCategory[i][1] == item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"]) {
                                /*if (menuCategory[i][1] === "People Management") {
                                    if (careerLevel >= 10 && managerLevel >= 5) {
                                        searchSubMenuResultsHtml = "<li> <a href='" + item.SubMenuUrl + "'>" + item.SubMenuTitle + "</a></li>";
                                        var toBeReplaced = "{menuCategoryTitle" + item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"] + "}";
                                        var position = searchResultsHtml.indexOf(toBeReplaced);
                                        searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                        break;
                                    }
                                }
                                */
                                if (menuCategory[i][1] === "My Groups") {
                                    if (mygroupsprocessed === 0) {
                                        for (var k = 0; k < mygroups.length; k++) {
                                            var mygroup = mygroups[k];
                                            searchSubMenuResultsHtml = "<li> <a href='" + mygroup[1] + "'> " + mygroup[0] + "</a></li>";
                                            var toBeReplaced = "{menuCategoryTitle" + item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"] + "}";
                                            var position = searchResultsHtml.indexOf(toBeReplaced);
                                            if (position > -1)
                                                searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                        }
                                        mygroupsprocessed = 1;
                                    }
                                }
                                else {
                                    searchSubMenuResultsHtml = "<li> <a href='" + item.SubMenuUrl + "'>" + item.SubMenuTitle + "</a></li>";
                                    var toBeReplaced = "{menuCategoryTitle" + item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"] + "}";
                                    var position = searchResultsHtml.indexOf(toBeReplaced);
                                    if (position > -1)
                                        searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                    break;
                                }
                            }
                        }
                    });
                    deferred1.resolve(subMenu);
                }
            },
            error: function (error) {
                ////alert(JSON.stringify(error));
                deferred1.reject(sender, args);
            }
        });
        //}
        return deferred1.promise();
    }

    function getMainMenus1(queryText) {
        var def = $.Deferred();
        $.ajax({
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/contextinfo",
            type: "POST",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue);
                var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Mega Menu Master List')/Items?$select=ID,MenuTitle,MenuDescription,MenuUrl,MenuDescriptionTitle,MenuDescriptionBody,MenuDescriptionButtonTitle,MenuDescriptionButtonUrl&$filter=MenuIsVisible eq 1&$orderby=MenuOrderLevel asc";
                $.ajax({
                    url: restUrl,
                    type: "GET",
                    headers: {
                        "Accept": "application/json; odata=verbose",
                        "Content-Type": "application/json; odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        if (data.d.results.length > 0) {
                            searchResultsHtml = menuHeaderHtml;
                            $.each(data.d.results, function (index, item) {
                                if (item.MenuDescriptionTitle == null) {
                                    searchResultsHtml += "<li class='dropdown  active'><a href='" + item.MenuUrl + "' aria-expanded='false' aria-haspopup='true' role='button' data-toggle='dropdown' class='dropdown-toggle menu-divider'> " + item.MenuTitle + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space'><div class='col-sm-3 news_menus'> <a href='" + item.MenuDescriptionButtonUrl + "' class='btn btn-primary custom-fill-btn'>" + item.MenuDescriptionButtonTitle + "</a><p>" + item.MenuDescriptionBody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{menuTitle" + item.MenuTitle + "}{menuHorizontalTitle" + item.MenuTitle + "}</div>";
                                }
                                else {
                                    searchResultsHtml += "<li class='dropdown  active'><a href='" + item.MenuUrl + "' aria-expanded='false' aria-haspopup='true' role='button' data-toggle='dropdown' class='dropdown-toggle menu-divider'> " + item.MenuTitle + " <span class='caret'></span> </a><div class='dropdown-menu mega_menu_custom remove-check-space'><div class='col-sm-3 news_menus'> <h2 class='dropdown-header'>" +
                                    item.MenuDescriptionTitle + "</h2><p>" + item.MenuDescriptionBody + "</p></div><div class='col-sm-9 side_mega_menu'><div class='row'>{menuTitle" + item.MenuTitle + "}{menuHorizontalTitle" + item.MenuTitle + "}</div></div>";
                                }
                            });

                            def.resolve(mainMenu);
                        }
                    },
                    error: function (error) {
                        ////alert(JSON.stringify(error));
                        def.reject(sender, args);
                    }
                });
            },
            error: function (data, errorCode, errorMessage) {
                //alert(errorMessage)
            }
        });
        return def.promise();
    }

    //function getMainMenusCategories(masterMenuId) {
    function getMainMenusCategories(careerLevel, managerLevel, userlocation, operationalDepartmentandSubledger) {
        var deferred = $.Deferred();
        //for (var i = 0; i < mainMenu.length; i++) { 
        //var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Mega Menu Sub Category Master List')/Items?$select=ID,MenuSubCategoryTitle,MenuSubCategoryDescription,MenuSubCategoryUrl,MegaMenuMasterTitle/MenuTitle&$expand=MegaMenuMasterTitle&$orderby=MenuOrderLevel asc&$filter=(MenuIsVisible eq 1) and (MegaMenuMasterTitle eq " + masterMenuId + ")";
        var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Mega Menu Sub Category Master List')/Items?$select=ID,MenuSubCategoryTitle,MenuSubCategoryDescription,MenuSubCategoryUrl,MenuRenderStyle,Locations,MegaMenuMasterTitle/MenuTitle&$expand=MegaMenuMasterTitle&$orderby=MenuOrderLevel asc&$filter=(MenuIsVisible eq 1)";
        $.ajax({
            url: restUrl,
            type: "GET",
            headers: {
                "Accept": "application/json; odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                if (data.d.results.length > 0) {
                    var searchMenuCategoryResultsHtml = "";
                    $.each(data.d.results, function (index, item) {

                        var mainMenuCategoryItem = [];
                        mainMenuCategoryItem[0] = item.ID;
                        mainMenuCategoryItem[1] = item.MenuSubCategoryTitle;
                        mainMenuCategoryItem[2] = item.MenuSubCategoryDescription;
                        mainMenuCategoryItem[3] = item.MenuSubCategoryUrl;
                        mainMenuCategoryItem[4] = item.MegaMenuMasterTitle;
                        mainMenuCategoryItem[5] = item.MenuRenderStyle;
                        mainMenuCategoryItem[6] = item.Locations;
                        menuCategory[index] = mainMenuCategoryItem;
                        ////alert(item.Locations);
                        if (item.MenuRenderStyle == "Vertical") {
                            //if (item.MenuSubCategoryTitle === "People Management") {
                            //    if (careerLevel >= 31 && managerLevel >= 5) {
                            //        searchMenuCategoryResultsHtml = "<div class='col-sm-3'><h2 class='dropdown-header'>" + item.MenuSubCategoryTitle + "</h2>{menuCategoryTitle" + item.MenuSubCategoryTitle + "}</div>";
                            //        var toBeReplaced = "{menuTitle" + item.MegaMenuMasterTitle["MenuTitle"] + "}";
                            //        var position = searchResultsHtml.indexOf(toBeReplaced);
                            //        searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');
                            //    }
                            //}
                            //else {
                            if (item.MegaMenuMasterTitle["MenuTitle"] == "myWork")
                                searchMenuCategoryResultsHtml = "<div class='col-sm-4'><h2 class='dropdown-header'>" + item.MenuSubCategoryTitle + "</h2>{menuCategoryTitle" + item.MenuSubCategoryTitle + "}</div>";
                            else
                                searchMenuCategoryResultsHtml = "<div class='col-sm-3'><h2 class='dropdown-header'>" + item.MenuSubCategoryTitle + "</h2>{menuCategoryTitle" + item.MenuSubCategoryTitle + "}</div>";

                            var toBeReplaced = "{menuTitle" + item.MegaMenuMasterTitle["MenuTitle"] + "}";
                            var position = searchResultsHtml.indexOf(toBeReplaced);
                            if (position > -1)
                                searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');
                            //}
                        }
                        else {
                            searchMenuCategoryResultsHtml = "<div class='popular_work_wrap'><div class='col-sm-12'><h2 class='dropdown-header'>" + item.MenuSubCategoryTitle + "</h2>{menuHorizontalCategoryTitle" + item.MenuSubCategoryTitle + "}</div></div>";
                            var toBeReplaced = "{menuHorizontalTitle" + item.MegaMenuMasterTitle["MenuTitle"] + "}";
                            var position = searchResultsHtml.indexOf(toBeReplaced);
                            if (position > -1)
                                searchResultsHtml = [searchResultsHtml.slice(0, position), searchMenuCategoryResultsHtml, searchResultsHtml.slice(position)].join('');
                        }
                    });
                    searchResultsHtml += "</div></li>";
                    deferred.resolve(menuCategory);
                }
            },
            error: function (error) {
                ////alert(JSON.stringify(error));
                deferred.reject(sender, args);
            }
        });
        //}
        return deferred.promise();
    }

    //function getSubMenus(menuCategoryId) {
    function getSubMenus(menuCategory, careerLevel, managerLevel) {
        var deferred1 = $.Deferred();
        var restUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/getbytitle('Mega Sub Menu Master')/Items?$select=ID,MegaMenuSubCategoryMasterTitle/MenuSubCategoryTitle,SubMenuTitle,SubMenuDescription,SubMenuUrl&$expand=MegaMenuSubCategoryMasterTitle&$orderby=MenuOrderLevel asc&$filter=(MenuIsVisible eq 1)&$top=1000";
        $.ajax({
            url: restUrl,
            type: "GET",
            headers: {
                "Accept": "application/json; odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                if (data.d.results.length > 0) {
                    var searchSubMenuResultsHtml = "";
                    var searchSubMenuHorizontalResultsHtml = "";
                    var preHorizontalCounter = 0;
                    var mygroupsprocessed = 0;
                    $.each(data.d.results, function (index, item) {

                        for (var i = 0; i < menuCategory.length; i++) {
                            var preHorizontalDiv = "<div class='col-sm-3'><ul class='check_side_area'>";

                            if (menuCategory[i][1] == item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"]) {
                                if (menuCategory[i][5] == "Vertical") {
                                    //if (menuCategory[i][1] === "People Management") {
                                    //    if (careerLevel >= 31 && managerLevel >= 5) {
                                    //        searchSubMenuResultsHtml = "<ul class='check_side_area'><li> <a href='" + item.SubMenuUrl + "'> " + item.SubMenuTitle + "</a></li></ul>";
                                    //        var toBeReplaced = "{menuCategoryTitle" + item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"] + "}";
                                    //        var position = searchResultsHtml.indexOf(toBeReplaced);
                                    //        searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                    //        break;
                                    //    }
                                    //}
                                    //else {
                                    if (menuCategory[i][1] === "My Groups") {
                                        if (mygroupsprocessed === 0) {
                                            for (var k = 0; k < mygroups.length; k++) {
                                                var mygroup = mygroups[k];
                                                searchSubMenuResultsHtml = "<ul class='check_side_area'><li> <a href='" + mygroup[1] + "'> " + mygroup[0] + "</a></li></ul>";
                                                var toBeReplaced = "{menuCategoryTitle" + item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"] + "}";
                                                var position = searchResultsHtml.indexOf(toBeReplaced);
                                                if (position > -1)
                                                    searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                            }
                                            mygroupsprocessed = 1;
                                        }
                                    }
                                    else {
                                        searchSubMenuResultsHtml = "<ul class='check_side_area'><li> <a href='" + item.SubMenuUrl + "'> " + item.SubMenuTitle + "</a></li></ul>";
                                        var toBeReplaced = "{menuCategoryTitle" + item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"] + "}";
                                        var position = searchResultsHtml.indexOf(toBeReplaced);
                                        if (position > -1)
                                            searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                                        break;
                                    }
                                }
                                else {
                                    if (preHorizontalCounter === 0) {
                                        searchSubMenuHorizontalResultsHtml = preHorizontalDiv;
                                        searchSubMenuHorizontalResultsHtml += "<li> <a href='" + item.SubMenuUrl + "'> " + item.SubMenuTitle + "</a></li>";
                                    }
                                    else {
                                        searchSubMenuHorizontalResultsHtml += "<li> <a href='" + item.SubMenuUrl + "'> " + item.SubMenuTitle + "</a></li>";
                                    }

                                    preHorizontalCounter++;
                                    if (preHorizontalCounter === 3) {
                                        searchSubMenuHorizontalResultsHtml += "</ul></div>";
                                        var toBeReplaced = "{menuHorizontalCategoryTitle" + item.MegaMenuSubCategoryMasterTitle["MenuSubCategoryTitle"] + "}";
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
                    });
                    deferred1.resolve(subMenu);
                }
            },
            error: function (error) {
                ////alert(JSON.stringify(error));
                deferred1.reject(sender, args);
            }
        });
        //}
        return deferred1.promise();
    }

    $(document).ready(function () {
        renderMenu();
    });
})();