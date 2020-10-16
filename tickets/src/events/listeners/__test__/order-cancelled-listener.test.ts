import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus, TicketCreatedEvent } from "@jljtickets/common";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../orders-cancelled-listeners";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'userId'
    });
    ticket.set({ orderId });

    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        version: 1,
        id: orderId,
        ticket: {
            id: ticket.id,
        },
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

it('sets the orderId undefined and emits event', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketsUpdatedData = JSON
        .parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketsUpdatedData.orderId).not.toBeDefined();
});