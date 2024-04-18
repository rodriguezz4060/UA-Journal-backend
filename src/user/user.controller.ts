import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
	Query,
	UseInterceptors,
	UploadedFile,
	NotFoundException,
	BadRequestException
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SearchUserDto } from './dto/searchg-user.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { GetUserByIdDto } from './dto/get-user-by-id.dto'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	findAll() {
		return this.userService.findAll()
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	getProfile(@Request() req) {
		return this.userService.findById(req.user.id)
	}

	@UseGuards(JwtAuthGuard)
	@Patch('me')
	async update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
		await this.userService.update(+req.user.id, updateUserDto)
		return this.userService.findById(req.user.id)
	}

	@Get(':id')
	async getUserById(@Param('id') id: string) {
		const userId = parseInt(id)
		const user = await this.userService.getUserById(userId)
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user
	}

	@Get(':id/following')
	async getUserFollowing(@Param('id') id: string) {
		const userId = parseInt(id)
		const user = await this.userService.getUserById(userId)
		if (!user) {
			throw new NotFoundException('User not found')
		}
		const following = await this.userService.getUserFollowing(userId)
		return following
	}

	@Get(':id/followers')
	async getUserFollowers(@Param('id') id: string) {
		const userId = parseInt(id)
		const user = await this.userService.getUserById(userId)
		if (!user) {
			throw new NotFoundException('User not found')
		}
		const followers = await this.userService.getUserFollowers(userId)
		return followers
	}

	@UseGuards(JwtAuthGuard)
	@Post(':id/follow')
	async followUser(@Request() req, @Param('id') id: string) {
		const currentUserId = req.user.id
		const userIdToFollow = parseInt(id)

		if (currentUserId !== userIdToFollow) {
			const userToFollow = await this.userService.getUserById(userIdToFollow)
			if (!userToFollow) {
				throw new NotFoundException('User not found')
			}

			try {
				await this.userService.followUser(currentUserId, userIdToFollow)
				return 'Successfully followed user'
			} catch (error) {
				throw new BadRequestException('You are already following this user')
			}
		} else {
			throw new BadRequestException('You cannot follow yourself')
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id/unfollow')
	async unfollowUser(@Request() req, @Param('id') id: number) {
		const currentUserId = req.user.id

		try {
			await this.userService.unfollowUser(currentUserId, id)
			return 'Successfully unfollowed user'
		} catch (error) {
			throw new NotFoundException('User not found')
		}
	}

	@Get(':id/posts')
	getUserPosts(@Param('id') id: string) {
		return this.userService.getUserPosts(parseInt(id))
	}

	@UseGuards(JwtAuthGuard)
	@Patch('avatar')
	@UseInterceptors(FileInterceptor('file'))
	uploadAvatar(@Request() req, @UploadedFile() file) {
		return this.userService.uploadAvatar(req.user.id, file)
	}

	@UseGuards(JwtAuthGuard)
	@Patch('cover')
	@UseInterceptors(FileInterceptor('file'))
	uploadHeaderCover(
		@Request() req,
		@UploadedFile() file,
		@Body('backgroundPosition') backgroundPosition: string
	) {
		return this.userService.uploadHeaderCover(
			req.user.id,
			file,
			backgroundPosition
		)
	}

	@UseGuards(JwtAuthGuard)
	@Delete('cover')
	deleteHeaderCover(@Request() req) {
		return this.userService.deleteHeaderCover(req.user.id)
	}

	@Get('search')
	search(@Query() dto: SearchUserDto) {
		return this.userService.search(dto)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userService.findById(+id)
	}
}
