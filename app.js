require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT,
  clientSecret: process.env.SPOTIFY_SECRET,
});

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
spotify
  .clientCredentialsGrant()
  .then((data) => spotify.setAccessToken(data.body['access_token']))
  .catch((error) =>
    console.log('Something went wrong when retrieving an access token', error)
  );

// Our routes go here:
app.get('/', (request, response) => {
  spotify
    .getNewReleases({
      country: 'PT',
      limit: 8,
      offset: 0,
    })
    .then(
      function (data) {
        categoryResults = data.body.albums.items;
        console.log(data.body);
        response.render('index', { categoryResults });
      },
      function (err) {
        console.log('Something went wrong!', err);
      }
    );
});

app.get('/artist-search', (request, response) => {
  searchValue = request.query.term;
  spotify.searchArtists(searchValue).then((data) => {
    artistResults = data.body.artists.items;
    console.log(data.body);
    response.render('artist-search', { artistResults });
  });
});

app.get('/albums/:id', (request, response) => {
  artistID = request.params.id;
  spotify
    .getArtistAlbums(artistID, {
      limit: 50,
    })
    .then((data) => {
      albumResults = data.body.items;
      response.render('albums', { albumResults });
    })
    .catch((error) => {
      console.log('There was an error showing artist albums ', error);
    });
});

app.get('/album/:id', (request, response) => {
  albumID = request.params.id;
  spotify
    .getAlbumTracks(albumID)
    .then((data) => {
      trackResults = data.body.items;
      response.render('album', { trackResults });
    })
    .catch((error) => {
      console.log('There was an error showing album tracks ', error);
    });
});

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊')
);
