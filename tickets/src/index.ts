import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/orders-cancelled-listeners';
import { OrderCreatedListener } from './events/listeners/orders-created-listeners';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY not defined');
    }

    if (!process.env.DB_URI) {
        throw new Error('DB_URI not defined');
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID not defined');
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL not defined');
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID not defined');
    }

    try {
        await mongoose.connect(process.env.DB_URI || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );

        natsWrapper.client.on('close', () => {
            console.log('NATS closed!');
            process.exit();
        });

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        app.listen(3000, () => {
            console.log('Listening on 3000...');
        });
    } catch(err) {
        console.error(err);
    }
}

start();