var DataTypes = require("sequelize").DataTypes;
var _book = require("./book");
var _book_has_user = require("./book_has_user");
var _category = require("./category");
var _rol = require("./rol");
var _user = require("./user");

function initModels(sequelize) {
  var book = _book(sequelize, DataTypes);
  var book_has_user = _book_has_user(sequelize, DataTypes);
  var category = _category(sequelize, DataTypes);
  var rol = _rol(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  book_has_user.belongsTo(book, { as: "book", foreignKey: "book_id"});
  book.hasMany(book_has_user, { as: "book_has_users", foreignKey: "book_id"});
  book.belongsTo(category, { as: "category", foreignKey: "category_id"});
  category.hasMany(book, { as: "books", foreignKey: "category_id"});
  user.belongsTo(rol, { as: "rol", foreignKey: "rol_id"});
  rol.hasMany(user, { as: "users", foreignKey: "rol_id"});
  book_has_user.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(book_has_user, { as: "book_has_users", foreignKey: "user_id"});

  return {
    book,
    book_has_user,
    category,
    rol,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
