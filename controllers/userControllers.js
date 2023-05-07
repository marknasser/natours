const fs = require('fs');
const users = JSON.parse(
  fs.readFileSync('${__dirname}/../dev-data/data/users.json', 'utf-8')
);

const getAllUsers = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

const createUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

const getUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

const updateUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

const deleteUser = (req, res) => {
  res
    .status(500) // means internal server error
    .json({ status: 'error', message: 'this route is not yet defined' });
};

module.exports = { getAllUsers, createUser, getUser, updateUser, deleteUser };
