import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm'
import { PostEntity } from './entities/post.entity'
import { SearchPostDto } from './dto/searchg-post.dto'
import { RatingEntity } from './entities/rating.entity'
import { UserEntity } from 'src/user/entities/user.entity'

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(PostEntity)
		private repository: Repository<PostEntity>,
		@InjectRepository(RatingEntity)
		private ratingRepository: Repository<RatingEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>
	) {}

	async changeRating(
		postId: number,
		increment: number,
		userId: number
	): Promise<{ rating: number }> {
		const post = await this.repository.findOne(postId)
		if (!post) throw new NotFoundException('Пост не найден')

		const rating = await this.ratingRepository.findOne({
			where: { post: { id: postId }, user: { id: userId } },
			relations: ['post', 'user']
		})

		const currentDate = new Date() // Текущая дата

		if (rating) {
			if (rating.increment === increment)
				throw new BadRequestException(
					'Вы уже оценили этот пост с таким же рейтингом'
				)
			post.rating -= rating.increment
			await this.repository.save(post)
			rating.increment = increment
			rating.date = currentDate // Обновите дату рейтинга
			await this.ratingRepository.save(rating)
			post.rating += increment
			await this.repository.save(post)
		} else {
			if (increment !== 1 && increment !== -1)
				throw new BadRequestException('Неверное значение инкремента рейтинга')
			post.rating += increment
			await this.repository.save(post)
			const newRating = this.ratingRepository.create({
				post: { id: postId },
				user: { id: userId },
				increment,
				date: currentDate // Установите текущую дату для нового рейтинга
			})
			await this.ratingRepository.save(newRating)
		}

		// Прибавить рейтинг автору поста
		const authorRatings = await this.ratingRepository.find({
			where: { user: { id: userId } },
			relations: ['post']
		})

		const authorRating = authorRatings.reduce(
			(total, rating) => total + rating.post.rating,
			0
		)

		post.user.rating = authorRating
		await this.userRepository.save(post.user)

		const updatedPost = await this.repository.findOne(postId)
		return { rating: updatedPost.rating }
	}

	async findAllRatingsByAuthorAndMonth(
		authorId: number,
		month: number,
		year: number
	): Promise<number> {
		const startDate = new Date(year, month - 1, 1) // Начало месяца
		const endDate = new Date(year, month, 0) // Конец месяца

		const ratings = await this.ratingRepository.find({
			where: {
				date: Between(startDate, endDate),
				post: { user: { id: authorId } }
			},
			relations: ['post', 'user']
		})

		const totalRating = ratings.reduce(
			(sum, rating) => sum + rating.increment,
			0
		)
		return totalRating
	}

	findAll() {
		return this.repository.find({
			order: {
				createdAt: 'DESC'
			}
		})
	}

	async popular() {
		const qb = this.repository.createQueryBuilder()

		qb.orderBy('views', 'DESC')
		qb.limit(10)

		const [items, total] = await qb.getManyAndCount()

		return {
			items,
			total
		}
	}

	async search(dto: SearchPostDto) {
		const qb = this.repository.createQueryBuilder('p')

		qb.leftJoinAndSelect('p.user', 'user')

		qb.limit(dto.limit || 0)
		qb.take(dto.take || 10)

		if (dto.views) {
			qb.orderBy('views', dto.views)
		}

		if (dto.body) {
			qb.andWhere(`p.body ILIKE :body`)
		}

		if (dto.title) {
			qb.andWhere(`p.title ILIKE :title`)
		}

		if (dto.tag) {
			qb.andWhere(`p.tags ILIKE :tag`)
		}

		qb.setParameters({
			title: `%${dto.title}%`,
			body: `%${dto.body}%`,
			tag: `%${dto.tag}%`,
			views: dto.views || ''
		})

		const [items, total] = await qb.getManyAndCount()

		return { items, total }
	}

	async findOne(id: number) {
		await this.repository
			.createQueryBuilder('posts')
			.whereInIds(id)
			.update()
			.set({
				views: () => 'views + 1'
			})
			.execute()

		return this.repository.findOne(id)
	}

	create(dto: CreatePostDto, userId: number) {
		const firstParagraph = dto.body.find(obj => obj.type === 'paragraph')?.data
			?.text
		return this.repository.save({
			title: dto.title,
			body: dto.body,
			tags: dto.tags,
			user: { id: userId },
			description: firstParagraph || ''
		})
	}

	async update(id: number, dto: UpdatePostDto, userId: number) {
		const find = await this.repository.findOne(+id)

		if (!find) {
			throw new NotFoundException('Статья не найдена')
		}

		const firstParagraph = dto.body.find(obj => obj.type === 'paragraph')?.data
			?.text

		return this.repository.update(id, {
			title: dto.title,
			body: dto.body,
			tags: dto.tags,
			user: { id: userId },
			description: firstParagraph || ''
		})
	}

	async remove(id: number, userId: number) {
		const find = await this.repository.findOne(+id)

		if (!find) {
			throw new NotFoundException('Статья не найдена')
		}

		if (find.user.id !== userId) {
			throw new ForbiddenException('Нет доступа к этой статье!')
		}
		await this.ratingRepository.delete({ post: { id } }) // Удалить связанные оценки поста

		return this.repository.delete(id)
	}
}
