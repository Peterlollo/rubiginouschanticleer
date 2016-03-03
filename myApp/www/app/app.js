var app = angular.module( 'moviematch', [
  'moviematch.auth',
  'moviematch.match',
  'moviematch.prefs',
  'moviematch.sessions',
  'moviematch.authServices',
  'moviematch.sessionServices',
  'moviematch.matchServices',
  'moviematch.lobbyServices',
  'moviematch.miscServices',
  'moviematch.showmatch',
  'moviematch.lobby',
  'ngRoute',
  'btford.socket-io',
  'moviematch.directive',
  'moviematch.dstValidateUser',
  'ionic',
  'starter.controllers',
  'starter.services'
  ])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config( function ( $routeProvider, $httpProvider, $stateProvider, $urlRouterProvider ) {

  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'app/auth/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.signin', {
    url: '/signin',
    views: {
      'tab-signin': {
        templateUrl: 'app/auth/signin.html',
        controller: 'AuthController'
      }
    }
  })
  .state('tab.signin-signup', {
    url: '/signin/signup',
    views: {
      'tab-signin': {
        templateUrl: 'app/auth/signup.html',
        controller: 'AuthController'
      }
    }
  })
  // .state('tab.dash', {
  //   url: '/dash',
  //   views: {
  //     'tab-dash': {
  //       templateUrl: 'templates/tab-dash.html',
  //       controller: 'DashCtrl'
  //     }
  //   }
  // })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/signin');





  // $routeProvider
  //   .when( '/signin', {
  //     templateUrl: 'app/auth/signin.html',
  //     controller: 'AuthController'
  //   })
  //   .when( '/signup', {
  //     templateUrl: 'app/auth/signup.html',
  //     controller: 'AuthController'
  //   })
  //   .when( '/signout', {
  //     templateUrl: 'app/auth/signout.html',
  //     controller: 'AuthController'
  //   })
  //   .when( '/match', {
  //     templateUrl: 'app/match/match.html',
  //     controller: 'MatchController',
  //     authenticate: true
  //   })
  //   .when( '/sessions', {
  //     templateUrl: 'app/sessions/joinsessions.html',
  //     controller: 'SessionsController',
  //     authenticate: true
  //   })
  //   .when( '/lobby', {
  //     templateUrl: 'app/lobby/lobby.html',
  //     controller: 'LobbyController',
  //     authenticate: true
  //   })
  //   .when( '/showmatch/:id', {
  //     templateUrl: 'app/showmatch/showmatch.html',
  //     controller: 'ShowmatchController',
  //     authenticate: true
  //   })
  //   .otherwise({
  //     redirectTo: '/signin'
  //   })

    $httpProvider.interceptors.push('AttachTokens');

})

.factory('AttachTokens', function ($window) {
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.moviematch');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})

.run(function ($rootScope, $location, Auth) {
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      $location.path('/signin');
    }
  });
});

