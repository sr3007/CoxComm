function displayLayover2(section, communitySiteUrl) {
    //alert(section);
    if (section == "Edit_FAQs") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIFAQs/FilteredFAQs.aspx?Category=" + Category + "&IsDlg=1";
    }
    if (section == "Edit_CCIWorkingOn") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIWorkingOn/AllItems.aspx";
    }
    if (section == "Edit_Teams") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIDepartmentTeam/AllItems.aspx";
    }
    if (section == "Edit_Resources") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIResources/AllItems.aspx";
    }


    if (section == "Edit_CCICommunityProjects") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCICommunityProjects/AllItems.aspx";
    }
    if (section == "Edit_CCICommunityCalendar") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCICommunityCalendar/AllItems.aspx";
    }
    if (section == "Edit_CCITasks") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCITasks/AllItems.aspx";
    }
    if (section == "Edit_CCIQuickLinks") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCIQuickLinks/AllItems.aspx";
    }
    if (section == "Edit_CCICommunityOwner") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/CCICommunityOwner/AllItems.aspx";
    }
    if (section == "Edit_Members") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Accounting/Lists/Members/AllItems.aspx";
    }


    if (section == "Edit_CCINotificationsList") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINotificationsList/AllItems.aspx";
    }
    if (section == "Edit_CCImyWorkspaceLinks") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCImyWorkspaceLinks/AllItems.aspx";
    }



    if (section == "Edit_CCIFAQs") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIFAQs/AllItems.aspx";
    }
    if (section == "Edit_CCIHRLinks") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIHRLinks/AllItems.aspx";
    }
    if (section == "Edit_CCINotificationsList") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINotificationsList/AllItems.aspx";
    }
    if (section == "Edit_CCIWhatsNew") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIWhatsNew/AllItems.aspx";
    }


    if (section == "Edit_CCINewsArticle") {
        var Category = document.title;
        //var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINewsArticle/Admin.aspx";
        var url = _spPageContextInfo.siteAbsoluteUrl + "/" + CCI_Common.GetConfig('NewsPageLibrarySourceSite') + "/Pages/Forms/AllItems.aspx";
    }
    if (section == "Edit_CCIVideos") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIVideos/AllItems.aspx";
    }
    if (section == "Edit_CCIProductInformation") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIProductInformation/Admin.aspx";
    }
    if (section == "Edit_CCINotificationsList") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINotificationsList/AllItems.aspx";
    }
    if (section == "Edit_CCIBannerCarousal") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCIBannerCarousal/Admin.aspx";
    }
    if (section == "Edit_CCINavigationMaster") {
        var Category = document.title;
        var url = communitySiteUrl + "/Lists/CCINavigation/AllItems.aspx";
    }
    if (section == "Edit_CCINavigationChild") {
        var Category = document.title;
        var url = communitySiteUrl + "/Lists/CCINavigationChild/AllItems.aspx";
    }
    if (section == "Edit_CCIRootNavigationMaster") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINavigation/AllItems.aspx";
    }
    if (section == "Edit_CCIRootNavigationChild") {
        var Category = document.title;
        var url = _spPageContextInfo.siteAbsoluteUrl + "/Lists/CCINavigationChild/AllItems.aspx";
    }
    //alert(url);



    var options = SP.UI.$create_DialogOptions();
    options.width = 1500;
    options.height = 1300;
    options.resizable = 1
    options.url = url;
    options.dialogReturnValueCallback = Function.createDelegate(null, null);
    SP.UI.ModalDialog.showModalDialog(options);
}

