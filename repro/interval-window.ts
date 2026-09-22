import PQueue from '../source/index.js';
import delay from 'delay';

// 一格一格地试：运行中改窗口长度，放行节奏会不会跟着变。
const trace = async (queue: PQueue, ms: number) => {
	const starts: number[] = [];
	const t0 = Date.now();
	for (let index = 0; index < 8; index++) {
		queue.add(() => {
			starts.push(Date.now() - t0);
			return delay(2);
		});
	}
	await delay(ms);
	return starts;
};

{
	// intervalCap 2 / interval 800，跑到中途把窗口改成 100：
	// 期望是改完之后剩下的任务很快放行；窗口不可变的话仍是 800 一格。
	const queue = new PQueue({intervalCap: 2, interval: 800, concurrency: 50});
	const starts: number[] = [];
	const t0 = Date.now();
	for (let index = 0; index < 8; index++) {
		queue.add(() => {
			starts.push(Date.now() - t0);
			return delay(2);
		});
	}
	await delay(150);
	queue.interval = 100;
	await delay(1400);
	console.log(JSON.stringify({case: 'shorten-interval', startedWithin1550ms: starts.length, offsets: starts, intervalNow: queue.interval, note: '窗口真能改的话 8 个都会跑起来'}));
}

{
	// interval 0（等于关限速）改成 400：改成之后就该按 400 一格放行
	const queue = new PQueue({concurrency: 50, intervalCap: 1, interval: 0});
	const before = queue.interval;
	queue.interval = 400;
	const offsets = await trace(queue, 900);
	console.log(JSON.stringify({case: 'interval-from-zero', before, after: queue.interval, startedIn900ms: offsets.length, offsets}));
}
