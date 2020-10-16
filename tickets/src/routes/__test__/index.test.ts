import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title,
        price
    });

}

it('can fetch a list of tickets', async () => {
    const title1 = 'concert';
    const price1 = 20;

    await createTicket(title1, price1);
    const title2 = 'event';
    const price2 = 30;

    await createTicket(title2, price2);

    const title3 = 'event 2';
    const price3 = 40;

    await createTicket(title3, price3);

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
});

it('returns the ticket if the ticket is found', async () => {
    const title = 'concert';
    const price = 20;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price
        })
        .expect(201);

    const { body: { id } } = response;

    const ticketResponse = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});
