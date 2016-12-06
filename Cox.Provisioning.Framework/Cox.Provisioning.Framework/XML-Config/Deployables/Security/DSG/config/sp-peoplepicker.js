﻿(function () {

    angular.module('sp-peoplepicker', []).directive('spPeoplePicker', function ($q, $timeout, $compile) {
        //Usage:
        //<sp-people-picker name="taskAssignee" id="taskAssignee" data-ng-model="$scope.taskAssignees" min-entries="1" max-entries="5" allow-duplicates="false" show-login="false" show-title="true" min-characters="2" app-web-url="$scope.spAppWebUrl" />
        var directive = {
            link: link,
            restrict: 'EA',
            require: 'ngModel',
            replace: true,
            scope: {
                minEntries: '@',
                maxEntries: '@',
                allowDuplicates: '@',
                showLogin: '=',
                showTitle: '=',
                minCharacters: '@',
                selections: '=',
                appWebUrl: '='
            },
            template: function (element, attrs) {
                var htmlText =
                    '<div class="cam-peoplepicker-input">' +
                    '<div id="divPeoplePick" class="cam-peoplepicker-userlookup ms-fullWidth">' +
                    '<span id="spanPeoplePick"></span>' +
                    '<input type="text" id="inputPeoplePick" class="cam-peoplepicker-edit" />' +
                    '</div>' +
                    '<div id="divPeoplePickSearch" class="cam-peoplepicker-usersearch ms-emphasisBorder"></div>' +
                    '<input type="hidden" name="hdnPeoplePick" id="hdnPeoplePick" />' +
                    '</div>';
                return htmlText;
            },
            controller: ['$scope', '$element', function ($scope, $element) {
                $scope.spContext = new SP.ClientContext($scope.appWebUrl);
                var factory = new SP.ProxyWebRequestExecutorFactory($scope.appWebUrl);
                $scope.spContext.set_webRequestExecutorFactory(factory);
                $scope.peoplePicker = new CAMControl.PeoplePicker($scope.spContext, $('#spanPeoplePick', $element), $('#inputPeoplePick', $element), $('#divPeoplePickSearch', $element), $('#hdnPeoplePick', $element));
                $scope.peoplePicker.$scope = $scope;
                $scope.peoplePicker.$compile = $compile;
            }]
        };
        return directive;

        function link(scope, element, attrs, ngModel) {
            //Make a people picker control
            $q.when().then(function() {
                var deferred = $q.defer();
                $timeout(function() {
                    var value = (attrs.value || ngModel.$modelValue || ngModel.$viewValue );
                    if (value) {
                        $('#hdnPeoplePick', element).val(typeof(value) === 'string' ? value : JSON.stringify(value));
                    }
                    deferred.resolve();
                });
                return deferred.promise;
            }).then(function() {
                //1. scope.spContext = SharePoint Client Context object
                //2. $('#spanPeoplePick') = SPAN that will 'host' the people picker control
                //3. $('#inputPeoplePick') = INPUT that will be used to capture user input
                //4. $('#divPeoplePickSearch') = DIV that will show the 'dropdown' of the people picker
                //5. $('#hdnPeoplePick') = INPUT hidden control that will host a JSON string of the resolved users

                // required to pass the variable name here!
                scope.peoplePicker.InstanceName = "peoplePicker";
                // Pass current language, if not set defaults to en-US. Use the SPLanguage query string param or provide a string like "nl-BE"
                // Do not set the Language property if you do not have foreseen javascript resource file for your language
                //peoplePicker.Language = spLanguage;
                // optionally show more/less entries in the people picker dropdown, 4 is the default
                scope.peoplePicker.MaxEntriesShown = scope.maxEntries;
                // Can duplicate entries be selected (default = false)
                scope.peoplePicker.AllowDuplicates = scope.allowDuplicates;
                // Show the user loginname
                scope.peoplePicker.ShowLoginName = scope.showLogin;
                // Show the user title
                scope.peoplePicker.ShowTitle = scope.showTitle;
                // Invoke a method when a new recipient is selected
                scope.peoplePicker.OnSelectionChanged = function () {
                    var result = JSON.parse($('#hdnPeoplePick', element).val());
                    ngModel.$setViewValue(result);
                    ngModel.$render();
                    scope.$apply();

                    // check validity
                    isValid();
                };
                // Set principal type to determine what is shown (default = 1, only users are resolved).
                // See http://msdn.microsoft.com/en-us/library/office/microsoft.sharepoint.client.utilities.principaltype.aspx for more details
                // Set ShowLoginName and ShowTitle to false if you're resolving groups
                scope.peoplePicker.PrincipalType = SP.Utilities.PrincipalType.all;
                // start user resolving as of 2 entered characters (= default)
                scope.peoplePicker.MinimalCharactersBeforeSearching = scope.minCharacters;
                // Hookup everything
                scope.peoplePicker.Initialize();
                isValid();

                // check if the field is valid
                function isValid() {
                    var minBounds = true;
                    var maxBounds = true;

                    if(ngModel.$viewValue) {
                        if (attrs.hasOwnProperty('minEntries')) {
                            minBounds = (ngModel.$viewValue.length >= parseInt(scope.minEntries, 10));
                        }
                        if (attrs.hasOwnProperty('maxEntries')) {
                            maxBounds = (ngModel.$viewValue.length <= parseInt(scope.maxEntries, 10));
                        }
                    }

                    var valid = minBounds && maxBounds;
                    ngModel.$setValidity('required', valid);
                }
            });
        }
    });

    var CAMControl;
    (function (CAMControl) {
        var PeoplePicker = (function () {

            // Constructor
            function PeoplePicker(SharePointContext, PeoplePickerControl, PeoplePickerEdit, PeoplePickerDisplay, PeoplePickerData) {
                //public properties
                this.SharePointContext = SharePointContext;
                this.PeoplePickerControl = PeoplePickerControl;
                this.PeoplePickerEdit = PeoplePickerEdit;
                this.PeoplePickerDisplay = PeoplePickerDisplay;
                this.PeoplePickerData = PeoplePickerData;
                this.InstanceName = "";
                this.MaxEntriesShown = 4;
                this.ShowLoginName = true;
                this.ShowTitle = true;
                this.MinimalCharactersBeforeSearching = 2;
                this.PrincipalType = 1;
                this.AllowDuplicates = false;
                this.Language = "en-us";
                this.OnSelectionChanged = null;
                //Private variable is not really private, just a naming convention
                this._queryID = 1;
                this._lastQueryID = 1;
                this._ResolvedUsers = [];
                this.$scope = null;
                this.$compile = null;
            }

            // Property wrapped in function to allow access from event handler
            PeoplePicker.prototype.GetPrincipalType = function () {
                return this.PrincipalType;
            };

            // Property wrapped in function to allow access from event handler
            PeoplePicker.prototype.SetPrincipalType = function (principalType) {
                //See http://msdn.microsoft.com/en-us/library/office/microsoft.sharepoint.client.utilities.principaltype.aspx
                //This enumeration has a FlagsAttribute attribute that allows a bitwise combination of its member values.
                //None Enumeration whose value specifies no principal type. Value = 0.
                //User Enumeration whose value specifies a user as the principal type. Value = 1.
                //DistributionList Enumeration whose value specifies a distribution list as the principal type. Value = 2.
                //SecurityGroup Enumeration whose value specifies a security group as the principal type. Value = 4.
                //SharePointGroup Enumeration whose value specifies a group (2) as the principal type. Value = 8.
                //All Enumeration whose value specifies all principal types. Value = 15.

                this.PrincipalType = principalType;
            };

            // Property wrapped in function to allow access from event handler
            PeoplePicker.prototype.GetMinimalCharactersBeforeSearching = function () {
                return this.MinimalCharactersBeforeSearching;
            };

            // Property wrapped in function to allow access from event handler
            PeoplePicker.prototype.SetMinimalCharactersBeforeSearching = function (minimalChars) {
                this.MinimalCharactersBeforeSearching = minimalChars;
            };

            // HTML encoder
            PeoplePicker.prototype.HtmlEncode = function (html) {
                return document.createElement('a').appendChild(document.createTextNode(html)).parentNode.innerHTML;
            };

            // HTML decoder
            PeoplePicker.prototype.HtmlDecode = function (html) {
                var a = document.createElement('a');
                a.innerHTML = html;
                return a.textContent;
            };

            // Replace all string occurances, add a bew ReplaceAll method to the string type
            String.prototype.ReplaceAll = function (token, newToken, ignoreCase) {
                var _token;
                var str = this + "";
                var i = -1;

                if (typeof token === "string") {
                    if (ignoreCase) {
                        _token = token.toLowerCase();
                        while ((
                            i = str.toLowerCase().indexOf(
                                token, i >= 0 ? i + newToken.length : 0
                            )) !== -1
                            ) {
                            str = str.substring(0, i) +
                                newToken +
                                str.substring(i + token.length);
                        }
                    } else {
                        return this.split(token).join(newToken);
                    }
                }
                return str;
            };

            PeoplePicker.prototype.LoadScript = function (url, callback) {
                var head = document.getElementsByTagName("head")[0];
                var script = document.createElement("script");
                script.src = url;

                // Attach handlers for all browsers
                var done = false;
                script.onload = script.onreadystatechange = function () {
                    if (!done && (!this.readyState
                        || this.readyState == "loaded"
                        || this.readyState == "complete")) {
                        done = true;

                        // Continue your code
                        callback();

                        // Handle memory leak in IE
                        script.onload = script.onreadystatechange = null;
                        head.removeChild(script);
                    }
                };

                head.appendChild(script);
            };

            // String formatting
            PeoplePicker.prototype.Format = function (str) {
                for (var i = 1; i < arguments.length; i++) {
                    str = str.ReplaceAll("{" + (i - 1) + "}", arguments[i]);
                }
                return str;
            };

            // Hide the user selection box
            PeoplePicker.prototype.HideSelectionBox = function () {
                this.PeoplePickerDisplay.css('display', 'none');
            };

            // show the user selection box
            PeoplePicker.prototype.ShowSelectionBox = function () {
                this.PeoplePickerDisplay.css('display', 'block');
            };

            // Generates the html for a resolved user
            PeoplePicker.prototype.ConstructResolvedUserSpan = function (login, name, lookupId) {

                resultDisplay = 'Remove person or group {0}';
                if (typeof deleteUser != 'undefined') {
                    resultDisplay = deleteUser;
                }

                lookupValue = (login) ? login.replace("\\", "\\\\") : lookupId;

                resultDisplay = this.Format(resultDisplay, name);

                userDisplaySpanTemplate = '<span class="cam-peoplepicker-userSpan"><span class="cam-entity-resolved">{0}</span><a title="{3}" class="cam-peoplepicker-delImage" ng-click="{1}.DeleteProcessedUser({2})" href>x</a></span>';
                return this.Format(userDisplaySpanTemplate, name, this.InstanceName, "'" + lookupValue + "'", resultDisplay);
            };

            // Create a html representation of the resolved user array
            PeoplePicker.prototype.ResolvedUsersToHtml = function () {
                var userHtml = '';
                for (var i = 0; i < this._ResolvedUsers.length; i++) {
                    userHtml += this.ConstructResolvedUserSpan(this._ResolvedUsers[i].Login, this._ResolvedUsers[i].Name, this._ResolvedUsers[i].LookupId);
                }
                return this.$compile(userHtml)(this.$scope);
            };

            // Returns a resolved user object
            PeoplePicker.prototype.ResolvedUser = function (login, name, email) {
                var user = {};
                user.Login = login;
                user.Name = name;
                user.Email = email;
                return user;
            };

            // Add resolved user to array and updates the hidden field control with a JSON string
            PeoplePicker.prototype.PushResolvedUser = function (resolvedUser) {

                if (this.AllowDuplicates) {
                    this._ResolvedUsers.push(resolvedUser);
                } else {
                    var duplicate = false;
                    for (var i = 0; i < this._ResolvedUsers.length; i++) {
                        if (this._ResolvedUsers[i].Login == resolvedUser.Login) {
                            duplicate = true;
                        }
                    }

                    if (!duplicate) {
                        this._ResolvedUsers.push(resolvedUser);
                    }
                }

                this.PeoplePickerData.val(JSON.stringify(this._ResolvedUsers));
            };

            // Remove last added resolved user from the array and updates the hidden field control with a JSON string
            PeoplePicker.prototype.PopResolvedUser = function () {
                this._ResolvedUsers.pop();
                this.PeoplePickerData.val(JSON.stringify(this._ResolvedUsers));
            };

            // Remove resolved user from the array and updates the hidden field control with a JSON string
            PeoplePicker.prototype.RemoveResolvedUser = function (lookupValue) {
                var newResolvedUsers = [];
                for (var i = 0; i < this._ResolvedUsers.length; i++) {
                    var resolvedLookupValue = this._ResolvedUsers[i].Login ? this._ResolvedUsers[i].Login : this._ResolvedUsers[i].LookupId;
                    if (resolvedLookupValue != lookupValue) {
                        newResolvedUsers.push(this._ResolvedUsers[i]);
                    }
                }
                this._ResolvedUsers = newResolvedUsers;
                this.PeoplePickerData.val(JSON.stringify(this._ResolvedUsers));
            };

            // Update the people picker control to show the newly added user
            PeoplePicker.prototype.RecipientSelected = function (login, name, email) {
                this.HideSelectionBox();
                // Push new resolved user to list
                this.PushResolvedUser(this.ResolvedUser(login, name, email));
                // Update the resolved user display
                this.PeoplePickerControl.html(this.ResolvedUsersToHtml());
                // Prepare the edit control for a second user selection
                this.PeoplePickerEdit.val('');
                this.PeoplePickerEdit.focus();
                this.OnSelectionChanged();
            };

            // Delete a resolved user
            PeoplePicker.prototype.DeleteProcessedUser = function (lookupValue) {
                this.RemoveResolvedUser(lookupValue);
                this.PeoplePickerControl.html(this.ResolvedUsersToHtml());
                this.PeoplePickerEdit.focus();
                this.OnSelectionChanged();
            };

            // Function called when something went wrong with the user query (clientPeoplePickerSearchUser)
            PeoplePicker.prototype.QueryFailure = function (queryNumber) {
                alert('Error performing user search');
            };

            // Function called then the clientPeoplePickerSearchUser succeeded
            PeoplePicker.prototype.QuerySuccess = function (queryNumber, searchResult) {
                var results = this.SharePointContext.parseObjectFromJsonString(searchResult.get_value());
                var txtResults = '';

                var baseDisplayTemplate = '<div class=\'ms-bgHoverable\' style=\'width: 400px; padding: 4px;\' ng-click=\'{0}.RecipientSelected(\"{1}\", \"{2}\", \"{3}\")\'>{4}';
                var displayTemplate = '';
                if (this.ShowLoginName && this.ShowTitle) {
                    displayTemplate = baseDisplayTemplate + ' ({5})<br/>{6}</div>';
                } else if (this.ShowLoginName || this.ShowTitle) {
                    displayTemplate = baseDisplayTemplate + ' ({6})</div>';
                } else {
                    displayTemplate = baseDisplayTemplate + '</div>';
                }

                if (results) {
                    if (results.length > 0) {
                        // if this function is not the callback from the last issued query then just ignore it. This is needed to ensure a matching between
                        // what the user entered and what is shown in the query feedback window
                        if (queryNumber < this._lastQueryID) {
                            return;
                        }

                        var displayCount = results.length;
                        if (displayCount > this.MaxEntriesShown) {
                            displayCount = this.MaxEntriesShown;
                        }

                        for (var i = 0; i < displayCount; i++) {
                            var item = results[i];
                            var loginName = item['Key'];
                            var displayName = item['DisplayText'];
                            var title = item['EntityData']['Title'];
                            var email = item['EntityData']['Email'];

                            var loginNameDisplay = email;
                            if (loginName && loginName.indexOf('|') > -1) {
                                var segs = loginName.split('|');
                                loginNameDisplay = loginNameDisplay + " " + segs[segs.length - 1];
                                loginNameDisplay = loginNameDisplay.trim();
                            }
                            txtResults += this.Format(displayTemplate, this.InstanceName, loginName.replace("\\", "\\\\"), this.HtmlEncode(displayName), email, displayName, loginNameDisplay, title);
                        }
                        var resultDisplay = '';
                        txtResults += '<div class=\'ms-emphasisBorder\' style=\'width: 400px; padding: 4px; border-left: none; border-bottom: none; border-right: none; cursor: default;\'>';
                        if (results.length == 1) {
                            resultDisplay = 'Showing {0} result';
                            if (typeof resultsSingle != 'undefined') {
                                resultDisplay = resultsSingle;
                            }
                            txtResults += this.Format(resultDisplay, results.length) + '</div>';
                        } else if (displayCount != results.length) {
                            resultDisplay = "Showing {0} of {1} results. <B>Please refine further<B/>";
                            if (typeof resultsTooMany != 'undefined') {
                                resultDisplay = resultsTooMany;
                            }
                            txtResults += this.Format(resultDisplay, displayCount, results.length) + '</div>';
                        } else {
                            resultDisplay = "Showing {0} results";
                            if (typeof resultsMany != 'undefined') {
                                resultDisplay = resultsMany;
                            }
                            txtResults += this.Format(resultDisplay, results.length) + '</div>';
                        }

                        this.PeoplePickerDisplay.html(this.$compile(txtResults)(this.$scope));
                        //display the suggestion box
                        this.ShowSelectionBox();
                    }
                    else {
                        var searchbusy = '<div class=\'ms-emphasisBorder\' style=\'width: 400px; padding: 4px; border-left: none; border-bottom: none; border-right: none; cursor: default;\'>No results found</div>';
                        this.PeoplePickerDisplay.html(this.$compile(searchbusy)(this.$scope));
                        //display the suggestion box
                        this.ShowSelectionBox();
                    }
                }
                else {
                    //hide the suggestion box since results are null
                    this.HideSelectionBox();
                }
            };

            // Initialize
            PeoplePicker.prototype.Initialize = function () {

                var scriptUrl = "";
                var scriptRevision = "";
                $('script').each(function (i, el) {
                    if (el.src.toLowerCase().indexOf('peoplepickercontrol.js') > -1) {
                        scriptUrl = el.src;
                        scriptRevision = scriptUrl.substring(scriptUrl.indexOf('.js') + 3);
                        scriptUrl = scriptUrl.substring(0, scriptUrl.indexOf('.js'));
                    }
                });

                // Load translation files
                var resourcesFile = scriptUrl + "_resources." + this.Language.substring(0, 2).toLowerCase() + ".js";
                if (scriptRevision.length > 0) {
                    resourcesFile += scriptRevision;
                }

                this.LoadScript(resourcesFile, function () {
                });


                // is there data in the hidden control...if so show it
                if (this.PeoplePickerData.val().length > 0) {
                    // Deserialize JSON string into list of resolved users
                    this._ResolvedUsers = JSON.parse(this.PeoplePickerData.val());
                    // update the display of resolved users
                    this.PeoplePickerControl.html(this.ResolvedUsersToHtml());
                }

                //Capture reference to current control so that it can be used in event handlers
                var parent = this;

                //Capture click on parent DIV and set focus to the input control
                this.PeoplePickerControl.parent().click(function (e) {
                    parent.PeoplePickerEdit.focus();
                });

                this.PeoplePickerEdit.keydown(function (event) {
                    var keynum = event.which;

                    //backspace
                    if (keynum == 8) {
                        //hide the suggestion box when backspace has been pressed
                        parent.HideSelectionBox();
                        // do we have text entered
                        var unvalidatedText = parent.PeoplePickerEdit.val();
                        if (unvalidatedText.length > 0) {
                            // delete the last entered character...meaning do nothing as this delete will happen as part of the keypress
                        }
                        else {
                            // are there resolved users, if not there's nothing to delete
                            if (parent._ResolvedUsers.length > 0) {
                                // remove the last added user
                                parent.PopResolvedUser();
                                // update the display
                                parent.PeoplePickerControl.html(parent.ResolvedUsersToHtml());
                                // focus back to input control
                                parent.PeoplePickerEdit.focus();
                                // Eat the backspace key
                                return false;
                            }
                        }
                    }
                    // An ascii character or a space has been pressed
                    else if (keynum >= 48 && keynum <= 90 || keynum == 32) {
                        // get the text entered before the keypress processing (so the last entered key is missing here)
                        var txt = parent.PeoplePickerEdit.val();

                        // keynum is not taking in account shift key and always results inthe uppercase value
                        if (event.shiftKey == false && keynum >= 65 && keynum <= 90) {
                            keynum += 32;
                        }

                        // Append the last entered character: since we're handling a keydown event this character has not yet been added hence the returned value misses the last character
                        txt += String.fromCharCode(keynum);

                        // we should have at least 1 character
                        if (txt.length > 0) {
                            var searchText = txt;

                            //ensure that MinimalCharactersBeforeSearching >= 1
                            if (parent.GetMinimalCharactersBeforeSearching() < 1) {
                                parent.SetMinimalCharactersBeforeSearching(1);
                            }

                            // only perform a query when we at least have two chars and we do not have a query running already
                            if (searchText.length >= parent.GetMinimalCharactersBeforeSearching()) {
                                resultDisplay = 'Searching...';
                                if (typeof resultsSearching != 'undefined') {
                                    resultDisplay = resultsSearching;
                                }
                                var searchbusy = parent.Format('<div class=\'ms-emphasisBorder\' style=\'width: 400px; padding: 4px; border-left: none; border-bottom: none; border-right: none; cursor: default;\'>{0}</div>', resultDisplay);
                                parent.PeoplePickerDisplay.html(parent.$compile(searchbusy)(parent.$scope));
                                //display the suggestion box
                                parent.ShowSelectionBox();

                                var query = new SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters();
                                query.set_allowMultipleEntities(false);
                                query.set_maximumEntitySuggestions(2000);
                                query.set_principalType(parent.GetPrincipalType());
                                query.set_principalSource(15);
                                query.set_queryString(searchText);
                                var searchResult = SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser(parent.SharePointContext, query);

                                // update the global queryID variable so that we can correlate incoming delegate calls later on
                                parent._queryID = parent._queryID + 1;
                                var queryIDToPass = parent._queryID;
                                parent._lastQueryID = queryIDToPass;

                                // make the SharePoint request
                                parent.SharePointContext.executeQueryAsync(Function.createDelegate(this, function () { parent.QuerySuccess(queryIDToPass, searchResult); }),
                                    Function.createDelegate(this, function () { parent.QueryFailure(queryIDToPass); }));
                            }
                        }
                    }
                    //tab or escape
                    else if (keynum == 9 || keynum == 27) {
                        //hide the suggestion box
                        parent.HideSelectionBox();
                    }
                });
            };

            return PeoplePicker;
        })();
        CAMControl.PeoplePicker = PeoplePicker;
    })(CAMControl || (CAMControl = {}));
})();
