// _________________Element_________________
console.log('sadasdasdasd');
const updatingForm = document.querySelector('.form-user-data');
const updatingPassword = document.querySelector('.form-user-password');
// _________________Functions_________________

const hideAlert2 = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert2 = (type, msg) => {
  hideAlert2();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert2, 5000);
};

//--------------update user data by user(name,email,password) ----------------------
const updateSettings = async (data, type) => {
  console.log(data);
  //TYPE is either password or data
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    //------for multi part form data we dont need to specify (headers--> content type)
    if (type === 'data') {
      var res = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: data ? { 'Content-Type': 'application/json' } : {},
      });
    } else if (type === 'password') {
      var res = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: data ? { 'Content-Type': 'application/json' } : {},
      });
    }
    // console.log(res);
    const respond = await res.json();
    //to reload page
    if (respond.status === 'success') {
      showAlert2('success', `${type.toUpperCase()} updated successfully`);
    } else {
      showAlert2('error', `incorect ${type} format`);
    }
  } catch (err) {
    //fetch only catch network error so we must throw error to define any other errors
    console.log(err);
    showAlert2('error', err.data);
  }
};

// _________________LISTENERS_________________

if (updatingForm)
  updatingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    // const form = new FormData();
    // form.append('name', document.getElementById('name').value);
    // form.append('email', document.getElementById('email').value);
    // form.append('photo', document.getElementById('photo').files[0]);
    //IMP AT multi-part form data at fetch we dont need to specify data content-type  we make body:data only (IMP)-->So we don't need to specify 'content-type' when we send a fetch request.
    // console.log(form);
    updateSettings({ name, email }, 'data');
  });

if (updatingPassword)
  updatingPassword.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating.....';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    console.log('currentPassword', currentPassword);

    const data = { currentPassword, password, passwordConfirm };
    await updateSettings(data, 'password');

    //--------delete password after changed from tab in website-----------------
    //1)await update settings

    document.querySelector('.btn--save-password').textContent = 'save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
//.form-user-settings the class in account.pug
//submit -->event that the browser will fire off whenever the user clicks on the submit button on the form
