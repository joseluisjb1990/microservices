import { OrderCancelledEvent, Publisher, Subjects } from "@jljtickets/common";

export class OrderCancelledPublisher  extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}