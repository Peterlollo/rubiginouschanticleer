var Sequelize = require( 'sequelize' );

var db = require( '../config/db' );
var helpers = require( '../config/helpers' );
var Session_User = require( '../sessions_users/sessions_users' );


var Vote = db.define( 'votes', {
  session_user_id: {
    type: Sequelize.INTEGER,
    unique: 'su_movie_idx'
  },
  movie_id: {
    type: Sequelize.INTEGER,
    unique: 'su_movie_idx'
  },
  vote: Sequelize.BOOLEAN,
  sessionId: Sequelize.INTEGER,
  dbId: Sequelize.INTEGER
} );

Vote.sync().then( function() {
  console.log( "votes table created" );
} )
.catch( function( err ) {
  console.error( err );
} );

Vote.belongsTo( Session_User, {foreignKey: 'session_user_id'} );

Vote.addVote = function( sessionUser, movie, vote, sessionId, dbId ) {
  return Vote.create( { session_user_id: sessionUser, movie_id: movie, vote: vote, sessionId: sessionId, dbId: dbId } )
    .catch( function( err ) {
      console.error( err.stack );
    });
};

Vote.getSessMovieVotes = function( sessionId, movieId ) {
  // expect this function to return a promise
  // Should query the database and resolve as an array of
  // objects where each object represents a row
  // for the particular session and movie
  // The Votes table has a session_user_id not a session_id, so we have to do an inner join...
  return Vote.findAll( { where: { movie_id: movieId }, include: { model: Session_User, attributes: [], where: { session_id: sessionId } } } )
  .catch( function( err ) {
    console.error( err.stack );
  });
};

Vote.getMostVotes = function (sessionId) {
  return Vote.find( {where: {}})
};


module.exports = Vote;
