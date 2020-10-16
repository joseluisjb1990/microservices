import { OrderStatus } from '@jljtickets/common';
import mongoose from 'mongoose';
import { Order } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

ticketSchema.statics.build =  (attrs: TicketAttrs) => {
    const { id, ...newAttrs } = attrs;
    const _id = id;

    return new Ticket({
        _id,
        ...newAttrs
    });
}

ticketSchema.statics.findByEvent =  (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
}

ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
}

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);


// ticketSchema.pre('save', function(done) {
//     // @ts-ignore
//     this.$where = {
//         version: this.get('version') - 1
//     };

//     done();
// });

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket, TicketDoc, TicketAttrs };