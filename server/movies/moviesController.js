var Movies = require( './movies' );
var Sessions_Movies = require ('../sessions_movies/sessions_movies');
var env = require('../env/env.js');
var api_key = env.api_key;
var searchUrl = 'http://api.themoviedb.org/3/search/movie';
var request = require('request');

var getDate = function () {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  }

  if(mm<10) {
      mm='0'+mm
  }

  return yyyy + '-' + mm + '-' + dd;
};

var getEarlierDate = function (date) {
  dateArray = date.split("-");
  var mm = parseInt(dateArray[1]);
  if (mm === 1) {
    mm = 12;
  }else{
    mm--;
  }
  dateArray[1] = mm.toString();
  return dateArray.join("-");
}

module.exports = {

  getMovies: function( req, res, next ) {
   var sessionId = req.body.sessionId;
   Sessions_Movies.findAll({where: {
     session_id: sessionId
   }})
   .then( function ( session_movies ) {
     if(!session_movies) {
       res.send(404, 'no movies found');
     } else {
       var movies = session_movies.map(function (obj) {
         return obj.movie_id;
       });
       Movies.findAll( {where: {id: {$in: movies}}} )
       .then( function( moviesInfo ) {
         res.json( moviesInfo );
       } );
     }
   });
  },

  //returns the requested 10er movie package
  getMoviePackage: function( req, res ) {
    res.send( Movies.getMoviePackage( req.params.number ));
  },

  getMovie: function( req, res ) {
   var movieId = parseInt( req.params.movie_id );
   Movies.findOne({where: {id: movieId}})
     .then( function ( movie ) {
       if(!movie) {
         res.send(404, 'did not find movie');
       } else {
         console.log('and we are returning this fat movie', movie.dataValues);
         res.json(movie.dataValues);
       }
     });
  },

  getMoviesInTheaters: function(req, res ) {
    var date = getDate();
    var earlierDate = getEarlierDate(date);
    console.log("api call for movies between " + date + " and " + earlierDate);
    var options = {
      method: 'GET',
      url: 'http://api.themoviedb.org/3/discover/movie?primary_release_date.gte=' + earlierDate + '&primary_release_date.lte=' + date,
      qs:
        {
          api_key: api_key,
      },
      headers:
        {
          'postman-token': '617cd5a3-78db-0ae0-0d80-cffed6da26e4',
          'cache-control': 'no-cache'
        }
      };

    request(options, function (error, response, body) {
     if (error) throw new Error(error);
     res.end(body);
    });
  },

  getSearchResults: function (req, res, next) {
    var query = req.body.query;
    var options = {
      method: 'GET',
      url: 'http://api.themoviedb.org/3/search/movie',
      qs:
        {
          api_key: api_key,
        query: query
      },
      headers:
        {
          'postman-token': '617cd5a3-78db-0ae0-0d80-cffed6da26e4',
          'cache-control': 'no-cache'
        }
      };

    request(options, function (error, response, body) {
     if (error) throw new Error(error);
     res.end(body);
    });
  },

  saveMovie: function ( req, res, next ) {
    var sessionId = req.body.sessionId;
    var movie = req.body.movie;
    Movies.create( {
      title: movie.title,
      image: movie.poster_path,
      movieDbId: movie.id
    }).then( function ( movie ) {
      Sessions_Movies.create( {
        movie_id: movie.id,
        session_id: sessionId
    }).then( function ( session_movie ) {
      res.json('MASSIVE SUCCESS!!!!!!!!',  session_movie );
    });
    });
  }

};
