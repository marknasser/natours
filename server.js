// it's a good practice to have all the files related to express together in one file and everything related to server in anther main file to be the start point
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // we have to define it before importing the app
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
console.log(DB);
mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    // console.log('DB connection successful');
  });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  // a function will be called when the server start listing
  console.log(`App running on port ${port}...`);
});

/*Environment Variables : are global variables that are used to define the environment in which a node app is running
some of them are set by express but node itself sets a lot of environments 
-in express many packages depend on a special variable called NODE-ENV it's kind of convention to define whether we're in development or in production mode and we have to define it manually 
"NODE_ENV=development nodemon server.js" or forWindows use Powershell as the default shell, so use:$env:NODE_ENV="production" 
and as a convention we could create 'config.env' file to set our environment variables And we use a package called "dotenv" to make node reading the file to the node process and it only needs to happen once in only one file
   
-w usually use our Environment variables as a configuration settings for our app
for ex: we might use different databases for development and for testing so we could define one variable for each and then activate the right database according to the environment 
*/

// console.log(app.get('env')); // the environment of app
//console.log(process.env); // node use most of these environment variables internally   for ex node.js use NODE_ENV=development for determine that it's development or production environment but i have to manually use it

/*
//a new Document out of a Tour Modal
//is an instance document of a tour model and it has method ..
//.save()  >> save ot in the tours collection in the database
const testTour = new Tour({
  name: 'The Park Camper',
  price: 997,
});

testTour
  .save()
  .then((document) => {
    console.log(document);
  })
  .catch((err) => console.log('ERROR___}', err.message)); // to save the document to the tours collections in DB and it returns a promise where we can get the concrete document back as it's in the db 
  */
