import express from 'express';

require('express-async-errors');

import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@jljtickets/common';
import cookieSession from 'cookie-session';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes';

const app = express();
app.set('trust proxy', true);

app.use(json());

app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
);

app.use(currentUser);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
