import { Publisher, Subjects, TicketUpdatedEvent } from "@jljtickets/common";


export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}