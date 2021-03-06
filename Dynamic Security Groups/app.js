﻿(function () {
    'use strict';        
    var app = angular.module('app', [
      //inject other Angular Modules	
      'ngRoute',
      'ngSanitize',
      'ngResource',	
      'ui.bootstrap',
      //add the tax picker directive
      'ui.TaxonomyPicker',
      //inject App modules
      'common'
    ]);

  /*  myApp.directive("datepicker", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, elem, attrs, ngModelCtrl) {
                var updateModel = function (dateText) {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(dateText);
                    });
                };
                var options = {
                    dateFormat: "dd/mm/yy",
                    onSelect: function (dateText) {
                        updateModel(dateText);
                    }
                };
                elem.datepicker(options);
            }
        }
    });*/

    
    app.directive('jqdatepicker', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                element.datepicker({
                    dateFormat: 'mm/dd/yy',
                    onSelect: function (date) {
                       /* scope.dateLastStart = date;
                        scope.$apply();*/
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(date);
                        });
                    }
                });
            }
        };
    });

})();