import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus, TicketCreatedEvent } from "@jljtickets/common";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../orders-created-listeners";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'userId'
    });

    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: 'en quince minutos',
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        userId: new mongoose.Types.ObjectId().toHexString()
    };


    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {
        listener,
        data,
        msg,
        ticket
    }
}

it('sets the orderId of the ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toBeDefined();

});

it('ack the message', async () => {
    const { data, listener, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { data, listener, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketsUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketsUpdatedData.orderId);
});