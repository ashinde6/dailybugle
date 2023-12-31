const endpoint = {};
endpoint.verifyToken='http://localhost:8080/api/users/verifyToken';
endpoint.articles='http://localhost:8080/api/users/articles';
endpoint.getArticles = 'http://localhost:8080/api/users/getArticles'; 
endpoint.readerArticles = 'http://localhost:8080/api/users/readerArticles';  
endpoint.getAds = 'http://localhost:8080/api/users/getAds';
endpoint.getArticleId = 'http://localhost:8080/api/users/getArticleId';
endpoint.addComment = 'http://localhost:8080/api/users/addComment';
endpoint.getComments = 'http://localhost:8080/api/users/getComments';

const MAX_WIDTH = 320;
const MAX_HEIGHT = 180;

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
        document.getElementById('advertisements').style.display = 'inline-block';
        getAds();
        console.log("hi");
        loadReaderContent();
    } else {
        document.getElementById('signOutButton').style.display = 'inline-block';
        document.getElementById('profile-icon').style.display = 'inline-block';
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

async function loadAuthorContent() {
    document.getElementById('author-content').style.display = 'block';
    document.getElementById('advertisements').style.display = 'none';

    let authorID = "";
    const userToken = localStorage.getItem('jwtToken');

    try {
        const result = await verifyToken(userToken);
        authorID = result.userId;
    } catch(error) {
        console.error(error);
    }

    var response = await fetch(endpoint.getArticles, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authorId: authorID }),
    })
    .then(res => res.json())
    .then(documents => {
        displayArticles(documents, "articleList");
    });
}

function displayArticles(documents, list) {
    const articleList = document.getElementById(list);
    console.log(documents);

    Object.values(documents.documents).forEach(element => {
        const title = element.title;
        const content = element.content;
        const date = element.date;
        const image = element.image;

        console.log(image);
        
        let list = document.createElement('ul');

        if (image) {
            let img = document.createElement('img');
            img.src = image;
            img.alt = "Article Image";
    
            list.append(img);
            list.append(document.createElement('br'));
            list.append(document.createElement('br'));
        }
        
        let span=document.createElement('span');

        span.innerHTML = title;
        span.style = "font-weight:bold";
        list.append(span);
        list.append(document.createElement('br'));
        list.append(document.createElement('br'));

        let cont = document.createElement('span');
        cont.innerHTML = content;
        list.append(cont);
        list.append(document.createElement('br'));
        list.append(document.createElement('br'));

        let d = document.createElement('span');
        d.innerHTML = date.toLocaleString();
        list.append(date);
        list.append(document.createElement('br'));
        list.append(document.createElement('br'));
        
        const userToken = localStorage.getItem('jwtToken');

        if (userToken) {
            let button = document.createElement('button');
            button.onclick = function() {
                handleComments(title);
            };
            button.innerHTML = "Add/View Comments";
            button.style.backgroundColor = "#4c74af";
            button.style.color = "white";
            button.style.textDecoration = "none";
            button.style.border = "none";
            button.style.cursor = "pointer";
            button.style.padding = "8px 12px";

            list.append(button);
        }

        list.append(document.createElement('br'));
        list.append(document.createElement('br'));

        list.append(document.createElement('hr'));        

        list.append(document.createElement('br'));

        
        articleList.appendChild(list);
    });
}

async function handleComments(title) {
    document.getElementById('comments').style.display = 'block';
    document.getElementById('commentsTitle').innerHTML = title + " Comments";
    document.getElementById('commentInput').value = "";
    document.getElementById('submitComment').onclick = function() {
        submitComment(title);
    }
    getComments(title);
}

async function getComments(title) {
    let articleId = "";

    var response = await fetch(endpoint.getArticleId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title }),
    })
    .then(res => res.json())
    .then(id => {
        articleId = id;
    });

    var comments = await fetch(endpoint.getComments, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId: articleId }),
    })
    .then(res => res.json())
    .then(comments => {
        displayComments(comments);
    });
}

function displayComments(comments) {
    console.log(comments);
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = "";

    Object.values(comments.comments).forEach(comment => {
        const content = comment.comment;
        const user = comment.commentorName;
        const date = comment.date;

        let list = document.createElement('ul');
        let span=document.createElement('span');

        span.innerHTML = user;
        span.style = "font-weight:bold";
        list.append(span);

        list.append(document.createElement('br'));

        let d = document.createElement('span');
        d.innerHTML = date.toLocaleString();
        list.append(date);

        list.append(document.createElement('br'));
        list.append(document.createElement('br'));

        let cont = document.createElement('span');
        cont.innerHTML = content;
        list.append(cont);
        list.append(document.createElement('br'));
        list.append(document.createElement('br'));

        list.append(document.createElement('hr'));

        commentsList.appendChild(list);

    })
    
}

async function submitComment(title) {
    const userToken = localStorage.getItem('jwtToken');

    let commentorId = "";
    let commentorName = "";
    let articleId = "";

    try {
        const result = await verifyToken(userToken);
        commentorId = result.userId;
        commentorName = result.username;
    } catch(error) {
        console.error(error);
    }

    var response = await fetch(endpoint.getArticleId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title }),
    })
    .then(res => res.json())
    .then(id => {
        articleId = id;
    });

    const comment = document.getElementById('commentInput').value;

    const date = new Date();

    var submit = await fetch(endpoint.addComment, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment, article: articleId, commentorId: commentorId, commentorName: commentorName, date: date })
    });

    closeCommentsModal();
}


function closeCommentsModal() {
    document.getElementById('comments').style.display = 'none';
    location.reload();
}

function openAddArticleModal() {
    document.getElementById('addArticleModal').style.display = 'block';
}

function closeAddArticleModal() {
    document.getElementById('addArticleModal').style.display = 'none';
    location.reload();
}

async function addArticle() {
    let title = document.getElementById('articleTitle').value;
    let content = document.getElementById('articleContent').value;

    const inputImage = document.getElementById('articleImage');
    const uploadedImage = inputImage.files[0];
    let imageData = "";

    if (uploadedImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imageData = e.target.result;
        };

        // Read the content of the uploaded image
        reader.readAsDataURL(uploadedImage);
    }

    const date = new Date();
    
    let authorID = "";
    const userToken = localStorage.getItem('jwtToken');

    try {
        const result = await verifyToken(userToken);
        authorID = result.userId;
    } catch(error) {
        console.error(error);
    }

    var response = await fetch(endpoint.articles, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title, content: content, image: imageData, date: date, authorId: authorID }),
    });

    closeAddArticleModal();
}

function loadReaderContent() {
    document.getElementById('reader-content').style.display = 'block';
    loadArticles();
}


async function loadArticles() {
    var response = await fetch(endpoint.readerArticles, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: "get Articles" })
    })
    .then(res => res.json())
    .then(documents => {
        displayArticles(documents, "articleReaderList");
    });
}


function signout() {
    localStorage.removeItem('jwtToken');
    location.reload();
}

async function getAds() {
    const randomAd = fakeAds[Math.floor(Math.random() * fakeAds.length)];
    const randomAd2 = fakeAds[Math.floor(Math.random() * fakeAds.length)];
    const randomAd3 = fakeAds[Math.floor(Math.random() * fakeAds.length)];
    const randomAd4 = fakeAds[Math.floor(Math.random() * fakeAds.length)];
    const randomAd5 = fakeAds[Math.floor(Math.random() * fakeAds.length)];
    const adContainer = document.getElementById('advertisements');
    adContainer.innerHTML = `<img src="${randomAd.imageUrl}" alt="${randomAd.content}" onclick="handleClick()"><img src="${randomAd2.imageUrl}" alt="${randomAd2.content}" onclick="handleClick()"><img src="${randomAd3.imageUrl}" alt="${randomAd3.content}" onclick="handleClick()"><img src="${randomAd4.imageUrl}" alt="${randomAd4.content}" onclick="handleClick()"><img src="${randomAd5.imageUrl}" alt="${randomAd5.content}" onclick="handleClick()">`;

    try {
        var response = await fetch(endpoint.getAds, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ request: 'viewer' }),
        });
    } catch(error) {
        console.error(error);
    }
}

async function handleClick() {
    try {
        var response = await fetch(endpoint.getAds, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ request: 'interactor' }),
        });
    } catch(error) {
        console.error(error);
    }
}

const fakeAds = [
    { id: 1, content: 'Burger', imageUrl: 'burger.jpg' },
    { id: 2, content: 'Car', imageUrl: 'car.jpg' },
    { id: 2, content: 'Lotion', imageUrl: 'lotion.jpg' },
    { id: 2, content: 'Furniture', imageUrl: 'furniture.jpg' },
    { id: 2, content: 'Water', imageUrl: 'water.jpg' },
    { id: 2, content: 'Snickers Ice Cream', imageUrl: 'snickers.jpg' },
    { id: 2, content: 'House', imageUrl: 'house.jpg' },
    { id: 2, content: 'Heinz', imageUrl: 'ketchup.jpg' },
    { id: 2, content: 'Nacho Fries', imageUrl: 'fries.jpg' },
    { id: 2, content: 'Coca-Cola', imageUrl: 'cocacola.jpg' },
    // Add more fake ads as needed
];
