(function () {
	'use strict';
    var searchResultsHtml = '';
    var footerHeaderHtml = '<footer class=""><div id="footer-top"><div class="container"><div  class="row">';

    var footerFooterHtml = '</div></div></div><div id="footer-bottom"><div class="container"><div class="row"><div class="col-sm-6"><div class="foot-logo"><ul><li><a href="http://www.coxenterprises.com/"><img src="https://mod223137.sharepoint.com/sites/coxone/Style Library/COXONE/images/foot-logo01.jpg" /></a></li><li><a href="https://www.cox.com/residential/home.html"><img src="https://mod223137.sharepoint.com/sites/coxone/Style Library/COXONE/images/foot-logo02.jpg" /></a></li><li><a href="http://www.coxmediagroup.com/"><img src="https://mod223137.sharepoint.com/sites/coxone/Style Library/COXONE/images/foot-logo03.jpg" /></a></li><li><a href="https://www.coxautoinc.com/"><img src="https://mod223137.sharepoint.com/sites/coxone/Style Library/COXONE/images/foot-logo04.jpg" /></a></li></ul></div></div><div class="col-sm-6"><div class="row"><div class="col-sm-6"><div class="P4S_10"><h4>Policies</h4>{Policies}</div></div><div class="col-sm-6"><div class="P4S_10"><h4>Channels</h4><ul class="social_icons"><li><a href="http://www.youtube.com/user/CoxCommTV"><i class="fa fa-youtube"></i></a></li><li><a href="https://plus.google.com/u/0/+coxcommunications/posts"><i class="fa fa-google-plus"></i></a></li><li><a href="https://twitter.com/coxcomm"><i class="fa fa-twitter "></i></a></li><li><a ref="http://instagram.com/coxcommunications"><i class="fa fa-instagram"></i></a></li><li><a href="https://www.facebook.com/coxcommunications"><i class="fa fa-facebook"></i></a></li></ul><br /><span class="copy_bar">&copy; 1998-2016 Cox Communications, Inc.</span> </div></div></div></div></div></div></div></footer>';

    //Method to get main footer menu collection.
    function getMainMenus(restUrl) {
        var def = $.Deferred();
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo",
            type: "POST",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue);
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
                            searchResultsHtml = footerHeaderHtml;
                            $.each(data.d.results, function (index, item) {
                                if (item.Category === "Footer-Top")
                                    searchResultsHtml += "<div class='col-sm-3'><div class='P4S_10'><h4>" + item.Title + "</h4>{mainMenu" + item.Title + "}</div></div>";
                            });

                            def.resolve();
                        }
                    },
                    error: function (error) {
                        //def.reject(sender, args);
                        CCI_Common.LogException(_spPageContextInfo.userId, 'Footer App', _spPageContextInfo.siteAbsoluteUrl, error);
                    }
                });
            },
            error: function (data, errorCode, errorMessage) {
                //alert(errorMessage)
                CCI_Common.LogException(_spPageContextInfo.userId, 'Footer App', _spPageContextInfo.siteAbsoluteUrl, errorMessage);
            }
        });
        return def.promise();
    }

    //Method to get main footer sub menu collection.
    function getSubMenus() {
        var def1 = $.Deferred();
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('FooterMasterDetail')/Items?$select=Title,FooterMasterDetailUrl,FooterMasterTitleNew/Title&$expand=FooterMasterTitleNew&$orderby=FooterMasterDetailIsVisible&%20asc&$filter=FooterMasterDetailIsVisible%20eq%201",
            type: "GET",
            headers: {
                "Accept": "application/json; odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                if (data.d.results.length > 0) {
                    $.each(data.d.results, function (index, item) {
                        if (item.FooterMasterTitleNew["Title"] != "Policies") {
                            var searchSubMenuResultsHtml = "<ul><li><a href='" + item.FooterMasterDetailUrl.Url + "'>" + item.Title + "</a></li></ul>";
                            var toBeReplaced = "{mainMenu" + item.FooterMasterTitleNew["Title"] + "}";
                            var position = searchResultsHtml.indexOf(toBeReplaced);
                            searchResultsHtml = [searchResultsHtml.slice(0, position), searchSubMenuResultsHtml, searchResultsHtml.slice(position)].join('');
                        }
                        else {
                            var searchSubMenuResultsHtml = "<ul><li><a href='" + item.FooterMasterDetailUrl.Url + "'>" + item.Title + "</a></li></ul>";
                            var toBeReplaced = "{Policies}";
                            var position = footerFooterHtml.indexOf(toBeReplaced);
                            footerFooterHtml = [footerFooterHtml.slice(0, position), searchSubMenuResultsHtml, footerFooterHtml.slice(position)].join('');
                        }
                    });

                    def1.resolve();
                }
            },
            error: function (error) {
                //def.reject(sender, args);
                CCI_Common.LogException(_spPageContextInfo.userId, 'Footer App', _spPageContextInfo.siteAbsoluteUrl, error);
            }
        });
        return def1.promise();
    }

    $(document).ready(function () {

		  var restUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('FooterMaster')/Items?$select=Title,Category,FooterUrl&$orderby=MenuOrderLevel%20asc&$filter=IsVisible%20eq%201";
			getMainMenus(restUrl).then(
			function()
			{
					getSubMenus().then(
					function()
					{
						searchResultsHtml += footerFooterHtml;
						searchResultsHtml = searchResultsHtml.replace(/\{.*?\}\s?/g, '&nbsp;');
						$('#footerdiv').html(searchResultsHtml);
					},
					function(error){
					    console.log(error.get_message());
					    CCI_Common.LogException(_spPageContextInfo.userId, 'Footer App', _spPageContextInfo.siteAbsoluteUrl, error);
					}
					)
				
			},
					function(error){
					    console.log(error.get_message());
					    CCI_Common.LogException(_spPageContextInfo.userId, 'Footer App', _spPageContextInfo.siteAbsoluteUrl, error);
					}
			);
    });

})();