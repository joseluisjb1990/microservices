import { BadRequestError, NotFoundError } from '@jljtickets/common';
import express, { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new BadRequestError('invalid id');
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
        throw new NotFoundError();
    }
    
    return res.send(ticket);
});

export { router as showTicketRouter };