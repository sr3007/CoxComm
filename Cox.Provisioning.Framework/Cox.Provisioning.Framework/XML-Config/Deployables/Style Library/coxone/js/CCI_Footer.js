(function () {
	'use strict';
    var searchResultsHtml = '';
    var footerHeaderHtml = '<footer class=""><div id="footer-top"><div class="container"><div  class="row">';

    var footerFooterHtml = '';
    var FooterMasterListName = "CCI-FooterMaster";
    var FooterDetailListName = "CCI-FooterMasterDetail";

    var FooterMasterListKey = "CCIFooterMaster";
    var FooterDetailListKey = "CCIFooterMasterDetail";

    var FooterMasterList;
    var FooterDetailList;
    var FooterMasterListId;
    var FooterDetailListId;
    var context;
    var hostweb;
    var searchQueryText;
    var searchResultsHtml;
    
    function loadResources() {
        footerFooterHtml = '</div></div></div><div id="footer-bottom"><div class="container"><div class="row"><div class="col-sm-6"><div class="foot-logo"><ul><li><a href="http://www.coxenterprises.com/"><img src="' + _spPageContextInfo.siteAbsoluteUrl + CCI_Common.GetConfig('FooterCoxEnterprisesImage') + '" /></a></li><li><a href="https://www.cox.com/residential/home.html"><img src="' + _spPageContextInfo.siteAbsoluteUrl + CCI_Common.GetConfig('FooterCoxResidentialImage') + '" /></a></li><li><a href="http://www.coxmediagroup.com/"><img src="' + _spPageContextInfo.siteAbsoluteUrl + CCI_Common.GetConfig('FooterCoxMediaGroupImage') + '" /></a></li><li><a href="https://www.coxautoinc.com/"><img src="' + _spPageContextInfo.siteAbsoluteUrl + CCI_Common.GetConfig('FooterCoxAutoImage') + '" /></a></li></ul></div></div><div class="col-sm-6"><div class="row"><div class="col-sm-6"><div class="P4S_10"><h4>Policies</h4>{Policies}</div></div><div class="col-sm-6"><div class="P4S_10"><h4>Channels</h4><ul class="social_icons"><li><a href="http://www.youtube.com/user/CoxCommTV"><i class="fa fa-youtube"></i></a></li><li><a href="https://plus.google.com/u/0/+coxcommunications/posts"><i class="fa fa-google-plus"></i></a></li><li><a href="https://twitter.com/coxcomm"><i class="fa fa-twitter "></i></a></li><li><a ref="http://instagram.com/coxcommunications"><i class="fa fa-instagram"></i></a></li><li><a href="https://www.facebook.com/coxcommunications"><i class="fa fa-facebook"></i></a></li></ul><br /><span class="copy_bar">&copy; 1998-2016 Cox Communications, Inc.</span> </div></div></div></div></div></div></div></footer>';
        context = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
        hostweb = context.get_web();
        onGetResourcesSuccess();
        /*
        FooterMasterList = hostweb.get_lists().getByTitle(FooterMasterListName);
        FooterDetailList = hostweb.get_lists().getByTitle(FooterDetailListName);
        context.load(FooterMasterList);
        context.load(FooterDetailList);
        context.executeQueryAsync(onGetResourcesSuccess, onGetResourcesFail);
        */
    }

    function onGetResourcesSuccess() {
        //FooterMasterListId = FooterMasterList.get_id();
        //FooterDetailListId = FooterDetailList.get_id();
        FooterMasterListId = CCI_Common.GetConfig(FooterMasterListKey);
        FooterDetailListId = CCI_Common.GetConfig(FooterDetailListKey);
        renderFooter();
    }

    // This function is executed if the above call fails
    function onGetResourcesFail(sender, args) {
        alert('Failed to load resources. Error:' + args.get_message());
    }

    function renderFooter() {
        searchQueryText = "ListID:" + FooterMasterListId + " RefinableInt02:1";
        getMainMenus().then(
			function () {
			    searchQueryText = "ListID:" + FooterDetailListId + " RefinableInt02:1";
			    getSubMenus().then(
                function () {
                    searchResultsHtml += footerFooterHtml;
                    searchResultsHtml = searchResultsHtml.replace(/\{.*?\}\s?/g, '&nbsp;');
                    $('#footerdiv').html(searchResultsHtml);
                },
                function (error) {
                    console.log(error.get_message());
                    CCI_Common.LogException(_spPageContextInfo.userId, 'Footer App', _spPageContextInfo.siteAbsoluteUrl, error);
                }
                )

			},
					function (error) {
					    console.log(error.get_message());
					    CCI_Common.LogException(_spPageContextInfo.userId, 'Footer App', _spPageContextInfo.siteAbsoluteUrl, error);
					}
			);
    }

    //Method to get main footer menu collection.
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
                'RowLimit': '20',
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
                        'Title',
                        'CCI-FooterCategory',
                        'CCI-URL'
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
                searchResultsHtml = footerHeaderHtml;
                for (var i = 0; i < queryResults.length; i++) {
                    var r = queryResults[i];
                    var cells = r.Cells;
                    var title = '';
                    var footercategory = '';
                    var menuurl = '';

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "Title": title = c.Value; break;
                            case "CCI-FooterCategory": footercategory = c.Value; break;
                            case "CCI-URL": menuurl = c.Value; break;
                        }
                    }
                    if (footercategory === "Footer-Top")
                        searchResultsHtml += "<div class='col-sm-3'><div class='P4S_10'><h4>" + title + "</h4>{mainMenu" + title + "}</div></div>";
                }
                def.resolve();
            }
            else {
                //$('#megamenudivtmp').html("<h3>Menu not found ...</h3>");
            }
        });
        call.fail(function (data) {
            alert("Failure" + JSON.stringify(data));
        });
        return def.promise();
    }

    //Method to get main footer sub menu collection.
    function getSubMenus() {
        var def1 = $.Deferred();
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
                'RowLimit': '100',
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
                        'Title',
                        'CCI-Description',
                        'CCI-FooterMasterTitle',
                        'CCI-URL'
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
                for (var i = 0; i < queryResults.length; i++) {
                    var r = queryResults[i];
                    var cells = r.Cells;
                    var title = '';
                    var desc = '';
                    var footermatertitle = '';
                    var menuurl;

                    for (var x = 0; x < cells.results.length; x++) {
                        var c = cells.results[x];
                        switch (c.Key) {
                            case "Title": title = c.Value; break;
                            case "CCI-Description": desc = c.Value; break;
                            case "CCI-URL": menuurl = c.Value; break;
                            case "CCI-FooterMasterTitle": footermatertitle = c.Value; break;
                        }
                    }

                    //menuurl = menuurl.split(',')[1].trim();
                    if (typeof (menuurl.split(',')[1]) != "undefined") {
                        menuurl = menuurl.split(',')[1].trim();
                    }
                    else if (typeof (menuurl.split(',')[0]) != "undefined") {
                        menuurl = menuurl.split(',')[0].trim();
                    }

                    

                    if (footermatertitle != "Policies") {
                        var searchSubMenuResultsHtml = "<ul><li><a href='" + menuurl + "'>" + title + "</a></li></ul>";
                        var toBeReplaced = "{mainMenu" + footermatertitle + "}";
                        var position = searchResultsHtml.indexOf(toBeReplaced);
                        searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                    }
                    else {
                        var searchSubMenuResultsHtml = "<ul><li><a href='" + menuurl + "'>" + title + "</a></li></ul>";
                        var toBeReplaced = "{Policies}";
                        var position = footerFooterHtml.indexOf(toBeReplaced);
                        footerFooterHtml = [footerFooterHtml.slice(0, position), searchSubMenuResultsHtml, footerFooterHtml.slice(position)].join('');
                    }

                }
                def1.resolve();
            }
            else {
                //$('#megamenudivtmp').html("<h3>Menu not found ...</h3>");
            }
        });
        call.fail(function (data) {
            alert("Failure" + JSON.stringify(data));
        });
        return def1.promise();
    }

    $(document).ready(function () {
        loadResources();
    });

})();