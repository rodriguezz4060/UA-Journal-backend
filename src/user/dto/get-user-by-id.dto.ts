import { IsNumberString } from 'class-validator'

export class GetUserByIdDto {
	@IsNumberString()
	id: number
}
