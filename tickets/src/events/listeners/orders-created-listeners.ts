import { Listener, OrderCreatedEvent, Subjects } from "@jljtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const { id: orderId, ticket: { id: ticketId } } = data;
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            throw new Error(`Ticket with id ${ticketId} not found`)
        }
        ticket!.set({ orderId });

        await ticket!.save();

        new TicketUpdatedPublisher(this.client).publish({ 
            orderId,
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        msg.ack();
    }
}