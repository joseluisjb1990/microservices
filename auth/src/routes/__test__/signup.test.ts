import request from 'supertest';
import { app } from '../../app';

it('return a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)
});

it ('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'testtest.com',
            password: 'password'
        })
        .expect(400)
});

it ('returns a 400 with a too short password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'p'
        })
        .expect(400)
});

it ('returns a 400 with a too long password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'paksgdkahdkahdkahgdkahgdfkhagdfkahsdgfkh'
        })
        .expect(400)
});

it ('returns a 400 with empty body', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({})
        .expect(400)
});

it ('returns a 400 with an empty email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'password'
        })
        .expect(400)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: '',
            password: 'password'
        })
        .expect(400)
});

it ('returns a 400 with empty pasword', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'email@email.com'
        })
        .expect(400)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'email@email.com',
            password: ''
        })
        .expect(400)
});

it ('dissalows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'email@email.com',
            password: 'password'
        })
        .expect(201)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'email@email.com',
            password: ''
        })
        .expect(400)
});

it('sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)


    expect(response.get('Set-Cookie')).toBeDefined();
});