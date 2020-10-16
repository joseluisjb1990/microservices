import { OrderExpiredEvent, Publisher, Subjects, TicketUpdatedEvent } from "@jljtickets/common";


export class OrderExpiredPublisher extends Publisher<OrderExpiredEvent> {
    readonly subject = Subjects.OrderExpired;
}