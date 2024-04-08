import { SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";
import * as constants from "./constants.js";

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
    sendScheduledTask({ callback, id, data, type }) {

        if (type === constants.celery.scheduler.types.FIVE_SECONDS) {
            const incoming_task = this.task_stack.five_seconds.find(
                (current_task) => current_task.id === id
            );

            if (!incoming_task) {
                const new_task = {
                    id,
                    callback,
                    data,
                    complete: false,
                    process: false,
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
                    callback,
                    data,
                    complete: false,
                    process: false,
                };

                this.task_stack.one_minute.push(new_task);
            }
        }
    }

    /**
     * the scheduled task worker starts
     */
    scheduledTaskWorker() {
        // tasks scheduled every five seconds
        this.scheduler.addSimpleIntervalJob(
            this.tasksScheduledEveryFiveSeconds()
        );

        // tasks scheduled every one minute
        this.scheduler.addSimpleIntervalJob(
            this.tasksScheduledEveryOneMinute()
        );
    }

    tasksScheduledEveryFiveSeconds() {
        const scheduleTask = new Task(
            constants.celery.scheduler.task_scheduled,
            async () => {
                this.task_stack.five_seconds = this.task_stack.five_seconds.filter(
                    (current_task) => current_task.complete !== true
                );

                for (let index = 0; index < this.task_stack.five_seconds.length; index++) {
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

        return new SimpleIntervalJob({ seconds: 5 }, scheduleTask);
    }

    tasksScheduledEveryOneMinute() {
        const scheduleTask = new Task(
            constants.celery.scheduler.task_scheduled_one_minute,
            async () => {
                this.task_stack.one_minute = this.task_stack.one_minute.filter(
                    (current_task) => current_task.complete !== true
                );

                for (let index = 0; index < this.task_stack.one_minute.length; index++) {
                    const currentTask = this.task_stack.one_minute[index];

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

        return new SimpleIntervalJob({ seconds: 60 }, scheduleTask);
    }
}

export { ScheduledTask };
