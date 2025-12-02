var cron = require('node-cron');

const schedules = [];

function start(id, rule, func) {
    var schedule = {
        id: id,
        task: cron.schedule(rule, func, {
            scheduled: false
        })
    }
    schedule.task.start();

    schedules.push(schedule);
}

function restart(id, rule, func) {
    for (const schedule of schedules) {
        if(schedule.id == id) {
            schedule.task.stop();
            schedule.task = cron.schedule(rule, func, {
                scheduled: false
            });
            schedule.task.start();
            break;
        }
    }
}

function stop(id) {
    for (const schedule of schedules) {
        if(schedule.id == id) {
            schedule.task.stop();
            break;
        }
    }
}

module.exports = {
    start,
    stop,
    restart
}