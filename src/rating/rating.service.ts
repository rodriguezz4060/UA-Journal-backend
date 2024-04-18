import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RatingEntity } from '../post/entities/rating.entity'
import { Repository } from 'typeorm'

@Injectable()
export class RatingService {
	constructor(
		@InjectRepository(RatingEntity)
		private readonly ratingRepository: Repository<RatingEntity>
	) {}

	async findAll(postId: number) {
		const qb = this.ratingRepository.createQueryBuilder('c')

		if (postId) {
			qb.where('c.postId = :postId', { postId })
		}

		const arr = await qb
			.leftJoinAndSelect('c.post', 'post')
			.leftJoinAndSelect('c.user', 'user')
			.getMany()

		return arr.map(obj => {
			return {
				...obj,
				post: { id: obj.post.id }
			}
		})
	}
}
