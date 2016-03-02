var Sequelize = require( 'sequelize' );
var db = new Sequelize( 'moviematch', null, null, {
  dialect: 'sqlite',

  define: {
    underscored: true
  },

  // storage: './server/config/moviematch.sqlite'
  storage: 'mysql://b913c42b4a5a8a:afcebcf3@us-cdbr-iron-east-03.cleardb.net/heroku_646b04b1daeb208?reconnect=true'
});

module.exports = db;
