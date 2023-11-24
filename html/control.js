// front end JS for voter app
const endpoint = {};
endpoint.login='http://localhost:8080/api/users/login';
endpoint.register='http://localhost:8080/api/users/register';

document.addEventListener('DOMContentLoaded', function () {
    var loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevents the default form submission

        // Call your login method here
        login_attempt();
    });

    async function login_attempt() {
        document.getElementById('invalid_user').style.display = 'none';
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
    
        const response = await fetch(endpoint.login, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password }),
        });
        
        var status = response.status;

        if (status === 401) {
            document.getElementById('invalid_user').innerHTML = "Invalid username or password, please try again";
            document.getElementById('invalid_user').style.display = 'block';
        }
    }
});


document.addEventListener('DOMContentLoaded', function () {
    var registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevents the default form submission

        // Call your login method here
        register();
    });

    async function register() {
        document.getElementById('invalid_user').style.display = 'none';
        let email = document.getElementById('email').value;
        let username = document.getElementById('user').value;
        let password = document.getElementById('pass').value;
        let role = document.getElementById('role');
        let selectedRole = role.options[role.selectedIndex].text;

        var response = await fetch(endpoint.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, username: username, password: password, role: selectedRole }),
        });
        var status = response.status;

        if (status === 400) {
            document.getElementById('invalid_user').innerHTML = "User is already registered, please login";
            document.getElementById('invalid_user').style.display = 'block';
        }
    }
})
function createAccount() {
    document.getElementById('invalid_user').style.display = 'none';
    var login = document.getElementById('loginForm');
    var register = document.getElementById('registerForm');

    if (login.style.display !== 'none') {
        login.style.display = 'none';
        register.style.display = 'block';
      } else {
        login.style.display = 'block';
        register.style.display = 'none';
      }
}

function redirectToLogin() {
    // Redirect to the login page
    window.location.href = 'bugle.html';
}

