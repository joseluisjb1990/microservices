import { TicketCreatedEvent } from "@jljtickets/common";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const data: TicketCreatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'my new concert',
        price: 999,
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

it('find, updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);

});

it('ack the message', async () => {
    const { data, listener, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
    const { data, listener, msg } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch(e) {
        expect(msg.ack).not.toHaveBeenCalled();
    }
});