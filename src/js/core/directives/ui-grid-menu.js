(function(){

/**
 * @ngdoc directive
 * @name ui.grid.directive:uiGridColumnMenu
 * @element style
 * @restrict A
 *
 * @description
 * Allows us to interpolate expressions in `<style>` elements. Angular doesn't do this by default as it can/will/might? break in IE8.
 *
 * @example
 <doc:example module="app">
 <doc:source>
 <script>
 var app = angular.module('app', ['ui.grid']);

 app.controller('MainCtrl', ['$scope', function ($scope) {
   
 }]);
 </script>

 <div ng-controller="MainCtrl">
   <div ui-grid-menu shown="true"  ></div>
 </div>
 </doc:source>
 <doc:scenario>
 it('should apply the right class to the element', function () {
      element(by.css('.blah')).getCssValue('border')
        .then(function(c) {
          expect(c).toContain('1px solid');
        });
    });
 </doc:scenario>
 </doc:example>
 */
angular.module('ui.grid')

.directive('uiGridMenu', ['$log', '$timeout', '$window', '$document', 'gridUtil', function ($log, $timeout, $window, $document, gridUtil) {
  var uiGridMenu = {
    priority: 0,
    scope: {
      // shown: '&',
      menuItems: '=',
      autoHide: '=?'
    },
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridMenu',
    replace: false,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      gridUtil.enableAnimations($elm);

      if (typeof($scope.autoHide) === 'undefined' || $scope.autoHide === undefined) {
        $scope.autoHide = true;
      }

      if ($scope.autoHide) {
        angular.element($window).on('resize', $scope.hideMenu);
      }

      $scope.$on('hide-menu', function () {
        $scope.shown = false;
      });

      $scope.$on('show-menu', function () {
        $scope.shown = true;
      });

      $scope.$on('$destroy', function() {
        angular.element($window).off('resize', $scope.hideMenu);
      });
    },
    controller: function ($scope, $element, $attrs) {
      this.hideMenu = $scope.hideMenu = function() {
        $scope.shown = false;
      };
    }
  };

  return uiGridMenu;
}])

.directive('uiGridMenuItem', ['$log', function ($log) {
  var uiGridMenuItem = {
    priority: 0,
    scope: {
      title: '=',
      active: '=',
      action: '=',
      icon: '=',
      shown: '=',
      context: '='
    },
    require: ['?^uiGrid', '^uiGridMenu'],
    templateUrl: 'ui-grid/uiGridMenuItem',
    replace: true,
    link: function ($scope, $elm, $attrs, controllers) {
      var uiGridCtrl = controllers[0],
          uiGridMenuCtrl = controllers[1];

      // TODO(c0bra): validate that shown and active are function if they're defined. An exception is already thrown above this though
      // if (typeof($scope.shown) !== 'undefined' && $scope.shown && typeof($scope.shown) !== 'function') {
      //   throw new TypeError("$scope.shown is defined but not a function");
      // }

      if (typeof($scope.shown) === 'undefined' || $scope.shown === null) {
        $scope.shown = function() { return true; };
      }

      $scope.itemAction = function($event) {
        if (typeof($scope.action) === 'function') {
          var context = {};

          if ($scope.context) {
            context.context = $scope.context;
          }

          // Add the grid to the function call context if the uiGrid controller is present
          if (typeof(uiGridCtrl) !== 'undefined' && uiGridCtrl) {
            context.grid = uiGridCtrl.grid;
          }
          
          $scope.action.call(context, $event);

          uiGridMenuCtrl.hideMenu();
        }
      };
    }
  };

  return uiGridMenuItem;
}]);

})();