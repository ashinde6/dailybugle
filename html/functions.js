const endpoint = {};
endpoint.verifyToken='http://localhost:8080/api/users/verifyToken';
endpoint.articles='http://localhost:8080/api/users/articles';

async function verifyToken(token) {
    const response = await fetch(endpoint.verifyToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
};

async function initPage() {
    const userToken = localStorage.getItem('jwtToken');

    // Show the login button only if no user token is stored
    if (!userToken) {
        document.getElementById('login-button').style.display = 'inline-block';
    } else {
        document.getElementById('signOutButton').style.display = 'inline-block';
        document.getElementById('name').style.display = 'inline-block';
        try {
            const result = await verifyToken(userToken);
            document.getElementById('name').innerHTML = result.username;

            if (result.role === 'Author') {
                loadAuthorContent();
            } else if (result.role === 'Reader') {
                loadReaderContent();
            }
        } catch(error) {
            console.error(error);
        }
        
    }
}

function loadAuthorContent() {
    document.getElementById('author-content').style.display = 'block';

}

function loadReaderContent() {
    document.getElementById('reader-content').style.display = 'block';
}

function signout() {
    localStorage.removeItem('jwtToken');
    location.reload();
}