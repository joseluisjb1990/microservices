import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError, JWTGenerator } from '@jljtickets/common';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid!'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters')
], validateRequest, async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new BadRequestError('Invalid Credentials');
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);

    if (!passwordsMatch) {
        throw new BadRequestError('Invalid Crednetials');
    }

    req.session = {
        jwt: JWTGenerator.generate({
            id: existingUser.id!,
            email: existingUser.email
        })
    };

    return res.status(200).send(existingUser);
});

export { router as signinRouter };