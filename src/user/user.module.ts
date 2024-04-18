import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { AwsService } from 'src/aws/aws.service'
import { ConfigModule } from '@nestjs/config'
import { FollowingEntity } from './entities/following.entity'

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, FollowingEntity]),
		ConfigModule
	],
	controllers: [UserController],
	providers: [UserService, AwsService],
	exports: [UserService]
})
export class UserModule {}
