import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { Repository } from 'typeorm'
import { LoginUserDto } from './dto/login-user.dto'
import { SearchUserDto } from './dto/searchg-user.dto'
import { CommentEntity } from '../comment/entities/comment.entity'
import { AwsService } from 'src/aws/aws.service'
import { PostEntity } from '../post/entities/post.entity'
import { FollowingEntity } from './entities/following.entity'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private repository: Repository<UserEntity>,
		private awsService: AwsService,
		@InjectRepository(FollowingEntity)
		private followingRepository: Repository<FollowingEntity>
	) {}

	create(dto: CreateUserDto) {
		return this.repository.save(dto)
	}

	async findAll() {
		const arr = await this.repository
			.createQueryBuilder('u')
			.leftJoinAndMapMany(
				'u.comments',
				CommentEntity,
				'comment',
				'comment.userId = u.id'
			)
			.loadRelationCountAndMap('u.commentsCount', 'u.comments', 'comments')
			.getMany()

		return arr.map(obj => {
			delete obj.comments
			return obj
		})
	}

	async getUserById(id: number) {
		return this.repository.findOne(id)
	}

	async getUserPosts(userId: number) {
		return this.repository.find({ where: { userId }, relations: ['posts'] })
	}

	findById(id: number) {
		return this.repository.findOne(id)
	}

	findByCond(cond: LoginUserDto) {
		return this.repository.findOne(cond)
	}

	async update(id: number, dto: UpdateUserDto) {
		await this.repository.update(id, dto)
		return this.repository.findOne(id)
	}

	async uploadAvatar(userId: number, file: Express.Multer.File) {
		try {
			const result = await this.awsService.uploadAvatar(
				file.buffer,
				file.originalname,
				file.mimetype
			)

			// Сохраните ссылку на аватарку в базе данных пользователя
			await this.repository.update(userId, { avatarUrl: result.url })

			return result.url
		} catch (error) {
			console.error('Ошибка загрузки аватарки:', error)
			throw new Error('Ошибка загрузки аватарки')
		}
	}

	async uploadHeaderCover(
		userId: number,
		file: Express.Multer.File,
		backgroundPosition: string
	) {
		try {
			const result = await this.awsService.uploadHeaderCover(
				file.buffer,
				file.originalname,
				file.mimetype
			)

			// Сохраните ссылку на обложку в базе данных пользователя
			await this.repository.update(userId, {
				headerCoverUrl: result.url,
				headerCoverPosition: backgroundPosition
			})

			return result.url
		} catch (error) {
			console.error('Ошибка загрузки обложки:', error)
			throw new Error('Ошибка загрузки обложки')
		}
	}

	async deleteHeaderCover(userId: number) {
		try {
			// Удалите ссылку на обложку из базы данных пользователя
			await this.repository.update(userId, {
				headerCoverUrl: null,
				headerCoverPosition: null
			})

			return 'Header cover deleted successfully'
		} catch (error) {
			console.error('Ошибка удаления обложки:', error)
			throw new Error('Ошибка удаления обложки')
		}
	}

	async followUser(
		currentUserId: number,
		userToFollowId: number
	): Promise<void> {
		if (currentUserId !== userToFollowId) {
			const existingFollowing = await this.followingRepository.findOne({
				where: {
					followingUser: { id: currentUserId },
					followUser: { id: userToFollowId }
				}
			})

			if (existingFollowing) {
				throw new BadRequestException('You are already following this user')
			}

			const following = new FollowingEntity()
			following.followingUser = await this.repository.findOne(currentUserId)
			following.followUser = await this.repository.findOne(userToFollowId)

			await this.followingRepository.save(following)
		} else {
			throw new BadRequestException('You cannot follow yourself')
		}
	}

	async unfollowUser(
		currentUserId: number,
		userToUnfollowId: number
	): Promise<void> {
		await this.followingRepository.delete({
			followingUser: { id: currentUserId },
			followUser: { id: userToUnfollowId }
		})
	}

	async getUserFollowing(userId: number) {
		const followeing = await this.followingRepository.find({
			where: {
				followingUser: { id: userId }
			},
			relations: ['followUser']
		})
		return followeing.map(follower => follower.followUser)
	}

	async getUserFollowers(userId: number) {
		const followers = await this.followingRepository.find({
			where: {
				followUser: { id: userId }
			},
			relations: ['followingUser']
		})
		return followers.map(follower => follower.followingUser)
	}

	async search(dto: SearchUserDto) {
		const qb = this.repository.createQueryBuilder('u')

		qb.limit(dto.limit || 0)
		qb.take(dto.take || 10)

		if (dto.fullName) {
			qb.andWhere(`u.fullName ILIKE :fullName`)
		}

		if (dto.email) {
			qb.andWhere(`u.email ILIKE :email`)
		}

		qb.setParameters({
			email: `%${dto.email}%`,
			fullName: `%${dto.fullName}%`
		})

		const [items, total] = await qb.getManyAndCount()

		return { items, total }
	}
}
