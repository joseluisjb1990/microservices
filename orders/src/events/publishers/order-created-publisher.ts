import { OrderCreatedEvent, Publisher, Subjects } from "@jljtickets/common";

export class OrderCreatedPublisher  extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}