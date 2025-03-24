import crypto from 'crypto';
import { Redis } from "ioredis";
import Cookies from 'cookies';
import { v4 as uuidv4 } from 'uuid';

const redisOptions = {
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
};

const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomBytes(10), byte => chars[byte % chars.length]).join('');
};

export default async function handler(req, res) {
    const redis = new Redis(redisOptions);
    const cookies = new Cookies(req, res);
    const secretRegex = /^[a-zA-Z0-9]{3,32}:[a-zA-Z0-9!@#$%^&*()\-_=+{}.]{3,64}$/;

    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                try {
                    let secret_cookie;
                    try{
                    secret_cookie = atob(cookies.get('secret'));
                    } catch (e) {
                        secret_cookie = '';
                    }
                    if (!secret_cookie || typeof secret_cookie !== 'string') {
                        return res.status(403).json({ message: 'Unauthorized' });
                    }
                    if (!secretRegex.test(secret_cookie)) {
                        return res.status(400).json({ message: 'Invalid cookie format' });
                    }
                    const redisKey = "nextjs:"+btoa(secret_cookie);
                    const userData = await redis.get(redisKey);
                    if (!userData) {
                        res.setHeader('Set-Cookie', 'secret=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None');
                        return res.status(403).json({ message: 'Cookie is invalid' });
                    }
                    let notes = [];
                    try {
                        notes = userData ? JSON.parse(userData) : [];
                        if (!Array.isArray(notes)) notes = [];
                    } catch (error) {
                        notes = [];
                    }
                    return res.status(200).json({ notes });

                } catch (error) {
                    console.error('error:', error);
                    return res.status(500).json({ message: 'error' });
                }

            case 'POST':
                try {
                    let secret_cookie;
                    try{
                    secret_cookie = atob(cookies.get('secret'));
                    } catch (e) {
                        secret_cookie = '';
                    }
                    const content_type = req.headers['content-type'];
                    if (!secret_cookie) {
                        return res.status(403).json({ message: 'Unauthorized' });
                    }
                    if (!secretRegex.test(secret_cookie)) {
                        return res.status(400).json({ message: 'Invalid cookie format' });
                    }
                    if (content_type && !content_type.startsWith('application/json')) {
                        return res.status(400).json({ message: 'Invalid content type' });
                    }
                    const redisKey = "nextjs:"+btoa(secret_cookie);
                    const userData = await redis.get(redisKey);
                    if (!userData) {
                        return res.status(403).json({ message: 'Unauthorized' });
                    }
                    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
                    const { title, content, use_password } = body;
                    if (!title || !content) {
                        return res.status(400).json({ message: 'Please provide a title and content' });
                    }
                    if (typeof content === 'string' && (content.includes('<') || content.includes('>'))) {
                        return res.status(400).json({ message: 'Invalid value for title or content' });
                    }
                    if (title.length > 50 || content.length > 1000) {
                        return res.status(400).json({ message: 'Title must not exceed 50 characters and content must not exceed 500 characters' });
                    }
                    let notes = [];
                    try {
                        notes = userData ? JSON.parse(userData) : [];
                        if (!Array.isArray(notes)) notes = [];
                    } catch (error) {
                        notes = [];
                    }
                    const id = uuidv4();
                    const password = use_password === 'true' ? generatePassword() : '';
                    const note = { id, title, content, password };
                    const newNotes = [...notes, note];
                    await redis.set(redisKey, JSON.stringify(newNotes), 'KEEPTTL');
                    return res.status(200).json({ message: 'Note saved successfully', id: note.id, password: note.password });

                } catch (error) {
                    console.error('error:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }

            default:
                res.setHeader('Allow', ['POST', 'GET']);
                return res.status(405).json({ message: `Method not allowed` });
        }
    } finally {
        await redis.quit();
    }
}


