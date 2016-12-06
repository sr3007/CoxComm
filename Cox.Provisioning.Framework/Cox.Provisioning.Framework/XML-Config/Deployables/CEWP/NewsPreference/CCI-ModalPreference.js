var CCI = CCI || {};

ExecuteOrDelayUntilBodyLoaded(function () {
    var serverUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
    SP.SOD.registerSod('sp.js', serverUrl + '/_layouts/15/sp.js')
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        if (typeof utility != "undefined") {
            RegisterModuleInit(serverUrl + "/SiteAssets/coxone/js/CCI-ModalPreference.js", CCI.NewsPreferenceCore.init);
        } else {
            CCI.NewsPreferenceCore.init();
        }
    });
});
"use strict"
CCI.NewsPreferenceCore = {
    init: function () {
        try {
            if (typeof utility == "object" && typeof CCI.NewsPreference == "object") {
                utility.init();

                CCI.NewsPreference.init();
            } else {
                CCI.NewsPreference.init();
            }
        } catch (e) {
            if (typeof utility == "object") {
                utility.handleError(e.message, false);
            } else {
                console.log('Error Nav: ' + e.message)
            }
        }
    }
}

CCI.NewsPreference = {
    //preferenceList: "CCI-NewsPreference",
    preferenceList: "CCINewsPreference",
    divIdCollection: ["companyDiv", "coeDiv", "departmentsDiv", "divisionDiv", "locationsDiv", "industryDiv","topicsDiv"],
    companyfromMetadata: null,
    topicsfromMetadata:null,
    coefromMetadata: null,
    departmentfromMetadata: null,
    divisionfromMetadata: null,
    industryfromMetadata: null,
    locationfromMetadata:null,
    preSelectedPreferences: null,
    newUserSelectedPreferences:null,
    checkPreferenceAvailable: false,
    RecentlyAddedPreference:"",
    init: function () {
        "use strict"
        
        var serverUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
        // SP.SOD.registerSod('jquery.js', serverUrl + '/SiteAssets/COXOne/CustomHtml/jquery-2.2.1.min.js');
        SP.SOD.registerSod('jquery.js', serverUrl + '/Style Library/coxone/js/jquery.js');
        
        SP.SOD.executeFunc('jquery.js', 'jQuery', function () {
            SP.SOD.registerSod('sp.js', serverUrl + '/_layouts/15/sp.js');
            SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
                SP.SOD.registerSod('sp.taxonomy.js', serverUrl + '/_layouts/15/sp.taxonomy.js')
                SP.SOD.executeFunc('sp.taxonomy.js', 'SP.Taxonomy.TaxonomySession', function () {
                    try{
                        //CCI.NewsPreference.loadPreferenceTermSet(CCI.NewsPreference.createPreferenceGrid, CCI.NewsPreference.failNavigation);
                        //CCI.NewsPreference.GetUserPreferencesFromList();
                    }
                    catch(err)
                    {
                        if(err!=="undefined")
                        {
                            CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-ModalPreference.js->init", _spPageContextInfo.serverRequestPath, JSON.stringify(err));
                            console.log(JSON.stringify(err));
                        }
                    }
                });
            });
        });
    },
    //LoadDialog:function(){
    //    "use strict"

    //    var serverUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
    //    SP.SOD.registerSod('jquery.js', serverUrl + '/Style Library/coxone/js/jquery.js');

    //    SP.SOD.executeFunc('jquery.js', 'jQuery', function () {
    //        SP.SOD.registerSod('sp.js', serverUrl + '/_layouts/15/sp.js');
    //        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
    //            SP.SOD.registerSod('sp.taxonomy.js', serverUrl + '/_layouts/15/sp.taxonomy.js')
    //            SP.SOD.executeFunc('sp.taxonomy.js', 'SP.Taxonomy.TaxonomySession', function () {
    //                CCI.NewsPreference.loadPreferenceTermSet(CCI.NewsPreference.createPreferenceGrid, CCI.NewsPreference.failNavigation);
    //                CCI.NewsPreference.GetUserPreferencesFromList();
    //            });
    //        });
    //    });
    //},
    GetFromCache:function(itemName){
        if (typeof (Storage) !== "undefined") {
            if (localStorage.getItem(itemName) != null) {
                var result = localStorage.getItem(itemName);
                //NewsPreference.displayCachedNavigation();
                return result;
            }
        }
    },
    SetToCache: function (itemName,value) {
        if (typeof (Storage) !== "undefined") {
            //if (localStorage.getItem(itemName) != null) {
                localStorage.setItem(itemName, value);
            //}
        }
    },
    GetUserPreferencesFromList: function () {
        var NewsPreferenceGUID = CCI_Common.GetConfig(CCI.NewsPreference.preferenceList);
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists(guid'" + NewsPreferenceGUID + "')/Items?";
        requestUri += "$select=ID,Title,CCI_x002d_Departments,CCI_x002d_Product,CCI_x002d_COE,CCI_x002d_Division,CCI_x002d_Industry,CCI_x002d_Locations,CCI_x002d_Topics";
        requestUri += "&$filter=CCI_x002d_UserID eq " + _spPageContextInfo.userId;
        //requestUri += "&$filter=CCI_x002d_UserID eq '" + _spPageContextInfo.userLoginName + "'";

        //requestUri += "$select=ID,Title,Departments,Product,COE,Division,Industry,Locations,Topic";
        //requestUri += "&$filter=UserID eq " + _spPageContextInfo.userId;

        var requestHeaders = { "accept": "application/json;odata=verbose" };
        $.ajax({
            url: requestUri,
            contentType: "application/json;odata=verbose",
            headers: requestHeaders,
            success: CCI.NewsPreference.onGetPreferencesSuccess,
            error: CCI.NewsPreference.onGetAdminError
        });
    },
    onGetPreferencesSuccess: function (data, request) {
        
        var i,listSelectionData,userPreferenceItem;
        var items = data.d.results;
        if (items.length > 0) {
            CCI.NewsPreference.checkPreferenceAvailable = true;
        }
        else {
            CCI.NewsPreference.checkPreferenceAvailable = false;
        }
        CCI.NewsPreference.preSelectedPreferences = [];
        for (i = 0; i < items.length; i++) {
            userPreferenceItem = items[i];
            listSelectionData = { ID: userPreferenceItem.ID, Title: userPreferenceItem.Title, Company: userPreferenceItem.CCI_x002d_Product, Department: userPreferenceItem.CCI_x002d_Departments, COE: userPreferenceItem.CCI_x002d_COE, Division: userPreferenceItem.CCI_x002d_Division, Location: userPreferenceItem.CCI_x002d_Locations, Industry: userPreferenceItem.CCI_x002d_Industry, Topics: userPreferenceItem.CCI_x002d_Topics };
            //listSelectionData = { ID: userPreferenceItem.ID, Title: userPreferenceItem.Title, Company: userPreferenceItem.Product, Department: userPreferenceItem.Departments, COE: userPreferenceItem.COE, Division: userPreferenceItem.Division, Location: userPreferenceItem.Locations, Industry: userPreferenceItem.Industry, Topics: userPreferenceItem.Topic };
            CCI.NewsPreference.preSelectedPreferences.push(listSelectionData);
        }
        //CCI.NewsPreference.SetToCache("", CCI.NewsPreference.preSelectedPreferences);
        CCI.NewsPreference.SetPreSelectedPreferences();
    },
    SetPreSelectedPreferences: function () {
        //check if NewsPreference.preSelectedPreferences[0] is not empty then proceed also check if NewsPreference is also not null
        //add specific check  collection both from termstore and list data
        if (!jQuery.isEmptyObject(CCI.NewsPreference.preSelectedPreferences[0])) {
                if (!jQuery.isEmptyObject(CCI.NewsPreference.companyfromMetadata)) {
                    CCI.NewsPreference.SetCheckboxforTaxonomy(CCI.NewsPreference.preSelectedPreferences[0].Company, CCI.NewsPreference.companyfromMetadata);
                }
                else {
                    //console.log("Company from metadata is null");
                }
                CCI.NewsPreference.SetCheckboxforTaxonomy(CCI.NewsPreference.preSelectedPreferences[0].Department, CCI.NewsPreference.departmentfromMetadata);
                CCI.NewsPreference.SetCheckboxforTaxonomy(CCI.NewsPreference.preSelectedPreferences[0].COE, CCI.NewsPreference.coefromMetadata);
                CCI.NewsPreference.SetCheckboxforTaxonomy(CCI.NewsPreference.preSelectedPreferences[0].Division, CCI.NewsPreference.divisionfromMetadata);
                CCI.NewsPreference.SetCheckboxforTaxonomy(CCI.NewsPreference.preSelectedPreferences[0].Location, CCI.NewsPreference.locationfromMetadata);
                CCI.NewsPreference.SetCheckboxforTaxonomy(CCI.NewsPreference.preSelectedPreferences[0].Industry, CCI.NewsPreference.industryfromMetadata);
                CCI.NewsPreference.SetCheckboxforTaxonomy(CCI.NewsPreference.preSelectedPreferences[0].Topics, CCI.NewsPreference.topicsfromMetadata);

            //////////////////////////////////////////
                chkboxOnOff.checked = true;
                for (var i = 0; i <= CCI.NewsPreference.divIdCollection.length; i++) {
                    jQuery('#' + CCI.NewsPreference.divIdCollection[i] + ' input').each(function () {
                        var chkBox = this;
                        if (chkBox.checked == false) {
                            chkboxOnOff.checked = false;
                        }
                    });
                }
            /////////////////////////////////////////

        }
    },
    SetCheckboxforTaxonomy: function (taxonomyCollection, metadataCollection) {
        if (metadataCollection != null && taxonomyCollection != null) {
            
            for (var i = 0; i < taxonomyCollection.results.length; i++) {
                var taxid = taxonomyCollection.results[i].TermGuid;
                var result = jQuery.grep(metadataCollection, function (e) { return e.id == taxid; });
                if (result !== null) {
                    CCI.NewsPreference.SelectDeSelectChecbox(true, taxid);
                }
                else {
                    CCI.NewsPreference.SelectDeSelectChecbox(false, taxid);
                }
            }

        }
        else {
            //console.log("metadataCollection is null and hence can't select the checkbox.");
        }
    },
    SelectDeSelectChecbox: function (boolState, checkboxid) {
        jQuery('#' + checkboxid + '').prop('checked', boolState);
    },
    CancelUserSelection:function(){
        //CCI.NewsPreference.DeSelectAllCheckBox();
        //CCI.NewsPreference.SetPreSelectedPreferences();
        SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.Cancel);
        //OpenNewsPreferenceDialog();
    },
    DeSelectAllCheckBox: function () {
        var setState = false;
        for (var i = 0; i <= CCI.NewsPreference.divIdCollection.length; i++) {
            jQuery('#' + CCI.NewsPreference.divIdCollection[i] + ' input').each(function () {
                var chkBox = this;
                chkBox.checked = setState;
            });
        }
    },
    SelectDeSelectCheckBox: function () {
        var setState = false;
        if (jQuery("#chkboxOnOff").prop('checked'))
        {
            setState = true;
        }
        for (var i = 0; i <= CCI.NewsPreference.divIdCollection.length; i++) {
            jQuery('#'+CCI.NewsPreference.divIdCollection[i]+' input').each(function () {
                var chkBox = this;
                chkBox.checked= setState;
            });
        }
    },
    SetRecentlyAddedPreferences:function(){
        //CCI.NewsPreference.preSelectedPreferences=null;
        
        for (var divCountId = 0; divCountId <= CCI.NewsPreference.divIdCollection.length; divCountId++) {
            var currentid = divCountId;
            var selectedCollection = [];
            if (CCI.NewsPreference.checkPreferenceAvailable) {
                switch (CCI.NewsPreference.divIdCollection[currentid]) {
                    case "companyDiv":
                        selectedCollection = CCI.NewsPreference.preSelectedPreferences[0].Company;
                        break;
                    case "coeDiv":
                        selectedCollection = CCI.NewsPreference.preSelectedPreferences[0].COE;
                        break;
                    case "departmentsDiv":
                        selectedCollection = CCI.NewsPreference.preSelectedPreferences[0].Department;
                        break;
                    case "divisionDiv":
                        selectedCollection = CCI.NewsPreference.preSelectedPreferences[0].Division;
                        break;
                    case "topicsDiv":
                        selectedCollection = CCI.NewsPreference.preSelectedPreferences[0].Topics;
                        break;
                    case "industryDiv":
                        selectedCollection = CCI.NewsPreference.preSelectedPreferences[0].Industry;
                        break;
                    case "locationsDiv":
                        selectedCollection = CCI.NewsPreference.preSelectedPreferences[0].Location;
                        break;
                }
            }
            jQuery('#' + CCI.NewsPreference.divIdCollection[divCountId] + ' input').each(function () {
                var chkBox = this;
                if (chkBox.checked) {
                    var result = null;
                    if (CCI.NewsPreference.checkPreferenceAvailable) {
                        result = jQuery.grep(selectedCollection.results, function (e) {
                            return e.TermGuid == chkBox.id;
                        });
                        if (result.length <= 0) {
                            CCI.NewsPreference.RecentlyAddedPreference += chkBox.title + ",";
                        }
                    }
                    //if (result.length <= 0) {
                    //    CCI.NewsPreference.RecentlyAddedPreference += chkBox.title + ",";
                    //}
                    else {
                        CCI.NewsPreference.RecentlyAddedPreference += chkBox.title + ",";
                    }
                }
            });
        }
    },

//    Test: function (e) {
//        var NewsPreferenceGUID = CCI_Common.GetConfig(CCI.NewsPreference.preferenceList);
//        var context = SP.ClientContext.get_current();
//        var list = context.get_web().get_lists().getById(NewsPreferenceGUID);
//        var camlQuery = new SP.CamlQuery();
//        camlQuery.set_viewXml('<View><Query>\
//   <Where>\
//      <Eq>\
//         <FieldRef Name="CCI_x002d_UserID" LookupId="TRUE" />\
//         <Value Type="Lookup">' + _spPageContextInfo.userId + '</Value>\
//      </Eq>\
//   </Where>\
//</Query></View>');
//        var oListItem = list.getItems(camlQuery)
//        context.load(list);
//        context.load(oListItem);
//        context.executeQueryAsync(function () {
//            alert(oListItem.Title)
//            alert("done")
//        },
//            alert("error")
//            );            
//    },
    SavePreferences: function (e) {
        CCI.NewsPreference.SetRecentlyAddedPreferences();
        var NewsPreferenceGUID = CCI_Common.GetConfig(CCI.NewsPreference.preferenceList);
        var context = SP.ClientContext.get_current();
        var list = context.get_web().get_lists().getById(NewsPreferenceGUID);
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="CCI_x002d_UserID" LookupId="TRUE" />\
                     <Value Type="Lookup">' + _spPageContextInfo.userId + '</Value></Eq></Where></Query></View>');

       
        var oListItem = list.getItems(camlQuery)
        context.load(oListItem);

        var fieldCompany = list.get_fields().getByInternalNameOrTitle("CCI_x002d_Product");
        var fieldDepartment = list.get_fields().getByInternalNameOrTitle("CCI_x002d_Departments");
        var fieldCOE = list.get_fields().getByInternalNameOrTitle("CCI_x002d_COE");
        var fieldDivision = list.get_fields().getByInternalNameOrTitle("CCI_x002d_Division");
        var fieldLocation = list.get_fields().getByInternalNameOrTitle("CCI_x002d_Locations");
        var fieldIndustry = list.get_fields().getByInternalNameOrTitle("CCI_x002d_Industry");
        var fieldTopics = list.get_fields().getByInternalNameOrTitle("CCI_x002d_Topics");

        //var fieldCompany = list.get_fields().getByInternalNameOrTitle("Product");
        //var fieldDepartment = list.get_fields().getByInternalNameOrTitle("Departments");
        //var fieldCOE = list.get_fields().getByInternalNameOrTitle("COE");
        //var fieldDivision = list.get_fields().getByInternalNameOrTitle("Division");
        //var fieldLocation = list.get_fields().getByInternalNameOrTitle("Locations");
        //var fieldIndustry = list.get_fields().getByInternalNameOrTitle("Industry");
        //var fieldTopics = list.get_fields().getByInternalNameOrTitle("Topic");

        var taxCompanyField = context.castTo(fieldCompany, SP.Taxonomy.TaxonomyField);
        var taxTopicsField = context.castTo(fieldTopics, SP.Taxonomy.TaxonomyField);
        var taxDepartmentField = context.castTo(fieldDepartment, SP.Taxonomy.TaxonomyField);
        var taxCOEField = context.castTo(fieldCOE, SP.Taxonomy.TaxonomyField);
        var taxDivisionField = context.castTo(fieldDivision, SP.Taxonomy.TaxonomyField);
        var taxLocationField = context.castTo(fieldLocation, SP.Taxonomy.TaxonomyField);
        var taxIndustryField = context.castTo(fieldIndustry, SP.Taxonomy.TaxonomyField);

        context.load(fieldCompany);
        context.load(taxCompanyField);
        context.load(fieldTopics);
        context.load(taxTopicsField);
        context.load(fieldDepartment);
        context.load(taxDepartmentField);
        context.load(fieldCOE);
        context.load(taxCOEField);
        context.load(fieldDivision);
        context.load(taxDivisionField);
        context.load(fieldLocation);
        context.load(taxLocationField);
        context.load(fieldIndustry);
        context.load(taxIndustryField);
        //Get the response from server to get the termsetId  
        context.executeQueryAsync(function () {
            //   CCI.NewsPreference.SaveTaxonomyValues("companyDiv", context, taxCompanyField, oListItem);
            var companyterms = new Array();
            companyterms = [];
            jQuery('#companyDiv input:checked').each(function () {
                var selectedchkbox = this;
                companyterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
            });
            var topicterms = new Array();
            topicterms = [];
            jQuery('#topicsDiv input:checked').each(function () {
                var selectedchkbox = this;
                topicterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
            });
            var departmentterms = new Array();
            departmentterms = [];
            jQuery('#departmentsDiv input:checked').each(function () {
                var selectedchkbox = this;
                departmentterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
            });
            var coeterms = new Array();
            coeterms = [];
            jQuery('#coeDiv input:checked').each(function () {
                var selectedchkbox = this;
                coeterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
            });
            var locationterms = new Array();
            locationterms = [];
            jQuery('#locationsDiv input:checked').each(function () {
                var selectedchkbox = this;
                locationterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
            });
            var industryterms = new Array();
            industryterms = [];
            jQuery('#industryDiv input:checked').each(function () {
                var selectedchkbox = this;
                industryterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
            });
            var divisionterms = new Array();
            divisionterms = [];
            jQuery('#divisionDiv input:checked').each(function () {
                var selectedchkbox = this;
                divisionterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
            });

            //1. prepare taxonomyfieldvaluecollection object

            var termcompanyvaluestring = companyterms.join(";#");
            var termcompanyvalues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termcompanyvaluestring, taxCompanyField);
            var termtopicvaluestring = topicterms.join(";#");
            var termtopicvalues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termtopicvaluestring, taxTopicsField);
            var termdepartmentvaluestring = departmentterms.join(";#");
            var termdepartmentvalues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termdepartmentvaluestring, taxDepartmentField);
            var termcoevaluestring = coeterms.join(";#");
            var termcoevalues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termcoevaluestring, taxCOEField);
            var termlocationvaluestring = locationterms.join(";#");
            var termlocationvalues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termlocationvaluestring, taxLocationField);
            var termindustryvaluestring = industryterms.join(";#");
            var termindustryvalues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termindustryvaluestring, taxIndustryField);
            var termdivisionvaluestring = divisionterms.join(";#");
            var termdivisionvalues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termdivisionvaluestring, taxDivisionField);

            //2. update multi-valued taxonomy field
            if (oListItem.get_count() >0) {
                var e = oListItem.getEnumerator();
                while (e.moveNext()) {
                    var item = e.get_current();

                    taxCompanyField.setFieldValueByValueCollection(item, termcompanyvalues);
                    taxDepartmentField.setFieldValueByValueCollection(item, termdepartmentvalues);
                    taxCOEField.setFieldValueByValueCollection(item, termcoevalues);
                    taxLocationField.setFieldValueByValueCollection(item, termlocationvalues);
                    taxIndustryField.setFieldValueByValueCollection(item, termindustryvalues);
                    taxDivisionField.setFieldValueByValueCollection(item, termdivisionvalues);
                    taxTopicsField.setFieldValueByValueCollection(item, termtopicvalues);
                    item.set_item('CCI_x002d_RecentChannels', CCI.NewsPreference.RecentlyAddedPreference);
                    item.update();
                }
            }
            else
            {
                var itemCreateInfo = new SP.ListItemCreationInformation();
                oListItem = list.addItem(itemCreateInfo);

                oListItem.set_item('Title', 'My News Preference!');
                oListItem.set_item('CCI_x002d_Product', termcompanyvalues);
                oListItem.set_item('CCI_x002d_COE', termcoevalues);
                oListItem.set_item('CCI_x002d_Departments', termdepartmentvalues);
                oListItem.set_item('CCI_x002d_Division', termdivisionvalues);
                oListItem.set_item('CCI_x002d_Industry', termindustryvalues);
                oListItem.set_item('CCI_x002d_Locations', termlocationvalues);
                oListItem.set_item('CCI_x002d_UserID', _spPageContextInfo.userId);
                oListItem.set_item('CCI_x002d_Topics', termtopicvalues);
                oListItem.set_item('CCI_x002d_RecentChannels', CCI.NewsPreference.RecentlyAddedPreference);

                //oListItem.set_item('Product', termcompanyvalues);
                //oListItem.set_item('COE', termcoevalues);
                //oListItem.set_item('Departments', termdepartmentvalues);
                //oListItem.set_item('Division', termdivisionvalues);
                //oListItem.set_item('Industry', termindustryvalues);
                //oListItem.set_item('Locations', termlocationvalues);
                //oListItem.set_item('UserID', _spPageContextInfo.userId);
                //oListItem.set_item('Topic', termtopicvalues);
                //oListItem.set_item('CCI_x002d_RecentChannels', CCI.NewsPreference.RecentlyAddedPreference);


                oListItem.update();
                context.load(oListItem);
            }

            context.executeQueryAsync(
               function (sender, args) {
                   var jsonCacheString = '{' + CCI.NewsPreference.CreateJsonString('"Product"', companyterms) + ',' + CCI.NewsPreference.CreateJsonString('"COE"', coeterms) + ',' +
                    CCI.NewsPreference.CreateJsonString('"Divisions"', divisionterms) + ',' + CCI.NewsPreference.CreateJsonString('"Locations"', locationterms) + ',' +
                    CCI.NewsPreference.CreateJsonString('"Topics"', topicterms) + ',' + CCI.NewsPreference.CreateJsonString('"Industry"', industryterms) +
                    ',' + CCI.NewsPreference.CreateJsonString('"Departments"', departmentterms) + '}';

                   CCI.NewsPreference.SetToCache("NewsPreferenceCache", jsonCacheString);
                   //console.log('jsonCache:-' + CCI.NewsPreference.GetFromCache('NewsPreferenceCache'));
                   //managePreferences('news', jsonCacheString);

                   //console.log('Taxonomy List value items have been updated');
                   alert("Preferences saved successfully.");
                   CCI.NewsPreference.checkPreferenceAvailable = false;
                   CCI.NewsPreference.RecentlyAddedPreference = "";
                   //location.reload(true);
                   SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.OK);
                   window.loadResourcesNewsGrid();
               },
               onError
             );

            //function onError(sender, args) {
            //    console.log("Error updating Taxonomy");//args.get_message());
            //}
           },
          onError()
        );

        function onError(error) {
            if (typeof (error) !== "undefined") {
                console.log(error.message);
                CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-ModalPreference.js", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
            }
            //console.log(JSON.stringify(error));
        }
    },
    CreateJsonString: function (name, array) {
        var jsonObj = [];
        for (var i = 0; i <= array.length - 1; i++) {
            item = {}
            item["Item"] = array[i];

            jsonObj.push(item);
        }
        return name + ":" + JSON.stringify(jsonObj);
        console.log(jsonObj);
    },
    SaveTaxonomyValues:function(parentDivID,context,taxField,oListItem){
        var terms = new Array();
        terms = [];
        jQuery('#' + parentDivID + ' input:checked').each(function () {
            var selectedchkbox = this;
            terms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
        });
        
            //1. Prepare TaxonomyFieldValueCollection object

            var termValueString = terms.join(";#");
            var termValues = new SP.Taxonomy.TaxonomyFieldValueCollection(context, termValueString, taxField);
            
                //2. Update multi-valued taxonomy field
                var e = oListItem.getEnumerator();
                while (e.moveNext()) {
                    var item = e.get_current();
                    if (terms.length > 0) {
                        taxField.setFieldValueByValueCollection(item, termValues);
                    }
                    else {
                        taxField.setFieldValueByValueCollection(item, null);
                    }
                    item.update();
                }
    
            context.executeQueryAsync(
               function (sender, args) {
                   console.log('Taxonomy List value items have been updated');
               },
               onError
             );
        
            function onError(error) {
                if (error !== "undefined") {
                    console.log("Error updating taxonomy list for preferences.Error:" + JSON.stringify(error));
                    CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-ModalPreference.js", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
                }
            }
    },
    onGetAdminError: function (error) {
        if (error !== "undefined") {
            console.log(JSON.stringify(error));
            CCI_Common.LogException(_spPageContextInfo.userLoginName, "CCI-ModalPreference.js", _spPageContextInfo.serverRequestPath, JSON.stringify(error));
        }
    },
    loadPreferenceTermSet: function (success, error) {
        "use strict"; 
        //var companyTermSetId = '6287E386-CC63-4B84-8983-81C12CA8A836';

        //***************** Section for Coxlab2 ********************
        //var companyTermSetId = '023aa567-c09c-45ba-a4e5-f35624e4c625';
        var companyTermSetId = '141954bd-8ecc-41eb-a288-65df634c7282';
        var departmentTermSetId = 'fc4b3227-9625-4998-b3c3-0206a01fafe5';
        var coeTermSetId = 'ae8cf615-c78b-49a6-8a14-cde0578cfad6';
        var divisionTermSetId = '110504ca-0ee3-4808-9fa3-7e916e7a9d3b';
        var locationTermSetId = 'f18ac68a-ae0f-4947-88f6-92979231ba66';
        var industryTermSetId = '388c89a1-401b-4a23-b0f6-7035d0b6c372';
        var topicTermSetId = '9c88085c-c5d5-43cd-ae1a-91416e38ca1d';
        //***************** End of Section for Coxlab2 *************

        //***************** Section for Common environment *************
        /*var companyTermSetId = '88D73045-0990-46AB-908D-57AA6F396C42';
        var departmentTermSetId = '70AFEC62-DF94-4E67-BE91-672E326C56DD';
        var coeTermSetId = '65B5E2A6-E064-418C-BC19-EBBD11180C0D';
        var divisionTermSetId = '2D583F21-4F9E-41C7-81AF-4DDA1B46BFB2';
        var locationTermSetId = '9FB29BD7-4D9E-4E7B-9AA0-D2EF37CB865D';
        var industryTermSetId = 'DF8AFC63-6832-4AA6-AE4F-9122DA7461FB';
        var topicTermSetId = 'C20DB7B0-C925-4C80-BF71-F5FE38B90DB9';
        */
        //***************** End of section for Common environment *******


        var ctx = SP.ClientContext.get_current();
        var taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(ctx);
        var termStore = taxonomySession.getDefaultSiteCollectionTermStore();
        var companyTermSet = termStore.getTermSet(companyTermSetId);
        var companyTerms = companyTermSet.getAllTerms();
        ctx.load(companyTerms);
        var topicTermSet = termStore.getTermSet(topicTermSetId);
        var topicTerms = topicTermSet.getAllTerms();
        ctx.load(topicTerms);

        var departmentTermSet = termStore.getTermSet(departmentTermSetId);
        var departmentTerms = departmentTermSet.getAllTerms();
        ctx.load(departmentTerms);
        var coeTermSet = termStore.getTermSet(coeTermSetId);
        var coeTerms = coeTermSet.getAllTerms();
        ctx.load(coeTerms);
        var divisionTermSet = termStore.getTermSet(divisionTermSetId);
        var divisionTerms = divisionTermSet.getAllTerms();
        ctx.load(divisionTerms);
        var locationTermSet = termStore.getTermSet(locationTermSetId);
        var locationTerms = locationTermSet.getAllTerms();
        ctx.load(locationTerms);
        var industryTermSet = termStore.getTermSet(industryTermSetId);
        var industryTerms = industryTermSet.getAllTerms();
        ctx.load(industryTerms);

        ctx.executeQueryAsync(function () { success(companyTerms, departmentTerms,coeTerms,divisionTerms,locationTerms,industryTerms,topicTerms); }, error);
    },
    createPreferenceGrid: function (companyTerms, departmentTerms, coeTerms, divisionTerms, locationTerms, industryTerms,topicTerms) {
        for (var divCount = 0; divCount <= CCI.NewsPreference.divIdCollection.length; divCount++) {
            jQuery('#'+ CCI.NewsPreference.divIdCollection[divCount]).html('');
        }
        var companyHtml = '';
        var topicHtml = '';
        var departmentHtml = '';
        var coeHtml = '';
        var divisionHtml = '';
        var locationHtml = '';
        var industryHtml = '';
        CCI.NewsPreference.companyfromMetadata = [];
        CCI.NewsPreference.topicsfromMetadata = [];
        CCI.NewsPreference.departmentfromMetadata = [];
        CCI.NewsPreference.coefromMetadata = [];
        CCI.NewsPreference.divisionfromMetadata = [];
        CCI.NewsPreference.industryfromMetadata = [];
        CCI.NewsPreference.locationfromMetadata = [];
        var companyTermsEnumerator = companyTerms.getEnumerator();
        var departmentTermsEnumerator = departmentTerms.getEnumerator();
        var coeTermsEnumerator = coeTerms.getEnumerator();
        var topicTermsEnumerator = topicTerms.getEnumerator();
        var divisionTermsEnumerator = divisionTerms.getEnumerator();
        var locationTermsEnumerator = locationTerms.getEnumerator();
        var industryTermsEnumerator = industryTerms.getEnumerator();
        while (companyTermsEnumerator.moveNext()) {
            var currentTerm = companyTermsEnumerator.get_current();
            //var url = currentTerm.get_localCustomProperties()['_Sys_Nav_SimpleLinkUrl'];
            var name = currentTerm.get_name();
            var id_guid = currentTerm.get_id();
            companyHtml += '<li><label class="switch">\
                              <input type="checkbox" title="'+name+'" id="'+id_guid+'">\
                              <div class="slider round"></div>\
                            </label>\
                            <label>' + name + '</label></li>';
            CCI.NewsPreference.companyfromMetadata.push(id_guid);
        }
        jQuery('#companyDiv').append(companyHtml);

        while (topicTermsEnumerator.moveNext()) {
            var currentTerm = topicTermsEnumerator.get_current();
            //var url = currentTerm.get_localCustomProperties()['_Sys_Nav_SimpleLinkUrl'];
            var name = currentTerm.get_name();
            var id_guid = currentTerm.get_id();
            topicHtml += '<li><label class="switch">\
                              <input type="checkbox" title="'+ name + '" id="' + id_guid + '">\
                              <div class="slider round"></div>\
                            </label>\
                            <label>' + name + '</label></li>';
            CCI.NewsPreference.topicsfromMetadata.push(id_guid);
        }
        jQuery('#topicsDiv').append(topicHtml);

        while (departmentTermsEnumerator.moveNext()) {
            var currentTerm = departmentTermsEnumerator.get_current();
            //var url = currentTerm.get_localCustomProperties()['_Sys_Nav_SimpleLinkUrl'];
            var name = currentTerm.get_name();
            var id_guid = currentTerm.get_id();
            departmentHtml += '<li><label class="switch">\
                              <input type="checkbox" title="' + name + '" id="' + id_guid + '">\
                              <div class="slider round"></div>\
                            </label>\
                            <label>' + name + '</label></li>';
            CCI.NewsPreference.departmentfromMetadata.push(id_guid);
        }
        jQuery('#departmentsDiv').append(departmentHtml);
        
        while (coeTermsEnumerator.moveNext()) {
            var currentTerm = coeTermsEnumerator.get_current();
            //var url = currentTerm.get_localCustomProperties()['_Sys_Nav_SimpleLinkUrl'];
            var name = currentTerm.get_name();
            var id_guid = currentTerm.get_id();
            coeHtml += '<li><label class="switch">\
                              <input type="checkbox" title="' + name + '" id="' + id_guid + '">\
                              <div class="slider round"></div>\
                            </label>\
                            <label>' + name + '</label></li>';
            CCI.NewsPreference.coefromMetadata.push(id_guid);
        }
        jQuery('#coeDiv').append(coeHtml);

        while (locationTermsEnumerator.moveNext()) {
            var currentTerm = locationTermsEnumerator.get_current();
            //var url = currentTerm.get_localCustomProperties()['_Sys_Nav_SimpleLinkUrl'];
            var name = currentTerm.get_name();
            var id_guid = currentTerm.get_id();
            locationHtml += '<li><label class="switch">\
                              <input type="checkbox" title="' + name + '" id="' + id_guid + '">\
                              <div class="slider round"></div>\
                            </label>\
                            <label>' + name + '</label></li>';
            CCI.NewsPreference.locationfromMetadata.push(id_guid);
        }
        jQuery('#locationsDiv').append(locationHtml);

        while (divisionTermsEnumerator.moveNext()) {
            var currentTerm = divisionTermsEnumerator.get_current();
            //var url = currentTerm.get_localCustomProperties()['_Sys_Nav_SimpleLinkUrl'];
            var name = currentTerm.get_name();
            var id_guid = currentTerm.get_id();
            divisionHtml += '<li><label class="switch">\
                              <input type="checkbox" title="' + name + '" id="' + id_guid + '">\
                              <div class="slider round"></div>\
                            </label>\
                            <label>' + name + '</label></li>';
            CCI.NewsPreference.divisionfromMetadata.push(id_guid);
        }
        jQuery('#divisionDiv').append(divisionHtml);

        while (industryTermsEnumerator.moveNext()) {
            var currentTerm = industryTermsEnumerator.get_current();
            //var url = currentTerm.get_localCustomProperties()['_Sys_Nav_SimpleLinkUrl'];
            var name = currentTerm.get_name();
            var id_guid = currentTerm.get_id();
            industryHtml += '<li><label class="switch">\
                              <input type="checkbox" title="' + name + '" id="' + id_guid + '">\
                              <div class="slider round"></div>\
                            </label>\
                            <label>' + name + '</label></li>';
            CCI.NewsPreference.industryfromMetadata.push(id_guid);
        }
        jQuery('#industryDiv').append(industryHtml);
        //CCI.NewsPreference.SetPreSelectedPreferences();
        CCI.NewsPreference.GetUserPreferencesFromList();
    },
    ShowHidePrefernceDiv: function (boolShowState) {
        if (boolShowState)
        {
            jQuery('#preferenceDiv').show();
        }
        else {
            jQuery('#preferenceDiv').hide();
        }
        
    }
}
