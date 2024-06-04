import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Article } from './entities/article.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ArticleService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  async findOne(id: number) {
    return await this.entityManager.findOneBy(Article, {
      id,
    });
  }

  // 将redis中的数据同步到数据库
  async flushRedisToDB() {
    const keys = await this.redisService.keys(`article_*`); // [atricle_1, atricle_2, ...]
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const res = await this.redisService.hashGet(key);
      const [, id] = key.split('_');
      await this.entityManager.update(
        Article,
        {
          id: +id,
        },
        {
          viewCount: +res.viewCount,
        },
      );
    }
  }

  // 该文章的阅读量
  /*
    每次刷新阅读量都加一，其实还是同一个人看的这篇文章
    这样统计出来的阅读量是不准的，我们想要的阅读量是有多少人看过这篇文章
    阅读是个很高频的操作，直接存到数据库，数据库压力会太大
   */
  // async view(id: number) {
  //   const article = await this.findOne(id);
  //   article.viewCount++;
  //   await this.entityManager.save(article);
  //   return article.viewCount;
  // }

  @Inject(RedisService)
  private redisService: RedisService;

  async view(id: number, userId: string) {
    const res = await this.redisService.hashGet(`article_${id}`);
    if (res.viewCount === undefined) {
      const article = await this.findOne(id);
      article.viewCount++;
      // await this.entityManager.save(article); // save会先select再update
      await this.entityManager.update(
        Article,
        { id },
        {
          viewCount: article.viewCount,
        },
      );
      await this.redisService.hashSet(`article_${id}`, {
        viewCount: article.viewCount,
        likeCount: article.likeCount,
        collectCount: article.collectCount,
      });

      // 用户十分钟内重复访问不增加阅读量
      await this.redisService.set(`user_${userId}_article_${id}`, 1, 30); // 3秒
      return article.viewCount;
    } else {
      const flag = await this.redisService.get(`user_${userId}_article_${id}`);
      if (flag) {
        // 如果用户标识未过期，不增加阅读量
        return res.viewCount;
      }
      await this.redisService.hashSet(`article_${id}`, {
        ...res,
        viewCount: +res.viewCount + 1,
      });
      return +res.viewCount + 1;
    }
  }
}
