import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RatingController } from './rating.controller'
import { RatingService } from './rating.service'
import { RatingRepository } from './rating.repository'
import { RatingEntity } from '../post/entities/rating.entity'

@Module({
	imports: [TypeOrmModule.forFeature([RatingEntity])],
	controllers: [RatingController],
	providers: [RatingService, RatingRepository]
})
export class RatingModule {}
