angular.module( 'moviematch.match', [
  'moviematch.authServices',
  'moviematch.lobbyServices',
  'moviematch.matchServices',
  'moviematch.sessionServices',
  'moviematch.miscServices'] )

.controller( 'MatchController', function( $scope, Match, Auth, Session, FetchMovies, Socket, Movies, Lobby ) {
  $scope.session = {};
  $scope.user = {};
  $scope.imgPath = 'http://image.tmdb.org/t/p/w500';
  var currMovieIndex = 0;
  $scope.user.name = Auth.getUserName();
  $scope.noMoreMovies = false;
  $scope.loading = false;
  $scope.users = [];
  $scope.doneUsers = 0;
  $scope.compromiseFound = false;


  $scope.userDone =  function () {
    $scope.loading = true;
    Socket.emit( 'doneUser', {sessionId: $scope.session.id} );
  };


  Session.getSession()
  .then( function( session ) {
    $scope.session = session;
    $scope.init();
    console.log('THIS IS THE SESSION ID', $scope.session.id);
  });

  //as soon as the view is loaded request the movie queue here
   $scope.init = function() {
      FetchMovies.getMovies($scope.session.id)
      .then( function (data) {
        console.log('movies in init', data);
        $scope.queue = data;
        $scope.currMovie = data[currMovieIndex];
     });
      Lobby.getUsersInOneSession($scope.session.id)
      .then( function (users){
        $scope.users = _.map(users, function(user) {
          return user.username;
        });
      });
     };

  var loadNextMovie = function(){
    currMovieIndex++;
    if(!$scope.queue[currMovieIndex]) {
      $scope.noMoreMovies = true;
      $scope.userDone();
    } else {
      $scope.currMovie = $scope.queue[currMovieIndex];
    }
  };

    $scope.yes = function() {
      Match.sendVote( $scope.session.id, $scope.user.name, $scope.currMovie.id, true, $scope.currMovie.movieDbId)
      // For every 'yes' we want to double check to see if we have a match. If we do,
      // we want to send a socket event out to inform the server.
      .then( function() {
        Match.checkMatch( $scope.session, $scope.currMovie )
        .then( function( result ) {
          if( result ) {
            Socket.emit( 'foundMatch', { sessionId: $scope.session.id, movie: $scope.currMovie } );
          } else {
            loadNextMovie();
          }
        });
      });
    };

    $scope.no = function() {
      Match.sendVote( $scope.session.id, $scope.user.name, $scope.currMovie.id, false, $scope.currMovie.movieDbId );
      loadNextMovie();
    };

  // Listen for the signal to redirect to a 'match found' page.
  Socket.on( 'matchRedirect', function( id ) {
    // id refers to the id of the movie that the group matched on
    Match.matchRedirect( id );
  });

  Socket.on( 'newUser', function ( data ) {
    $scope.doneUsers++;
    console.log('GOT NEW USER IN SOCKET: done users = ', $scope.doneUsers);
    if($scope.doneUsers === $scope.users.length){
      $scope.loading = false;
      Socket.emit( 'compromise', {sessionId: $scope.session.id});
      // Socket.emit( 'doneUser', {sessionId: $scope.session.id} );
      // Match.getCompromise($scope.session.id)
      // .then(function(movie) {
      //   $scope.compromiseFound = true;
      //   $scope.currMovie = movie || $scope.currMovie;
      // });
    }
  });

  Socket.on( 'compromiseNow', function ( data ) {
    console.log('compro now socket fired');
    Match.getCompromise($scope.session.id)
        .then(function(movie) {
          $scope.compromiseFound = true;
          $scope.loading = false;
          $scope.currMovie = movie || $scope.currMovie;
        });
  });
});