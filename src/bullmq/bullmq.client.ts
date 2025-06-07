import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { redisClient } from '../redis/redis.client';

export class BullMQClient {
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;
  private connection: Redis;

  constructor() {
    this.queues = new Map();
    this.workers = new Map();
    this.connection = redisClient.getClient();
  }

  private createQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName)!;
    }

    const queue = new Queue(queueName, {
      connection: this.connection
    });

    console.log("Created BullMQ Queue", queueName);

    this.queues.set(queueName, queue);
    return queue;
  }

  public addJobHandler(
    queueName: string,
    handler: (job: Job) => Promise<any>
  ): void {
    if (!this.queues.has(queueName)) {
      this.createQueue(queueName);
    }

    if (this.workers.has(queueName)) {
      throw new Error(`Worker already exists for queue: ${queueName}`);
    }

    const worker = new Worker(queueName, async (job: Job) => {
      try {
        return await handler(job);
      } catch (error) {
        console.error(`Error processing job ${job.id} in queue ${queueName}:`, error);
        throw error;
      }
    }, {
      connection: this.connection
    });

    this.workers.set(queueName, worker);

    console.log("Created BullMQ Worker for queue", queueName);

    // Handle worker events
    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed in queue ${queueName}:`, error);
    });
  }

  public async invokeJob(
    queueName: string,
    data: any,
    opts?: { priority?: number; delay?: number; attempts?: number }
  ): Promise<Job> {
    const queue = this.createQueue(queueName);
    return await queue.add(queueName, data, opts);
  }

  public async closeAll(): Promise<void> {
    // Close all workers
    for (const [name, worker] of this.workers) {
      await worker.close();
    }

    // Close all queues
    for (const [name, queue] of this.queues) {
      await queue.close();
    }

  }
}

export const bullMQClient = new BullMQClient();