import { IsArray, IsOptional, IsString } from 'class-validator'
import { Column } from 'typeorm'

export interface OutputBlockData {
	id?: string
	type: any
	data: any
}

export class CreatePostDto {
	@IsString()
	title: string

	@IsArray()
	body: OutputBlockData[]

	@IsOptional()
	@IsArray()
	tags: string

	rating: number
}
