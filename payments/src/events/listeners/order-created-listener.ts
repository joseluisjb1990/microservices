import { Listener, OrderCreatedEvent, Subjects } from "@jljtickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage({ id, status, version, userId, ticket: { price } }: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id,
            status,
            version,
            userId,
            price
        });

        await order.save();

        msg.ack();
    }
}