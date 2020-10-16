import { Listener, OrderCancelledEvent, OrderCreatedEvent, Subjects } from "@jljtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const { id: orderId, ticket: { id: ticketId } } = data;
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            throw new Error(`Ticket with id ${ticketId} not found`)
        }
        ticket.set({ orderId: undefined });
        await ticket.save();

        new TicketUpdatedPublisher(this.client).publish({ 
            orderId: ticket.orderId,
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        msg.ack();
    }
}