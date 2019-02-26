const { Movie, validateMovie } = require("../models/movie");
const { Genre } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const moment = require("moment");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const validate = require('../middleware/validate');

router.get("/", async (req, res) => {
  const movies = await Movie.find().select("-__v").sort("name");
  res.send(movies);
});

router.post("/", [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre 1.");

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
    publishDate: moment().toJSON()
  });
  await movie.save();

  res.send(movie);
});

router.put("/:id", [auth, validateObjectId, validate(validateMovie)], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre 2.");

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    { new: true }
  );

  if (!movie)
    return res.status(404).send(" 11 The movie with the given ID was not found.");

  res.send(movie);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie)
    return res.status(404).send("22 The movie with the given ID was not found.");

  res.send(movie);
});

router.get("/:id", validateObjectId, async (req, res) => {
  console.log('validateObjectId  >>>>>>>>> ', validateObjectId)
  console.log('req >>>>>>>>', req)
  console.log('params >>>>>>>>', req.params)
  const movie = await Movie.findById(req.params.id).select("-__v");

  if (!movie)
    return res.status(404).send("333 The movie with the given ID was not found.");

  res.send(movie);
});

module.exports = router;
