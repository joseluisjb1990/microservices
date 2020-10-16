import { Listener, OrderCreatedEvent, Subjects } from "@jljtickets/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        
        const { id: orderId } = data;

        await expirationQueue.add({ orderId }, { delay });
        console.log(`Waiting ${delay} miliseconds`);
        msg.ack();
    }
}