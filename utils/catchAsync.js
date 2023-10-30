//the isea is to take the try catch block and put it in higher level in onther fuction and wrap the asynch function with that custom function
//and the catchAsync return an anonums func which will assignd to createTour as a result and this anonums funcwhich gets caaled by expresss whenever some one hits the route
//scince the passed func is an async fun so when express calls the anounoums reterned fun >which in return calls the passed asunc func > this passed fn returns a promis
//we pass the async fn to the HOF catchAsync which returns an anounums fuc that is assigned witout getting called to the "createTour" and then when express call the createTour it calls the returend anounemous func which calls the passed func which returns a promis then we can handel it
module.exports = (fn) => {
  return (req, res, next) => {
    //this is the function that express gonna call
    fn(req, res, next).catch((err) => next(err));
    //send the error after catching it to the errorController to handel it
  };
};
