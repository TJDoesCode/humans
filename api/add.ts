import { NowRequest, NowResponse } from '@vercel/node';
import { Item } from '../types/item';
import { db } from './util/db';
import { cleanBody, getNextId, incNextId } from './util/funcs';

export default async (req: NowRequest, res: NowResponse) => {
	if (req.method?.toUpperCase() !== 'POST')
		return res.status(405).send('Invalid HTTP method (expected POST)');

	const body: Item = cleanBody(req, res);
	const nextId = await getNextId();

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
	res.json(obj);
};
