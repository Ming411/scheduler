import { Controller, Get, Param, Req, Session } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.articleService.findOne(+id);
  }

  @Get(':id/view')
  async view(@Param('id') id: string, @Session() session, @Req() req) {
    // 如果用户登录了，就用用户的id，否则用ip 存储唯一标识
    return await this.articleService.view(+id, session?.user?.id || req.ip);
  }
}
