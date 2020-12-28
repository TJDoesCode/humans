import { NowRequest, NowResponse } from '@vercel/node';
import { Item } from '../types/item';
import { db } from './util/db';
import {
	cleanBody,
	getNextId,
	incNextId,
	AsyncVercelReturn,
	tryHandleFunc,
	DBInitError,
} from './util/funcs';

const handle = async (req: NowRequest, res: NowResponse): AsyncVercelReturn => {
	if (!db) throw new DBInitError('Database initialization failed');

	const body = cleanBody<Item>(req);
	const nextId = (await getNextId()) ?? 0;

	const obj = {
		id: nextId,
		img: body.img,
		desc: body.desc,
		date: Date.now(),
	};

	Object.values(obj).every((x, idx) => {
		if (x == null) {
			res.status(422).send(`Request body is missing property "${Object.keys(obj)[idx]}"`);
			return false;
		}
		return true;
	});

	await db.put(obj, nextId.toString());
	await incNextId();
	res.status(201).json(obj);
};

export default tryHandleFunc(handle, 'POST');
