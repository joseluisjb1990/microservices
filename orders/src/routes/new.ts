import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@jljtickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const router = express.Router();

router.post(
    '/api/orders', 
    requireAuth, [
    body('ticketId')
        .isMongoId()
        .withMessage('TicketId must be provided')
], validateRequest, 
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        const existingOrder = await ticket.isReserved();

        if (existingOrder) {
            throw new BadRequestError('ticket is already reserved');
        }    

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });

        await order.save();
        
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            version: order.version,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            }
        });

        return res.status(201).send(order);
    }
);

export { router as newOrderRouter };