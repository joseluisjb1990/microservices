import { JWTGenerator } from '@jljtickets/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
    namespace NodeJS {
        interface Global {
            signin(id?: string): string[]
        }
    }
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51H4UDsIWLJSYor1cWVLlj0QLsnahJSVI0CnmCBeJKNIj2ZYqHWfbsJ76OGjYzqyQcIyeWqhGbVHMyYQ9Ysd2QFK600acge7XC8';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'uyquesecretoestetest'
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }

    jest.clearAllMocks();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
})

global.signin = (id?: string) => {
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    const token = JWTGenerator.generate(payload);
    const session = {
        jwt: token
    };

    const sessionJSON = JSON.stringify(session);

    const base64 =  Buffer.from(sessionJSON).toString('base64');

    return [`express:sess=${base64}`];
}