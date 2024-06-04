import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticleService } from '../article/article.service';

@Injectable()
export class TaskService {
  @Inject(ArticleService)
  private articleService: ArticleService;

  // @Cron(CronExpression.EVERY_MINUTE) // 每分钟执行一次
  @Cron(CronExpression.EVERY_DAY_AT_4AM) // 每天早上四点执行（人少，服务器压力小）
  async handleCron() {
    await this.articleService.flushRedisToDB();
  }
}
