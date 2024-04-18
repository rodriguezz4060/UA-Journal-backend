import { Module } from '@nestjs/common';
import { RepostService } from './repost.service';
import { RepostController } from './repost.controller';

@Module({
  controllers: [RepostController],
  providers: [RepostService]
})
export class RepostModule {}
