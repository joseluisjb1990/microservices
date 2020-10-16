import { Listener, Subjects, PaymentCreated, OrderStatus } from "@jljtickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreated> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreated['data'], msg: Message) {
        const { orderId } = data;
        
        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error(`Order with id ${orderId} not found`);
        }

        order.set({
            status: OrderStatus.Complete
        });

        await order.save();

        msg.ack();
    }
}