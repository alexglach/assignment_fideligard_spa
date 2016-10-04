app.factory('StockService', ['$http', '$q', '$window', function($http, $q, $window) {
  var _stockSymbols = [ 'GOOG', 'AAPL','MSFT', 'AMZN', 'FB', 'XOM', 'GE', 'T', 'JPM', 'VZ', 'WMT']

  var _dates = [];
  var _stocksObject = {};
  var _stocks = {};

  var _generateData = function(){
    var requests = []
    _stockSymbols.forEach(function(symbol) {
      requests.push(buildRequest(symbol));
    });
    return $q.all(requests).then(function(responses){
      responses.forEach(function(response) {
        console.log("Is it running at all?")
        _buildStockObjects(response);
      });
      console.log("Data done!");
      _buildDatesArray();
    }, 
      function(error) {
        $window.alert("Uh oh! Looks like the data failed to load. Please refresh the page.")
      }
    );
  };

  var _buildDatesArray = function(){
    angular.copy(Object.keys(_stocks).sort(), _dates);
    console.log("Dates built");
  }

  var _buildStockObjects = function(response) {
    var stockDays = response.data.query.results.quote.reverse();
    var stockArray = response.data.query.results.quote;
    stockDays.forEach(function(day, index){
      if (_stocks[day.Date]) {
        _stocks[day.Date][day.Symbol] = {}
        _stocks[day.Date][day.Symbol].price = Number(day.Close);
        _stocks[day.Date][day.Symbol].oneDay = buildPrevDay(day.Date, day.Symbol, 1, day.Close); 
        _stocks[day.Date][day.Symbol].sevenDay = buildPrevDay(day.Date, day.Symbol, 7, day.Close); 
        _stocks[day.Date][day.Symbol].thirtyDay = buildPrevDay(day.Date, day.Symbol, 30, day.Close);
        _stocks[day.Date][day.Symbol].symbol = day.Symbol
        if (index + 1 < stockArray.length) {
          var extraDaysNeeded = ((new Date (stockArray[index + 1].Date) - new Date(day.Date)) / 86400000) - 1;
          for (var i = 0; i < extraDaysNeeded; i++) {
            _buildExtraStockObject(addDays(day.Date, i + 1), _stocks[day.Date][day.Symbol], day.Symbol)
          }
        }
      } else {
        _stocks[day.Date] = {}
        _stocks[day.Date][day.Symbol] = {}
        _stocks[day.Date][day.Symbol].price = Number(day.Close);
        _stocks[day.Date][day.Symbol].oneDay = buildPrevDay(day.Date, day.Symbol, 1, day.Close); 
        _stocks[day.Date][day.Symbol].sevenDay = buildPrevDay(day.Date, day.Symbol, 7, day.Close); 
        _stocks[day.Date][day.Symbol].thirtyDay = buildPrevDay(day.Date, day.Symbol, 30, day.Close);
        _stocks[day.Date][day.Symbol].symbol = day.Symbol 
        if (index + 1 < stockArray.length) {
          var extraDaysNeeded = ((new Date (stockArray[index + 1].Date) - new Date(day.Date)) / 86400000) - 1;
          for (var i = 0; i < extraDaysNeeded; i++) {
            _buildExtraStockObject(addDays(day.Date, i + 1), _stocks[day.Date][day.Symbol], day.Symbol)
          }
        }
      }
    })
  };

  var _buildExtraStockObject = function(date, prevInfo, symbol) {
    if (_stocks[date]) {
      _stocks[date][symbol] = {};
      _stocks[date][symbol].price = prevInfo.price;
      _stocks[date][symbol].oneDay = buildPrevDay(date, symbol, 1, prevInfo.price); 
      _stocks[date][symbol].sevenDay = buildPrevDay(date, symbol, 7, prevInfo.price); 
      _stocks[date][symbol].thirtyDay = buildPrevDay(date, symbol, 30, prevInfo.price);
      _stocks[date][symbol].symbol = symbol

    } else {
      _stocks[date] = {};
      _stocks[date][symbol] = {};
      _stocks[date][symbol].price = prevInfo.price;
      _stocks[date][symbol].oneDay = buildPrevDay(date, symbol, 1, prevInfo.price); 
      _stocks[date][symbol].sevenDay = buildPrevDay(date, symbol, 7, prevInfo.price); 
      _stocks[date][symbol].thirtyDay = buildPrevDay(date, symbol, 30, prevInfo.price);
      _stocks[date][symbol].symbol = symbol
    }
  }

  var buildPrevDay = function(date, symbol, days, currentPrice) {
    var daysBack = subtractDays(date, days);
    if (_stocks[daysBack]){
      return currentPrice - _stocks[daysBack][symbol].price
    } else {
      return currentPrice - _stocks['2015-01-02'][symbol].price
    }
  };

  var subtractDays = function(date, daysToSub) {
    var dateObj = new Date(date)
    var subtractedDate = new Date(dateObj.setDate(dateObj.getDate()- daysToSub))
    return subtractedDate.toISOString().substring(0, 10);
  };

  var addDays = function(date, daysToAdd) {
    var dateObj = new Date(date)
    var subtractedDate = new Date(dateObj.setDate(dateObj.getDate()+ daysToAdd))
    return subtractedDate.toISOString().substring(0, 10);
  };

  var buildRequest = function(symbol) {
    var url = 'https://query.yahooapis.com/v1/public/yql?q= '
    + 'select * from   yahoo.finance.historicaldata '
    + 'where  symbol    = ' + '"' + symbol + '"' + ' '
    + 'and    startDate = "2015-01-01" '
    + 'and    endDate   = "2015-12-31" '
    +'&format=json '
    + '&diagnostics=true '
    + '&env=store://datatables.org/alltableswithkeys '
    + '&callback=';
    return $http.get(url);
  };

  var getStockSymbols = function(){
    return _stockSymbols;
  }

  var getStocks = function(date){
    if (date === undefined) {
      date = '2015-01-02';
    }
    if (!_stocksObject.stocks) {
      return _generateData()
      .then(function(){
        return _stocksObject.stocks = _stocks[date];
      });
    }
    _stocksObject.stocks = _stocks[date];
    return _stocksObject;
  }

  var allDates = function(){
    return _dates;
  };

  var allStocks = function(){
    return _stocks;
  }


  return {
    allDates: allDates,
    getStocks: getStocks,
    getStockSymbols: getStockSymbols,
    allStocks: allStocks
  };

}]);
  
  // set a list of Stocks We Want
  // make a call for each stock
  // with each response, move it into:
  //    dates array - list of dates 
  //    stocks hash - based on date



// dates: ["1/1/2015", "1/2/2015" ...]
// stocks_hash:    {
      // '1/1/2015': {
      //   APPL: {
      //     oneDay: 100,
      //     sevenDay: -2.43,
      //     thirtyDay: -3.50
      //   }
      //   GOOG: {
      //     oneDay: 100,
      //     sevenDay: -2.43,
      //     thirtyDay: -3.50
      //   }
      // },
//       '1/2/2015': {
//         APPL: {
//           oneDay: 102,
//           sevenDay: -2.41,
//           thirtyDay: -3.51
//         }
//         GOOG: {
//           oneDay: 105,
//           sevenDay: -2.41,
//           thirtyDay: -3.51
//         }
//       },
//       ...

//     }
