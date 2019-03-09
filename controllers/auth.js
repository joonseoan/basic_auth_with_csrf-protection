/* 

    AuthFlow
    
  // 1) Signup...: just store the user

  // 2) login: just match the username and password
  //  then provides cookie

  // 3) First isAuthenticated is used in navigation.ejs
  //  to bolock for the unauthorized user to button-clcik

  // 4) It bocks user to use this url by entering url
  //  localhost:3000/admin/add-product.
  // if(!req.session.isAuthenticated) {
  //   return res.redirect('/login');
  // }


*/


const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {

  //  // Please notice the default value req.flash('error) is [], not null.
  // storing message
  let message = req.flash('error');
  message = message.length === 0 ? null : message[0];

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',

    // **********************************
    // After the message shows up in the getLogin route,
    //  it will be automatically and immediately removed!!!!!!!
    // so that any other new request will not have this error message.!!!!
    
    // It is not working when it has an error becuse,
    // when req.flash('error') works at once in req.flash('error').length
    //  the value is immediately removed!!! Therefore, we need to use variable
    // like the one above.!!! 
    errorMessage: message
    //isAuthenticated: false,
    // csrfToken: req.csrfToken()
  });
};

exports.getSignup = (req, res, next) => {

    let message = req.flash('error');
    message = message.length === 0 ? null : message[0];

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
   // isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {

    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {

            // when failed to find the user
            if(!user) { 

                // must be spoted above res.redirect.
                // when failed to login, we need to send error message
                //  to the next req which is "res.redirect('/login)"
                // then in the "getLogin" route, we need to show the message
                req.flash('error', 'Invalid email');
                return res.redirect('/login'); 
            }

            


            // when bcrypt itself has a return!!!
            bcrypt.compare(password, user.password)
            // isMatched : boolean
                .then(isMatched => {
                    // ************ here we can initilize session!!!!!
                    if(isMatched) { 

                        req.session.isAuthenticated = true;
                        req.session.user = user;
                        // must use save(err => {}) format that is a callback
                        //  defined in req.session (express-session)!!!!
                        return req.session.save(err => {
                            res.redirect('/');
                        });
                    
                    }
                    // must be spotted res.redirect
                    req.flash('error', 'Invalid password');

                    // isMatched === false
                    res.redirect('/login');
                    
                })
                .catch(e => { 
                    // we can setup redirect in catch block.
                    res.redirect('/login');
                    throw new Error('Unable to find the password.');
                });
            
        })

};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    User.findOne({ email })
        .then(user => {

            // must return here to stop.
            // Even with res, it does not stop the function.

            /* 
                [res vs return at stackoverflow]
                The return keyword returns from your function, 
                thus ending its execution. This means that 
                any lines of code after it will not be executed.

                In some circumstances, you may want to use res.send 
                and then do other stuff.

                In quencequence, 'return' returns value 
                and stops the function itself 
                regardless of function types

                res.send()/rediret()  and etc: just stops 'app' related role!!! !!!!
                after 'res' we cannot use any app related function like res...something.
            */


            // Therefore
            if(user) {
                // must be spotted at upperline of res.redirect
                req.flash('error', 'Email exists arleady.');
                return res.redirect('/signup');
            }
            
            // th higher higher is the more secure.
            // bcrypt: async...
            // bcrypt has promise...therefore...no return....
            bcrypt.hash(password, 12)
                .then(hashedPassword => {

                    const newUser = new User({
                        email,
                        password: hashedPassword,
                        // must define basic frame.
                        // (no like this "cart: null")
                        // It would be easier!
                        cart: { items: [] }
                    });
        
                    return newUser.save();
        
                })
                .then(() => {
                    // when signup is done the user should be redirected to home.
                    res.redirect('/login');
                })
                .catch(e => {
                    throw new Error('The email already exists.');
                });

        })
        //**********************************************important */
        // In this case, "if(user) return res.redirect('/signup');"
        //      is a still return. 
        // In result, hashpasword value will be res.direct('/singup).
        // Therefore error generated.

        // .then(hashedPassword => {

        //     const newUser = new User({
        //         email,
        //         password: hashedPassword,
        //         // must define basic frame.
        //         // (no like this "cart: null")
        //         // It would be easier!
        //         cart: { items: [] }
        //     });

        //     return newUser.save();

        // })
        // .then(() => {
        //     // when signup is done the user should be redirected to home.
        //     res.redirect('/login');
        // })
        // .catch(e => {
        //     throw new Error('The email already exists.');
        // });
        
        
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
