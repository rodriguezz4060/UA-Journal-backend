import { ForbiddenException, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { UserEntity } from '../user/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { CreateUserDto } from '../user/dto/create-user.dto'

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	) {}

	async validateUser(email: string, password: string): Promise<any> {
		const lowercaseEmail = email.toLowerCase() // Преобразование email в нижний регистр
		const user = await this.userService.findByCond({
			email: lowercaseEmail,
			password
		})
		if (user && user.password === password) {
			const { password, ...result } = user
			return result
		}
		return null
	}

	generateJwtToken(data: { id: number; email: string }) {
		const payload = { email: data.email, sub: data.id }
		return this.jwtService.sign(payload)
	}

	async login(user: UserEntity) {
		const { password, ...userData } = user
		return {
			...userData,
			token: this.generateJwtToken(userData)
		}
	}

	async register(dto: CreateUserDto) {
		try {
			const lowercaseEmail = dto.email.toLowerCase() // Преобразование email в нижний регистр
			const { password, ...userData } = await this.userService.create({
				email: lowercaseEmail,
				fullName: dto.fullName,
				password: dto.password
			})
			return {
				...userData,
				token: this.generateJwtToken(userData)
			}
		} catch (err) {
			throw new ForbiddenException('Ошибка при регистрации')
		}
	}
}
