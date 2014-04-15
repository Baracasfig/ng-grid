(function () {
  'use strict';
  /**
   *  @ngdoc object
   *  @name ui.grid.service:gridClassFactory
   *
   *  @description factory to return dom specific instances of a grid
   *
   */
  angular.module('ui.grid').service('gridClassFactory', ['gridUtil', '$q', '$templateCache', 'uiGridConstants', '$log', 'Grid', 'GridColumn', 'GridRow',
    function (gridUtil, $q, $templateCache, uiGridConstants, $log, Grid, GridColumn, GridRow) {

      var service = {
        /**
         * @ngdoc method
         * @name createGrid
         * @methodOf ui.grid.service:gridClassFactory
         * @description Creates a new grid instance. Each instance will have a unique id
         * @returns {Grid} grid
         */
        createGrid : function() {
          var grid = new Grid(gridUtil.newId());

          grid.registerColumnBuilder(service.defaultColumnBuilder);

          grid.registerRowBuilder(grid.rowSearcher);

          // Register the default row processor, it sorts rows by selected columns
          if (!grid.options.enableExternalSorting) {
            grid.registerRowsProcessor(grid.sortByColumn);
          }

          return grid;
        },

        /**
         * @ngdoc function
         * @name defaultColumnBuilder
         * @methodOf ui.grid.service:gridClassFactory
         * @description Processes designTime column definitions and applies them to col for the
         *              core grid features
         * @param {object} colDef reference to column definition
         * @param {GridColumn} col reference to gridCol
         * @param {object} gridOptions reference to grid options
         */
        defaultColumnBuilder: function (colDef, col, gridOptions) {

          var templateGetPromises = [];

          col.headerCellTemplate = colDef.headerCellTemplate || $templateCache.get('ui-grid/uiGridHeaderCell');

          col.cellTemplate = colDef.cellTemplate ||
            $templateCache.get('ui-grid/uiGridCell')
              .replace(uiGridConstants.CUSTOM_FILTERS, col.cellFilter ? "|" + col.cellFilter : "");

          if (colDef.cellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.cellTemplate)) {
            templateGetPromises.push(
              gridUtil.getTemplate(colDef.cellTemplate)
                .then(function (contents) {
                  col.cellTemplate = contents;
                })
            );
          }

          if (colDef.headerCellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.headerCellTemplate)) {
            templateGetPromises.push(
              gridUtil.getTemplate(colDef.headerCellTemplate)
                .then(function (contents) {
                  col.headerCellTemplate = contents;
                })
            );
          }

          return $q.all(templateGetPromises);
        }

      };

      //class definitions (moved to separate factories)

      return service;
    }]);

})();