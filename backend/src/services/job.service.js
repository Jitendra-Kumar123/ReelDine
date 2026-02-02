const Queue = require('bull');
const config = require('../config/config');
const logger = require('../utils/logger');

class JobService {
  constructor() {
    this.queues = {};
  }

  createQueue(name, options = {}) {
    const queue = new Queue(name, {
      redis: config.redisUrl,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 50,
        ...options
      }
    });

    queue.on('completed', (job) => {
      logger.info(`Job ${job.id} in queue ${name} completed`);
    });

    queue.on('failed', (job, err) => {
      logger.error(`Job ${job.id} in queue ${name} failed:`, err);
    });

    this.queues[name] = queue;
    return queue;
  }

  addJob(queueName, jobName, data, options = {}) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    return queue.add(jobName, data, options);
  }

  processJob(queueName, jobName, processor) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    queue.process(jobName, processor);
  }

  async closeAll() {
    for (const queue of Object.values(this.queues)) {
      await queue.close();
    }
  }
}

const jobService = new JobService();

module.exports = jobService;
