import { Publisher, Subjects, TicketCreatedEvent } from "@jljtickets/common";


export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}