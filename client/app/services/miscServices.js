angular.module( 'moviematch.miscServices', [] )

.factory( 'FetchMovies', function( $http ) {
  return {

   getMovies: function (sessionId) {
     return $http.post(
       '/api/movies/',
       {sessionId: sessionId})
      .then( function( res ) {
        return res.data;
      }, function ( err ) {
        console.error( err );
      });
    },

    getMovie: function( id ) {
      return $http.get( '/api/movies/' + id )
      .then( function( res ) {
        return res.data;
      },
      function( err ) {
        console.error( err );
      });
    },

    getGenreMovies: function ( genre ) {
      console.log('in get genre in fetchmovies factory with this genre: ', genre);
      return $http.get( '/api/genres/' + genre )
      .then( function( res ) {
        console.log('now in get genre in fetchmovies factory with this res', res.data);
        return res.data;
      },
      function( err ) {
        console.error( err );
      });
    },

    getTheaterMovies: function () {
      console.log('getting theater movies');
      return $http.post('/api/movies/theaters/')
      .then( function(res) {
        console.log('got theater movies');
        return res.data;
      }, function(err) {
        console.error(err);
      });
    }

  };
})

.factory( 'Socket', ['socketFactory', function(socketFactory){
  return socketFactory();
}])

.factory( 'Movies', function ($http) {
  return {
    searchMovies: function (query) {
      return $http.post(
       '/api/movies/search/',
        {query: query}
      )
      .then( function (res) {
        return res.data;
      },
      function (err) {
        console.log(err);
      });
    },

    saveMovie: function ( movie, sessionId ) {
      return $http.post(
        '/api/movies/save/',
        {
          movie: movie,
          sessionId: sessionId
        })
      .then( function( res ) {
        console.log('Movie successfully saved', res.data);
        return res.data;
      },
      function ( err ) {
        console.log('Error saving movie', err);
      });
    }

  };
});
