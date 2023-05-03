const weatherAPIKey = "afa769abcb584e5080a195837230305";

const getWeather = (word) => {
    console.log("attempting to get weather for", word);
    return fetch(
        `https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${word}`
    ).then((resp) => resp.json());
};


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

const clientId = 'ba3168bc03e94f21b9fa1e2678bca0a4';
const redirectUri = 'https://wallercullen.github.io/343-s23-p3/';

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

    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');

    codeVerifier = localStorage.getItem('code_verifier');

    let body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
    });
}

const spotifyLogin = document.getElementById("spotify-login");
spotifyLogin.onsubmit = LogInSpotify;

const searchForm = document.getElementById("top-search");
searchForm.onsubmit = (ev) => {

    console.log("submitted top-search with", ev);
    ev.preventDefault();
    const formData = new FormData(ev.target);
    const queryText = formData.get("query");
    console.log("queryText", queryText);

    let weather = "";
    let is_day = false;
    const weatherResultsPromise = getWeather(queryText);
    weatherResultsPromise.then((weatherResults) => {
        console.log(weatherResults);
        weather = weatherResults['current']['condition']['text']
        is_day = weatherResults['current']['is_day'];
        console.log(weather);
        console.log(is_day ? "day" : "night")
    });
};
