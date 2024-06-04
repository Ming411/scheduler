import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { AaaService } from './aaa/aaa.service';

@Injectable()
export class TaskService {
  @Inject(AaaService)
  private aaaService: AaaService;

  // ! cron 表达式
  // 7 12 13 10 * ?    // 每月 10 号的 13:12:07
  // 0 20-30 * * * *   // 从 20 到 30 的每分钟每个第 0 秒都会执行
  // 0 5,10 * * * *    // 每小时的第 5 和 第 10 分钟的第 0 秒执行定时任务
  // 0 5/10 * * * *   // 每小时的第 5 分钟开始每隔 10 分钟执行一次

  // @Cron(CronExpression.EVERY_5_SECONDS, {
  //   name: 'task1',
  //   timeZone: 'Asia/Shanghai', // 选择时区
  // })
  handleCron() {
    console.log('task execute：', this.aaaService.findAll());
  }

  // @Interval('task2', 500) // 每 500 毫秒执行一次
  task2() {
    console.log('task2');
  }

  // @Timeout('task3', 3000) // 3 秒后执行
  task3() {
    console.log('task3');
  }
}
