// _________________ELEMENTS_________________
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.form--signup');

// _________________FUNCTIONS_________________

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const login = async (email, password) => {
  const data = {
    email: email,
    password: password,
  };
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: data ? { 'Content-Type': 'application/json' } : {},
      body: JSON.stringify(data), //because the value in the body most be in json format (app.use(express.json())only parse json format)
    });

    const response = await res.json();
    // console.log(response.status);
    if (response.status === 'success') {
      showAlert('success', 'You are Logged In successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', ' incorrect email or password');
    }
  } catch (err) {
    showAlert('error', err.data);
  }
};

const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout');
    const response = await res.json();
    console.log(response);
    if (response.status === 'success') {
      showAlert('success', 'You are LOGOUT successfully!');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', 'Error Logging out! try again.');
  }
};

const signUp = async (name, email, password, confirmPassword) => {
  const data = {
    name,
    email,
    password,
    passwordConfirm: confirmPassword,
  };
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: data ? { 'Content-Type': 'application/json' } : {},
    });
    if (res.status === 201) {
      showAlert('success', 'please check your email!');
    } else {
      showAlert('error', ' incorrect email or password');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.data);
  }
};

// _________________LISTENERS_________________

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('passwordConfirm').value;

    signUp(name, email, password, confirmPassword);
  });
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

//.nav__el--logout the class in login.pug
//submit -->event that the browser will fire off whenever the user clicks on the submit button on the form

//.form--login the class in login.pug
//submit -->event that the browser will fire off whenever the user clicks on the submit button on the form

//.form--login the class in login.pug
//submit -->event that the browser will fire off whenever the user clicks on the submit button on the form
