angular.module( 'moviematch.match', [
  'moviematch.authServices',
  'moviematch.lobbyServices',
  'moviematch.matchServices',
  'moviematch.sessionServices',
  'moviematch.miscServices'] )

.controller( 'MatchController', function( $scope, Match, Auth, Session, FetchMovies, Socket ) {
  $scope.session = {};
  $scope.user = {};
  $scope.imgPath = 'http://image.tmdb.org/t/p/w500';

  $scope.user.name = Auth.getUserName();

  Session.getSession()
  .then( function( session ) {
    $scope.session = session;
  });

  var currMovieIndex = 0;
  var currMoviePackage = 0;

  var fetchNextMovies = function( packageNumber, callback ){
    FetchMovies.getNext10Movies( packageNumber )
      .then( function( data ) {
        $scope.moviePackage = data;
        callback();
      })
  };

  var loadNextMovie = function(){
    if( currMovieIndex === 9 ) {
      currMoviePackage++;
      fetchNextMovies( currMoviePackage, function() {
        $scope.currMovie = $scope.moviePackage[0];
        });
      currMovieIndex = 0;
    }
    else {
      currMovieIndex++;
      $scope.currMovie = $scope.moviePackage[currMovieIndex];
    }

  };

  $scope.init = function() {        //as soon as the view is loaded request the first movie-package here
    fetchNextMovies( 0, function() {
      $scope.currMovie = $scope.moviePackage[0];
    });
  };

  $scope.init();

  // Listen for the signal to redirect to a 'match found' page.
  Socket.on( 'matchRedirect', function( id ) {
    // id refers to the id of the movie that the group matched on
    Match.matchRedirect( id );
  });

  $scope.yes = function() {
    Match.sendVote( $scope.session.sessionName, $scope.user.name, $scope.currMovie.id, true )
    // For every 'yes' we want to double check to see if we have a match. If we do,
    // we want to send a socket event out to inform the server.
    .then( function() {
      Match.checkMatch( $scope.session, $scope.currMovie )
      .then( function( result ) {
        if( result ) {
          Socket.emit( 'foundMatch', { sessionName: $scope.session.sessionName, movie: $scope.currMovie } );
        } else {
          loadNextMovie();
        }
      });
    });
  }
  $scope.no = function() {
    Match.sendVote( $scope.session.sessionName, $scope.user.name, $scope.currMovie.id, false );
    loadNextMovie();
  }
} );
