import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();
    return ticket;
}

it('fetches an order', async () => {
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();

    const user1 = global.signin();
    const user2 = global.signin();

    const { body: orderCreated1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket1.id })
        .expect(201);

    const { body: orderCreated2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket2.id })
        .expect(201);


    const { body: order } = await request(app)
        .get(`/api/orders/${orderCreated1.id}`)
        .set('Cookie', user1)
        .expect(200);

    await request(app)
        .get(`/api/orders/${orderCreated1.id}`)
        .set('Cookie', user2)
        .expect(404);

    await request(app)
        .get(`/api/orders/${orderCreated2.id}`)
        .set('Cookie', user2)
        .expect(200);


    await request(app)
        .get(`/api/orders/${orderCreated2.id}`)
        .set('Cookie', user1)
        .expect(404);

    expect(order).toBeDefined();
});
