angular.module( 'moviematch.match', [
  'moviematch.authServices',
  'moviematch.lobbyServices',
  'moviematch.matchServices',
  'moviematch.sessionServices',
  'moviematch.miscServices'] )

.controller( 'MatchController', function( $scope, Match, Auth, Session, FetchMovies, Socket, Movies ) {
  $scope.session = {};
  $scope.user = {};
  $scope.imgPath = 'http://image.tmdb.org/t/p/w500';
  var currMovieIndex = 0;
  $scope.user.name = Auth.getUserName();
  $scope.noMoreMovies = false;

  Session.getSession()
  .then( function( session ) {
    $scope.session = session;
    $scope.init();
  });

  //as soon as the view is loaded request the movie queue here
   $scope.init = function() {
      FetchMovies.getMovies($scope.session.id)
      .then( function (data) {
        console.log('movies in init', data);
        $scope.queue = data;
        $scope.currMovie = data[currMovieIndex];
     });
     };

  var loadNextMovie = function(){
    currMovieIndex++;
    if(!$scope.queue[currMovieIndex]) {
      $scope.noMoreMovies = true;
      FetchMovies.getCompromise()
      .then(function(movie) {
        $scope.currMovie = movie;
      });
    } else {
      $scope.currMovie = $scope.queue[currMovieIndex];
    }
  };

    $scope.yes = function() {
      Match.sendVote( $scope.session.id, $scope.user.name, $scope.currMovie.id, true )
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
      Match.sendVote( $scope.session.id, $scope.user.name, $scope.currMovie.id, false );
      loadNextMovie();
    };

  // Listen for the signal to redirect to a 'match found' page.
  Socket.on( 'matchRedirect', function( id ) {
    // id refers to the id of the movie that the group matched on
    Match.matchRedirect( id );
  });

});
