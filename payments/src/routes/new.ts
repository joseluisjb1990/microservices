import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@jljtickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payments';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/api/payments', requireAuth, [
    body('orderId')
        .isMongoId(),
    body('token')
        .not()
        .isEmpty()
], validateRequest, async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for an cancelled order');
    }

    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
    });

    const payment = await Payment.build({
        orderId,
        stripeId: charge.id
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
        orderId: payment.orderId,
        stripeId: payment.stripeId,
        id: payment.id
    });

    res.status(201).send({ success: true, payment });
});

export { router as createChargeRouter };