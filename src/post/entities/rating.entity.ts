import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn
} from 'typeorm'
import { UserEntity } from 'src/user/entities/user.entity'
import { PostEntity } from './post.entity'

@Entity('postRating')
export class RatingEntity {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => PostEntity, {
		nullable: false
	})
	@JoinColumn({ name: 'postId' })
	post: PostEntity

	@ManyToOne(() => UserEntity, {
		nullable: false
	})
	@JoinColumn({ name: 'userId' })
	user: UserEntity

	@Column()
	increment: number

	@CreateDateColumn({ type: 'timestamp' })
	date: Date
}
