import { OrderExpiredEvent, OrderStatus, TicketCreatedEvent } from "@jljtickets/common";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderExpiredListener } from "../order-expired-listener";
import { TicketCreatedListener } from "../ticket-created-listener"

const setup = async () => {
    const listener = new OrderExpiredListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        ticket
    });

    await order.save();

    const data: OrderExpiredEvent['data'] = {
        id: order.id
    };


    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {
        listener,
        data,
        msg,
        order,
        ticket
    }
}

it('updates the order status to cancelled', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});


it('emit an order cancelled event', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
    const { data, listener, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});