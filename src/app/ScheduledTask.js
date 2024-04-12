import { SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";
import * as constants from "./constants.js";
import { BackgroundTask } from "./BackgroundTask.js";

class ScheduledTask {
    constructor() {
        this.task_stack = {
            five_seconds: [],
            one_minute: [],
        };

        this.scheduler = new ToadScheduler();

        this.scheduledTaskWorker();

        if (ScheduledTask.instance === "object") {
            return ScheduledTask.instance;
        }

        ScheduledTask.instance = this;
        return this;
    }

    /**
     *
     * @param {string} id identifier of the task to be executed
     * @param {function} callback function process
     */
    sendScheduledTask({ id, data, type, ...rest }) {
        if (type === constants.celery.scheduler.types.FIVE_SECONDS) {
            const incoming_task = this.task_stack.five_seconds.find(
                (current_task) => current_task.id === id
            );

            if (!incoming_task) {
                const new_task = {
                    id,
                    data,
                    complete: false,
                    process: false,
                    ...rest,
                };

                this.task_stack.five_seconds.push(new_task);
            }
        } else {
            // TODO: one minute assigment
            const incoming_task = this.task_stack.one_minute.find(
                (current_task) => current_task.id === id
            );

            if (!incoming_task) {
                const new_task = {
                    id,
                    data,
                    complete: false,
                    ...rest,
                };

                this.task_stack.one_minute.push(new_task);
            }
        }
    }

    completeTaskOneMinute(id) {
        const current_task = this.task_stack.one_minute.find(
            (task) => task.id === id
        );

        if (current_task) {
            current_task.complete = true;
        }
    }

    /**
     * the scheduled task worker starts
     */
    scheduledTaskWorker() {
        // tasks scheduled every five seconds
        this.tasksScheduledEveryFiveSeconds();

        // tasks scheduled every one minute
        this.tasksScheduledEveryOneMinute();
    }

    tasksScheduledEveryFiveSeconds() {
        const scheduleTask = new Task(
            constants.celery.scheduler.task_scheduled,
            async () => {
                this.task_stack.five_seconds =
                    this.task_stack.five_seconds.filter(
                        (current_task) => current_task.complete !== true
                    );

                for (
                    let index = 0;
                    index < this.task_stack.five_seconds.length;
                    index++
                ) {
                    const currentTask = this.task_stack.five_seconds[index];

                    if (!currentTask.process) {
                        currentTask.process = true;
                        const response_callback = await currentTask.callback(
                            currentTask.data
                        );

                        response_callback.ok
                            ? (currentTask.complete = true)
                            : (currentTask.process = false);
                    }
                }
            }
        );

        const job = new SimpleIntervalJob({ seconds: 5 }, scheduleTask);
        this.scheduler.addSimpleIntervalJob(job);
    }

    tasksScheduledEveryOneMinute() {
        const scheduleTask = new Task(
            constants.celery.scheduler.task_scheduled_one_minute,
            async () => {
                console.log(
                    "SCHEDULED TASK ONE MINUTE -> ",
                    this.task_stack.one_minute
                );

                this.task_stack.one_minute = this.task_stack.one_minute.filter(
                    (current_task) => current_task.complete !== true
                );

                for (
                    let index = 0;
                    index < this.task_stack.one_minute.length;
                    index++
                ) {
                    const currentTask = this.task_stack.one_minute[index];

                    this.background_task = new BackgroundTask();
                    await this.background_task.sendBackgroundTask(
                        currentTask.celery_task,
                        [currentTask.data]
                    );
                }
            }
        );

        const job = new SimpleIntervalJob({ seconds: 60 }, scheduleTask);
        this.scheduler.addSimpleIntervalJob(job);
    }
}

export { ScheduledTask };
