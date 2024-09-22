'use strict';

const assert = require('assert');
const nconf = require('nconf');

const db = require('../mocks/databasemock');
const topics = require('../../src/topics');
const categories = require('../../src/categories');
const user = require('../../src/user');
const groups = require('../../src/groups');


describe('Topic save/unsave', () => {
	let tid;
	let cid;
	let adminUid;
	let regularUid;

	before(async () => {
		adminUid = await user.create({ username: 'admin', password: '123456' });
		await groups.join('administrators', adminUid);
		regularUid = await user.create({ username: 'regular', password: '123456' });
		cid = await categories.create({ name: 'Test Category' });
		const result = await topics.post({
			uid: adminUid,
			cid: cid,
			title: 'Test Topic Title',
			content: 'The content of test topic',
		});
		tid = result.topicData.tid;
	});

	describe('API methods', () => {
		const apiTopics = require('../../src/api/topics');

		it('should save a topic', async () => {
			await apiTopics.save({ uid: regularUid }, { tid: tid });
			const isSaved = await topics.isSavedTopic(tid, regularUid);
			assert(isSaved);
		});

		it('should unsave a topic', async () => {
			await apiTopics.unsave({ uid: regularUid }, { tid: tid });
			const isSaved = await topics.isSavedTopic(tid, regularUid);
			assert(!isSaved);
		});

		it('should get saved topics', async () => {
			await apiTopics.save({ uid: regularUid }, { tid: tid });
			const data = await apiTopics.getSaved({ uid: regularUid }, { page: 1 });
			assert(Array.isArray(data.topics));
			assert.strictEqual(data.topics.length, 1);
			assert.strictEqual(data.topics[0].tid, tid);
		});
	});
});
