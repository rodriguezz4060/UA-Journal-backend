import { Controller, Get, Query } from '@nestjs/common'
import { RatingService } from './rating.service'
import { RatingEntity } from '../post/entities/rating.entity'

@Controller('rating')
export class RatingController {
	constructor(private readonly ratingService: RatingService) {}

	@Get()
	findAll(@Query() query: { postId?: string }) {
		return this.ratingService.findAll(+query.postId)
	}
}
