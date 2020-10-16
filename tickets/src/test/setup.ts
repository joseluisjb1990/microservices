import { JWTGenerator } from '@jljtickets/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[]
        }
    }
}

jest.mock('../nats-wrapper');

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

global.signin = () => {
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
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