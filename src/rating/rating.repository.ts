import { EntityRepository, Repository } from 'typeorm'
import { RatingEntity } from '../post/entities/rating.entity'

@EntityRepository(RatingEntity)
export class RatingRepository extends Repository<RatingEntity> {}
