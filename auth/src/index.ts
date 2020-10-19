import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY not defined');
    }

    if (!process.env.DB_URI) {
        throw new Error('DB_URI not defined');
    }

    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('connected to mongo');
    } catch(err) {
        console.error(err);
    }
}


app.listen(3000, () => {
    console.log('Listening on 3000...');
});

start();