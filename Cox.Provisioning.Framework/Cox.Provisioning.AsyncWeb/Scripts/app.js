
$(document).ready(function () {
    //Get the URI decoded SharePoint site url from the SPHostUrl parameter.
    var spHostUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));

    //Build absolute path to the layouts root with the spHostUrl
    var layoutsRoot = spHostUrl + '/_layouts/15/';

    //load all appropriate scripts for the page to function
    $.getScript(layoutsRoot + 'SP.Runtime.js',
        function () {
            $.getScript(layoutsRoot + 'SP.js',
                function () {
                    //Execute the correct script based on the isDialog
                    //Load the SP.UI.Controls.js file to render the App Chrome
                    $.getScript(layoutsRoot + 'SP.UI.Controls.js', renderSPChrome);
                    $.getScript(layoutsRoot + 'SP.RequestExecutor.js', function () {});
                });
        });
    $("#txtUrl").focusout(function () {
        if ($("#txtUrl").val() != "") {
            var siteurl = $("#lblBasePath").text() + $("#txtUrl").val();
            //checkUrl(siteurl);
        }
    });

    $('#txtUrl').bind("paste", function (e) {
        e.preventDefault();
    });
    $("#txtdescription").keypress(function (e) {
        var max_chars = 1000;
        var status = true;
        status = limitinput($("#txtDescription"), max_chars);
        return status;
    });
    $("#txtTitle").keypress(function (e) {
        var regex = new RegExp("^[a-zA-Z0-9\\s\-]+$");
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!regex.test(str)) {
            e.preventDefault();
            return false;
        }
        ///////////////////
        var max_chars = 120;
        var status = true;
        status = limitinput($("#txtTitle"), max_chars);
        return status;
    });
    $("#txtUrl").keypress(function (e) {
        var regex = new RegExp("^[a-zA-Z0-9\-]+$");
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!regex.test(str)) {
            e.preventDefault();
            return false;
        }

        ///////////////////
        var max_chars = 15;
        var status = true;
        status = limitinput($("#txtUrl"), max_chars);
        return status;
    });
});

//function to get a parameter value by a specific key
function getQueryStringParameter(urlParameterKey) {
    var params = document.URL.split('?')[1].split('&');
    var strParams = '';
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split('=');
        if (singleParam[0] == urlParameterKey)
            return singleParam[1];
    }
}

function limitinput(elm, max_chars) {
    var status = true;
    if (elm.val().length > max_chars) {
        elm.val(elm.val().substr(0, max_chars + 1));
        status = false;
    }
    return status;
}

function checkUrl(url) {
    //var spHostUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
    var appWebUrl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
    var request = false;
    var executor = new SP.RequestExecutor(appWebUrl);
    executor.executeAsync({
        url: appWebUrl + "/_api/SP.AppContextSite(@target)/web/lists?@target='" + url + "'",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: GetSite,
        error: getFailed
    });
}

function GetSite() {
    //$("#spanMsg_URLExists").text("Av");
    alert("SiteUrl Name already existing. Please choose another SiteUrl.");
    $("#txtUrl").val("");
    $("#txtUrl").focus();
}

function getFailed() {
    //alert("Url Name is available. Please proceed with the further request.");
}
