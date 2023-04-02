const express = require("./node_modules/express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "/moviesData.db");
let db = null;

async function databaseConnection() {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started running on port 3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}

databaseConnection();

const camecaseConversionMovie = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

function camecaseConversionDirector(object) {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
}

function forFirstApi(object) {
  return {
    movieName: object.movie_name,
  };
}

//first api
app.get("/movies/", async (req, res) => {
  const bringAllMoviesQuery = `SELECT movie_name FROM movie`;
  const movieNameList = await db.all(bringAllMoviesQuery);
  const newMovieNameList = [];
  for (let each of movieNameList) {
    let temp = forFirstApi(each);
    newMovieNameList.push(temp);
  }
  res.send(newMovieNameList);
});

//second api

app.post("/movies/", async (req, res) => {
  const newMovie = req.body;
  const { directorId, movieName, leadActor } = newMovie;
  const addNewMovieQuery = `INSERT INTO movie(director_id, movie_name, lead_actor)
VALUES
('${directorId}', '${movieName}', '${leadActor}');`;
  await db.run(addNewMovieQuery);
  res.send("Movie Successfully Added");
});

//third api

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const bringSpecificMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const specificMovie = await db.get(bringSpecificMovieQuery);
  console.log(specificMovie);
  let temp = camecaseConversionMovie(specificMovie);
  res.send(temp);
});

//fourth api

app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const UpdationDetails = req.body;
  const { directorId, movieName, leadActor } = UpdationDetails;
  const udationQuery = `UPDATE movie
SET director_id = '${directorId}', movie_name = '${movieName}', lead_actor = '${leadActor}'
WHERE movie_id = ${movieId};`;
  await db.run(udationQuery);
  res.send("Movie Details Updated");
});

//fifth api

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deletionQuery = `DELETE FROM movie
WHERE movie_id = ${movieId};`;
  await db.run(deletionQuery);
  res.send("Movie Removed");
});

//sixth api

app.get("/directors/", async (req, res) => {
  const bringAllDirectors = `SELECT * FROM director;`;
  const directorsList = await db.all(bringAllDirectors);
  const newDirectorLIst = [];
  for (let each of directorsList) {
    let temp = camecaseConversionDirector(each);
    newDirectorLIst.push(temp);
  }
  res.send(newDirectorLIst);
});

//seventh api

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const bringSpecifiedMovies = `SELECT * FROM movie WHERE director_id = 
    ${directorId}`;
  const moviesList = await db.all(bringSpecifiedMovies);
  const newMoviesList = [];
  for (let each of moviesList) {
    let temp = forFirstApi(each);
    newMoviesList.push(temp);
  }
  res.send(newMoviesList);
});

module.exports = app;
