import { PaymentCreated, Publisher, Subjects } from "@jljtickets/common";


export class PaymentCreatedPublisher extends Publisher<PaymentCreated> {
    readonly subject = Subjects.PaymentCreated;
}