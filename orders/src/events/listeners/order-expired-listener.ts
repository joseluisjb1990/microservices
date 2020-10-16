import { Listener, OrderExpiredEvent, OrderStatus, Subjects, TicketCreatedEvent } from "@jljtickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderExpiredListener extends Listener<OrderExpiredEvent> {
    readonly subject = Subjects.OrderExpired;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderExpiredEvent['data'], msg: Message) {
        const { id } = data;
        const order = await Order
            .findById(id)
            .populate('ticket');

        if (!order) {
            throw new Error(`Order with id ${id} not found`);
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
        });
        await order.save();

        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        msg.ack();
    }
}