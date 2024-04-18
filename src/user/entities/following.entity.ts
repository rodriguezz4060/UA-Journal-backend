import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from './user.entity'

@Entity('following')
export class FollowingEntity {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => UserEntity, user => user.following)
	followingUser: UserEntity

	@ManyToOne(() => UserEntity, user => user.following)
	followUser: UserEntity
}
