import { IsNotEmpty } from 'class-validator'

export class postRatingDto {
	@IsNotEmpty()
	postId: number
}
