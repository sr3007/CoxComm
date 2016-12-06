ExecuteOrDelayUntilBodyLoaded(function () {
    var serverUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
    SP.SOD.registerSod('sp.js', serverUrl + '/_layouts/15/sp.js')
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
        if (typeof utility != "undefined") {
            RegisterModuleInit(serverUrl + "/SiteAssets/COXOne/CustomHtml/ModalPreference.js", NewsPreferenceCore.init);
        } else {
            NewsPreferenceCore.init();
        }
    });
});
"use strict"
var NewsPreferenceCore = {
    init: function () {
        try {
            if (typeof utility == "object" && typeof NewsPreference == "object") {
                utility.init();

                NewsPreference.init();
            } else {
                NewsPreference.init();
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

var NewsPreference = {
    preferenceList: "NewsPreference",
    divIdCollection: ["companyDiv", "coeDiv", "departmentsDiv", "divisionDiv", "locationsDiv", "industryDiv"],
    companyfromMetadata: null,
    coefromMetadata: null,
    departmentfromMetadata: null,
    divisionfromMetadata: null,
    industryfromMetadata: null,
    locationfromMetadata:null,
    preSelectedPreferences: null,
    newUserSelectedPreferences:null,
    checkPreferenceAvailable: false,
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
                    NewsPreference.loadPreferenceTermSet(NewsPreference.createPreferenceGrid, NewsPreference.failNavigation);
                    NewsPreference.GetUserPreferencesFromList();
                });
            });
        });
    },
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
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('" + NewsPreference.preferenceList + "')/Items?";
        requestUri += "$select=ID,Title,Departments,Companies,COE,Division,Industry,Locations";
        requestUri += "&$filter=UserID eq " + _spPageContextInfo.userId;
        var requestHeaders = { "accept": "application/json;odata=verbose" };
        $.ajax({
            url: requestUri,
            contentType: "application/json;odata=verbose",
            headers: requestHeaders,
            success: NewsPreference.onGetPreferencesSuccess,
            error: NewsPreference.onGetAdminError
        });
    },
    onGetPreferencesSuccess: function (data, request) {
        NewsPreference.checkPreferenceAvailable = true;
        var i,listSelectionData,userPreferenceItem;
        var items = data.d.results;
        NewsPreference.preSelectedPreferences = [];
        for (i = 0; i < items.length; i++) {
            userPreferenceItem = items[i];
            listSelectionData = { ID: userPreferenceItem.ID, Title: userPreferenceItem.Title, Company: userPreferenceItem.Companies, Department: userPreferenceItem.Departments, COE: userPreferenceItem.COE, Division: userPreferenceItem.Division, Location: userPreferenceItem.Locations, Industry: userPreferenceItem.Industry };
            NewsPreference.preSelectedPreferences.push(listSelectionData);
        }
        NewsPreference.SetPreSelectedPreferences();
    },
    SetPreSelectedPreferences: function () {
        //check if NewsPreference.preSelectedPreferences[0] is not empty then proceed also check if NewsPreference is also not null
        //add specific check  collection both from termstore and list data
        if (!jQuery.isEmptyObject(NewsPreference.preSelectedPreferences[0])) {
                if (!jQuery.isEmptyObject(NewsPreference.companyfromMetadata)) {
                    NewsPreference.SetCheckboxforTaxonomy(NewsPreference.preSelectedPreferences[0].Company, NewsPreference.companyfromMetadata);
                }
                else {
                    console.log("Company from metadata is null");
                }
                NewsPreference.SetCheckboxforTaxonomy(NewsPreference.preSelectedPreferences[0].Department, NewsPreference.departmentfromMetadata);
                NewsPreference.SetCheckboxforTaxonomy(NewsPreference.preSelectedPreferences[0].COE, NewsPreference.coefromMetadata);
                NewsPreference.SetCheckboxforTaxonomy(NewsPreference.preSelectedPreferences[0].Division, NewsPreference.divisionfromMetadata);
                NewsPreference.SetCheckboxforTaxonomy(NewsPreference.preSelectedPreferences[0].Location, NewsPreference.locationfromMetadata);
                NewsPreference.SetCheckboxforTaxonomy(NewsPreference.preSelectedPreferences[0].Industry, NewsPreference.industryfromMetadata);
        }
    },
    SetCheckboxforTaxonomy: function (taxonomyCollection, metadataCollection) {
        if (metadataCollection != null && taxonomyCollection!=null) {
            for (var i = 0; i < taxonomyCollection.results.length; i++) {
                var taxid = taxonomyCollection.results[i].TermGuid;
                var result = jQuery.grep(metadataCollection, function (e) { return e.id == taxid; });
                if (result !== null) {
                    NewsPreference.SelectDeSelectChecbox(true, taxid);
                }
                else {
                    NewsPreference.SelectDeSelectChecbox(false, taxid);
                }
            }
        }
        else {
            console.log("metadataCollection is null and hence cann't select the checkbox.");
        }
    },
    SelectDeSelectCheckBox: function () {
        var setState = false;
        if (jQuery("#chkboxOnOff").prop('checked'))
        {
            setState = true;
        }
        for (var i = 0; i <= NewsPreference.divIdCollection.length; i++) {
            jQuery('#'+NewsPreference.divIdCollection[i]+' input').each(function () {
                var chkBox = this;
                chkBox.checked= setState;
            });
        }
    },
    GetUserSelectedPreferences: function () {
        NewsPreference.newUserSelectedPreferences = [];
        jQuery('#companyDiv input:checked').each(function () {
            var taxid = jQuery(this).ID;
            NewsPreference.newUserSelectedPreferences.push();
        });
    },
    SavePreferences: function (e) {
        
        var context = SP.ClientContext.get_current();
        var list = context.get_web().get_lists().getByTitle(NewsPreference.preferenceList);
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="UserID" LookupId="TRUE" />\
                     <Value Type="Lookup">' + _spPageContextInfo.userId + '</Value></Eq></Where></Query></View>');
        var oListItem = list.getItems(camlQuery)
        
        context.load(oListItem);

        var fieldCompany = list.get_fields().getByInternalNameOrTitle("Companies");
        var fieldDepartment = list.get_fields().getByInternalNameOrTitle("Departments");
        var fieldCOE = list.get_fields().getByInternalNameOrTitle("COE");
        var fieldDivision = list.get_fields().getByInternalNameOrTitle("Division");
        var fieldLocation = list.get_fields().getByInternalNameOrTitle("Locations");
        var fieldIndustry = list.get_fields().getByInternalNameOrTitle("Industry");

        var taxCompanyField = context.castTo(fieldCompany, SP.Taxonomy.TaxonomyField);
        var taxDepartmentField = context.castTo(fieldDepartment, SP.Taxonomy.TaxonomyField);
        var taxCOEField = context.castTo(fieldCOE, SP.Taxonomy.TaxonomyField);
        var taxDivisionField = context.castTo(fieldDivision, SP.Taxonomy.TaxonomyField);
        var taxLocationField = context.castTo(fieldLocation, SP.Taxonomy.TaxonomyField);
        var taxIndustryField = context.castTo(fieldIndustry, SP.Taxonomy.TaxonomyField);

        context.load(fieldCompany);
        context.load(taxCompanyField);
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
            //   NewsPreference.SaveTaxonomyValues("companyDiv", context, taxCompanyField, oListItem);
            var companyterms = new Array();
            companyterms = [];
            jQuery('#companyDiv input:checked').each(function () {
                var selectedchkbox = this;
                companyterms.push("-1;#" + selectedchkbox.title + "|" + selectedchkbox.id);
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

                    item.update();
                }
            }
            else
            {
                var itemCreateInfo = new SP.ListItemCreationInformation();
                oListItem = list.addItem(itemCreateInfo);

                oListItem.set_item('Title', 'My New Preference!');
                oListItem.set_item('Companies', termcompanyvalues);
                oListItem.set_item('COE', termcoevalues);
                oListItem.set_item('Departments', termdepartmentvalues);
                oListItem.set_item('Division', termdivisionvalues);
                oListItem.set_item('Industry', termindustryvalues);
                oListItem.set_item('Locations', termlocationvalues);
                oListItem.set_item('UserID', _spPageContextInfo.userId);

                oListItem.update();
                context.load(oListItem);
            }

            context.executeQueryAsync(
               function (sender, args) {
                   var jsonCacheString = '{' + NewsPreference.CreateJsonString('"Company"', companyterms) + ',' + NewsPreference.CreateJsonString('"COE"', coeterms) + ',' +
                    NewsPreference.CreateJsonString('"Divisions"', divisionterms) + ',' + NewsPreference.CreateJsonString('"Locations"', locationterms) + ',' + NewsPreference.CreateJsonString('"Industry"', industryterms) +
                    ',' + NewsPreference.CreateJsonString('"Departments"', departmentterms) + '}';
                   NewsPreference.SetToCache("NewsPreferenceCache", jsonCacheString);
                   console.log('jsonCache:-' + NewsPreference.GetFromCache('NewsPreferenceCache'));
                   //managePreferences('news', jsonCacheString);

                   console.log('Taxonomy List value items have been updated');
                   alert("Preferences Saved successfully.");
                   //location.reload(true);
                   SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.OK);
                   window.execOperation();
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
            console.log("Error updating Taxonomy");
            console.log(JSON.stringify(error));
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
                console.log("Error updating taxonomy list for preferences");
                console.log(JSON.stringify(error));
            }
    },
    SelectDeSelectChecbox: function (boolState, checkboxid) {
        jQuery('#' + checkboxid + '').prop('checked', boolState);
    },
    onGetAdminError: function (error) {
        console.log(JSON.stringify(error));
    },
    loadPreferenceTermSet: function (success, error) {
        "use strict";
        var companyTermSetId = '6287e386-cc63-4b84-8983-81c12ca8a836';
        var departmentTermSetId = '70afec62-df94-4e67-be91-672e326c56dd';
        var coeTermSetId = '65b5e2a6-e064-418c-bc19-ebbd11180c0d';
        var divisionTermSetId = '2d583f21-4f9e-41c7-81af-4dda1b46bfb2';
        var locationTermSetId = '9fb29bd7-4d9e-4e7b-9aa0-d2ef37cb865d';
        var industryTermSetId = 'df8afc63-6832-4aa6-ae4f-9122da7461fb';
        var ctx = SP.ClientContext.get_current();
        var taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(ctx);
        var termStore = taxonomySession.getDefaultSiteCollectionTermStore();
        var companyTermSet = termStore.getTermSet(companyTermSetId);
        var companyTerms = companyTermSet.getAllTerms();
        ctx.load(companyTerms);
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

        ctx.executeQueryAsync(function () { success(companyTerms, departmentTerms,coeTerms,divisionTerms,locationTerms,industryTerms); }, error);
    },
    createPreferenceGrid: function (companyTerms, departmentTerms, coeTerms, divisionTerms, locationTerms, industryTerms) {
        
        var companyHtml='';
        var departmentHtml = '';
        var coeHtml = '';
        var divisionHtml = '';
        var locationHtml = '';
        var industryHtml = '';
        NewsPreference.companyfromMetadata = [];
        NewsPreference.departmentfromMetadata = [];
        NewsPreference.coefromMetadata = [];
        NewsPreference.divisionfromMetadata = [];
        NewsPreference.industryfromMetadata = [];
        NewsPreference.locationfromMetadata = [];
        var companyTermsEnumerator = companyTerms.getEnumerator();
        var departmentTermsEnumerator = departmentTerms.getEnumerator();
        var coeTermsEnumerator = coeTerms.getEnumerator();
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
            NewsPreference.companyfromMetadata.push(id_guid);
        }
        jQuery('#companyDiv').append(companyHtml);
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
            NewsPreference.departmentfromMetadata.push(id_guid);
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
            NewsPreference.coefromMetadata.push(id_guid);
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
            NewsPreference.locationfromMetadata.push(id_guid);
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
            NewsPreference.divisionfromMetadata.push(id_guid);
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
            NewsPreference.industryfromMetadata.push(id_guid);
        }
        jQuery('#industryDiv').append(industryHtml);
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
