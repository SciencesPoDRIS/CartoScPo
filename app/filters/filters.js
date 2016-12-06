angular.module('bib')
.filter('visibleColumns', function($rootScope) {
  return function(data, grid, query) {

    var matches = [];

    //no filter defined so bail
    if (query === undefined || query === '') {
      return data;
    }

    query = query.toLowerCase();

    //loop through data items and visible fields searching for match
    var scope = $rootScope.$new(true);
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < grid.columnDefs.length; j++) {

        var dataItem = data[i];
        var fieldName = grid.columnDefs[j].field;
        var renderedData = dataItem[fieldName];

        // apply cell filter
        if (grid.columnDefs[j].cellFilter) {
          scope.value = renderedData;
          renderedData = scope.$eval('value | ' + grid.columnDefs[j].cellFilter);
        }

        //as soon as search term is found, add to match and move to next dataItem
        if (renderedData.toString().toLowerCase().indexOf(query) > -1) {
          matches.push(dataItem);
          break;
        }
      }
    }
    scope.$destroy();

    return matches;
  };
});


