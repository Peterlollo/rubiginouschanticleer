angular.module( 'moviematch.add', [] )
.controller( 'AddController', function( $scope, Session, Lobby, Socket, $location, Auth, Movies, FetchMovies ) {
  $scope.session = {};
  $scope.movies = [];
  $scope.search = false;
  $scope.genreSearch = false;
  $scope.users = [];
  $scope.doneUsers = 0;
  $scope.theaters = [];
  $scope.nowShowing = false;
  $scope.loading = false;
  $scope.preLoading = true;
  var _ = window._;
  $scope.imgPath = 'http://image.tmdb.org/t/p/w500';
  $scope.genreMovies = [];
  $scope.popModal = {
    name: 'peter'
  };

  // FEATURE TO BE IMPLEMENTED
  $scope.popover = function(movie){
    $scope.popModal.title = movie.title;
    $scope.popModal.poster_path = movie.poster_path;
    $scope.popModal.overview = movie.overview;
    $scope.popModal.rating = movie.vote_average;
    $scope.popModal.movie = movie;
    console.log('popover logs: ', movie);
  };

  $scope.getGenreMovies = function(genre) {
    console.log('in scope get genre with this genre: ', genre);
    FetchMovies.getGenreMovies(genre)
    .then( function (movies) {
      $scope.genreMovies = movies.results;
    }, function ( err ) {
      console.error( 'Error retrieving genre movies', err);
    });
  };

  $scope.theaters = function() {
    $scope.nowShowing = !$scope.nowShowing;
    if ($scope.nowShowing){
      $scope.getTheaterMovies();
    }
  };

  $scope.getTheaterMovies = function() {
    FetchMovies.getTheaterMovies()
    .then( function (movies) {
      $scope.theaters = movies.results;
    }, function (err){
      console.error( 'Error retrieving theater movies', err);
    });
  };

  Session.getSession()
  .then( function( session ) {
    $scope.session = session;
    Lobby.getUsersInOneSession($scope.session.id)
    .then( function (users){
      $scope.users = _.map(users, function(user) {
        return user.username;
      });
      console.log('GET USERS IN SESSION ', $scope.users);
    });
    console.log('GET SESSION and scope.session', $scope.session);
  });

  $scope.searchMovies = function () {
    if($scope.query.replace(/\s/g, '') !== ''){
      Movies.searchMovies($scope.query)
      .then( function (data) {
        console.log('here the data data data', data);
        $scope.updateMovieResults(data);
      });
    } else {
      $scope.results = [];
    }
  };

  $scope.updateMovieResults = function (data) {
    $scope.results = data.results;
  };

  $scope.addToQueue = function (movie) {
    // console.log('movie from addToQueue function: SOCKET1', movie);
    // console.log('SESSION', $scope.session);
    movie = movie || $scope.popModal.movie;
    console.log('movie from addToQueue function: SOCKET1', movie);
    console.log('SESSION', $scope.session);
    Socket.emit( 'addMovie', {sessionId: $scope.session.id, movie: movie} );
    Movies.saveMovie(movie, $scope.session.id);
  };

  $scope.startSession = function (sessionId) {
    $location.path( '/match' );
  };

  $scope.userDone = _.once(function () {
    $scope.preLoading = false;
    $scope.loading = true;
    Socket.emit( 'doneUser', {sessionId: $scope.session.id} );
  });

  Socket.on( 'newMovie', function( data ) {
    $scope.movies.push( data );
  });

  Socket.on( 'newUser', function ( data ) {
    $scope.doneUsers++;
    if($scope.doneUsers === $scope.users.length){
      $location.path( '/match' );
    }
  });

  $scope.genres = [
  {
    name: 'action',
    id: 28
  },
  {
    name: 'adventure',
    id: 12
  },
  {
    name: 'animation',
    id: 16
  },
  {
    name: 'comedy',
    id: 35
  },
  {
    name: 'crime',
    id: 80
  },
  {
    name: 'documentary',
    id: 99
  },
  {
    name: 'drama',
    id: 18
  },
  {
    name: 'family',
    id: 10751
  },
  {
    name: 'fantasy',
    id: 14
  },
  {
    name: 'foreign',
    id: 10769
  },
  {
    name: 'history',
    id: 36
  },
  {
    name: 'horror',
    id: 27
  },
  {
    name: 'music',
    id: 10402
  },
  {
    name: 'mystery',
    id: 9648
  },
  {
    name: 'romance',
    id: 10749
  },
  {
    name: 'science fiction',
    id: 878
  },
  {
    name: 'TV movie',
    id: 10770
  },
  {
    name: 'thriller',
    id: 53
  },
  {
    name: 'war',
    id: 10752
  },
  {
    name: 'western',
    id: 37
  }
  ];
});