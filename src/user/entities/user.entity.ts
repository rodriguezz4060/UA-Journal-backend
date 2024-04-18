import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany
} from 'typeorm'
import { CommentEntity } from '../../comment/entities/comment.entity'
import { RatingEntity } from 'src/post/entities/rating.entity'
import { FollowingEntity } from './following.entity'

@Entity('users')
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	fullName: string

	@Column({
		unique: true
	})
	email: string

	@OneToMany(() => FollowingEntity, following => following.followingUser)
	following: FollowingEntity[]

	@OneToMany(() => FollowingEntity, following => following.followUser)
	followers: FollowingEntity[]

	@Column({
		default: 0
	})
	rating: number

	@OneToMany(() => CommentEntity, comment => comment.user, {
		eager: false,
		nullable: true
	})
	comments: CommentEntity[]

	@OneToMany(() => RatingEntity, postRating => postRating.user, {
		eager: false,
		nullable: true
	})
	postRating: RatingEntity[]

	@Column({ nullable: true })
	password?: string

	@Column({ nullable: true, default: 'popular' })
	feed?: string

	@Column({ nullable: true, default: '' })
	description?: string

	@Column({ nullable: true, default: '' })
	avatarUrl?: string

	@Column({ nullable: true, default: '' })
	headerCoverUrl?: string

	@Column({ nullable: true, default: '' })
	headerCoverPosition?: string

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date
}
