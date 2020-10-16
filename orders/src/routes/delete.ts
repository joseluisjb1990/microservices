import { NotFoundError, OrderStatus } from '@jljtickets/common';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId', async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order
        .findById(orderId)
        .populate('ticket');

    if (!order || (order.userId !== req.currentUser!.id)) {
        throw new NotFoundError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        }
    });

    return res.status(204).send();
});

export { router as deleteOrderRouter };