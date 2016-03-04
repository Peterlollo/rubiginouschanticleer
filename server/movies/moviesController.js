var Movies = require( './movies' );
var Sessions_Movies = require ('../sessions_movies/sessions_movies');
var env = require('../env/env.js');
var api_key = env.api_key;
var searchUrl = 'http://api.themoviedb.org/3/search/movie';
var request = require('request');

module.exports = {

  getAllMovies: function() {
    Movies.getAllMovies();
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

  getSearchResults: function (req, res, next) {
    var query = req.body.query;
    var options = {
      method: 'GET',
      url: 'http://api.themoviedb.org/3/search/movie',
      qs:
        {
          api_key: 'c062102bb9e2f7a7ab5d2a0f7fb7f2d0',
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
     console.log(body);
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
