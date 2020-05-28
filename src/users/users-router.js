'use strict';

const express = require('express');
const path = require('path');
const usersService = require('./users-service');



const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { password, username, email } = req.body;

    for (const field of ['username', 'email', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `${field} missing in request body`
        });

    try {
      const passwordError = await usersService.validatePassword(password);
      if (passwordError)
        return res.status(400).json({ error: passwordError });

      const hasUserWithUserName = await usersService.checkUsers(
        req.app.get('db'),
        username
      );

      //   const emailError = await usersService.validateEmail(email);
        
      //   if(emailError)
      //     return res.status(400).json(emailError);

      if (hasUserWithUserName)
        return res.status(400).json({ error: 'existing user already has that username' });

      const hashedPassword = await  usersService.hashPassword(password);

      const newUser = {
        username,
        password: hashedPassword,
        email,
      };

      //   const hasUserWithEmail = await usersService.validateEmail(email);

      const user = await usersService.insertUser(
        req.app.get('db'),
        newUser
      );

      res.status(201)
        .location(path.posix.join(req.originalUrl, `/${user}`))
        .json(usersService.sanitizeUser(user));
    } catch(error) {
      next(error);
    }
  });   

module.exports = usersRouter;