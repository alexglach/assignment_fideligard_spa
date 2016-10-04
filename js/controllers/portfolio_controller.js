app.controller('PortfolioCtrl',
['stocks', '$scope', 'StockService', 'DateService', 'dates', '$stateParams', 'PortfolioService', "$state",
function(stocks, $scope, StockService, DateService, dates, $stateParams, PortfolioService, $state) {

  $scope.dateInfo = DateService.getDateInfo();
  $scope.portfolio = PortfolioService.getPortfolio();
  $scope.allDates = StockService.allDates();

  $scope.getDaysBack = function(symbol, days, currentBasis) {
    var currentIndex = _.indexOf($scope.allDates, $scope.dateInfo.currentDate)
    var prevIndex = currentIndex - days;
    if (prevIndex < 0) {
      prevIndex = 0;
    }
    var prevDate = $scope.allDates[prevIndex];
    var pastPortfolio = $scope.portfolio[prevDate];
    if (symbol === "CASH") {
      var prevValue = pastPortfolio.cash.quantity
      var prevBasis = pastPortfolio.cash.quantity
    } else {
      var prevValue = pastPortfolio[symbol].quantity * pastPortfolio[symbol].currentPrice;
      var prevBasis = pastPortfolio[symbol].costBasis
    }
    return prevValue - prevBasis;
  }

  $scope.getPortValue = function(day){
    if (day === undefined) {
      day = $scope.dateInfo.currentDate;
    }
    var sum = 0;
    _.forEach($scope.portfolio[day], function(holding){
      sum += holding.currentPrice * holding.quantity
    })
    return sum
  };

  $scope.getCostBasis = function(day) {
    if (day === undefined) {
      day = $scope.dateInfo.currentDate;
    }
    var sum = 0;
    _.forEach($scope.portfolio[day], function(holding){
      sum += holding.costBasis;
    })
    return sum
  };

  $scope.getPrevValue = function(days) {
    var currentIndex = _.indexOf($scope.allDates, $scope.dateInfo.currentDate)
    var prevIndex = currentIndex - days;
    if (prevIndex < 0) {
      prevIndex = 0;
    }
    var prevDate = $scope.allDates[prevIndex];
    return $scope.getPortValue(prevDate) - $scope.getCostBasis(prevDate);
  }


  $scope.greaterThan = function(prop, val){
    return function(item){
      return item[prop] > val;
    }
  };


}]);