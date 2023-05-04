const weatherAPIKey = "afa769abcb584e5080a195837230305";
const clientId = 'ba3168bc03e94f21b9fa1e2678bca0a4';
const redirectUri = 'https://wallercullen.github.io/343-s23-p3/';


document.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    let codeVerifier = localStorage.getItem('code_verifier');

    let body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
    });

    const newResponse = fetch('https://acounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'applicatoin/x-www-form-urlencoded'
            },
            body: {
                grant_type: 'refresh_token',
                refresh_token: localStorage.getItem('refresh_token'),
                client_id: clientId
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('HTTP status ' + response.status);
            }
            return response.json();
        }).then(data => {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
        }).catch(error => {
            console.error('Error:', error);
        });

    const response = fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    })
    .catch(error => {
        console.error('Error:', error);
    });
};


const getWeather = (word) => {
    console.log("attempting to get weather for", word);
    return fetch(
        `https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${word}`
    ).then((resp) => resp.json());
};

async function searchPlaylist(query) {
    let accessToken = localStorage.getItem('access_token');

    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=playlist`, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    return data;
}

function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
  
    return base64encode(digest);
}

function LogInSpotify() {
    let codeVerifier = generateRandomString(128);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
        let state = generateRandomString(16);
        let scope = 'user-read-private user-read-email';

        localStorage.setItem('code_verifier', codeVerifier);

        let args = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge
        });

        window.location = 'https://accounts.spotify.com/authorize?' + args;
    });
}

const spotifyLogin = document.getElementById("spotify-login");
spotifyLogin.onclick = LogInSpotify;

const searchForm = document.getElementById("top-search");
searchForm.onsubmit = (ev) => {

    console.log("submitted top-search with", ev);
    ev.preventDefault();
    const formData = new FormData(ev.target);
    const queryText = formData.get("query");
    console.log("queryText", queryText);

    let weather = "";
    let time = "";
    const weatherResultsPromise = getWeather(queryText);
    weatherResultsPromise.then((weatherResults) => {
        console.log(weatherResults);
        weather = weatherResults['current']['condition']['text']
        time = weatherResults['current']['is_day'] ? "day" : "night";
        console.log(weather);
        console.log(time);
        
        let query = weather + " " + time;
        console.log(query);
        searchPlaylist(query).then(data => {
            console.log(data);
            const playlistCards = data.playlists.items.map(playlistToDOM);
            const playlistResults = document.getElementById('PlaylistResults');
            playlistCards.forEach(playlist => {
                playlistResults.appendChild(playlist);
            });
        });
    });
};

const playlistToDOM = (playlist) => {
    const container = document.createElement('div');
    container.classList.add('card');

    const head = document.createElement('div');
    head.classList.add('background')

    const image = document.createElement('img');
    image.src = playlist.images[0].url
    head.appendChild(image);

    const body = document.createElement('div');
    body.classList.add('card-body');

    const name = document.createElement('h5');
    name.textContent = playlist.name;
    body.appendChild(name);

    container.appendChild(head);
    container.appendChild(body);
    return container;
};
