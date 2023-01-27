const bcrypt = require("bcryptjs");

//--------------//
//TEMPORARY DATABASE SYSTEM

//shortened URL storage
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "bU6Tx2",
  },
};

//Registered user storage
const passwordTest = "test";
const hashedPassword = bcrypt.hashSync(passwordTest, 10);

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "test@mail.com",
    password: hashedPassword,
  },
  bU6Tx2: {
    id: "bU6Tx2",
    email: "test2@mail.com",
    password: hashedPassword,
  },
};


module.exports = {
  urlDatabase,
  users,
};