'use strict';

const express = require('express');
const tripsService = require('./trips-service');

const tripsRouter = express.Router();
const jsonBodyParser = express.json();

tripsRouter.route('/:user_id').get(async (req, res, next) => {
  try {
    const id = req.params.user_id;
    return await tripsService.getUserTrips(
      req.app.get('db'),
      id
    ).then((data) => {
      if (!data) {
        res.status(400).json({
          error: 'cannot find any existing trips',
        });
      }
      res.send(200, data);
    })
  } catch (error) {
    next(error);
  }
});

tripsRouter
  .route('/')
  .post(jsonBodyParser, async (req, res, next) => {
    console.log(req.body)
    try {
      const { origin, destination, waypoints, user_id } = req.body;
      const userPost = { origin, destination, waypoints, user_id };
      const newTrip = await tripsService.addUserTrip(
        req.app.get('db'),
        userPost
      );
      if (!newTrip) {
        res.status(400).json({
          error: 'cannot add new trip',
        });
      }

      res.status(200).json(newTrip);
    } catch (error) {
      next(error);
    }
  });

module.exports = tripsRouter;
