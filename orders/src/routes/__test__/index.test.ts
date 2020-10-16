import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderDoc } from '../../models/order';
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

it('fetches orders for a particular user', async () => {
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();
    const ticket3 = await buildTicket();

    const user1 = global.signin();
    const user2 = global.signin();

    await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket1.id })
        .expect(201);

    const { body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket2.id })
        .expect(201);

        const { body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket3.id })
        .expect(201);

    
    const { body: ordersUser2 } = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200);

    const { body: ordersUser1 } = await request(app)
        .get('/api/orders')
        .set('Cookie', user1)
        .expect(200);

    expect(ordersUser2.length).toEqual(2);
    expect(ordersUser1.length).toEqual(1);

    expect(ordersUser2.find((order: OrderDoc) => order.id === order1.id)).toBeDefined();
    expect(ordersUser2.find((order: OrderDoc) => order.id === order2.id)).toBeDefined();
    expect(ordersUser1.find((order: OrderDoc) => order.id === order2.id)).not.toBeDefined();
    

});
