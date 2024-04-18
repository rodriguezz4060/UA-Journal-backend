import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { UserEntity } from './user/entities/user.entity'
import { PostModule } from './post/post.module'
import { PostEntity } from './post/entities/post.entity'
import { CommentModule } from './comment/comment.module'
import { CommentEntity } from './comment/entities/comment.entity'
import { AuthModule } from './auth/auth.module'
import { AwsController } from './aws/aws.controller'
import { AwsModule } from './aws/aws.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RatingEntity } from './post/entities/rating.entity'
import { RatingModule } from './rating/rating.module'
import { FollowingEntity } from './user/entities/following.entity'
import { RepostController } from './repost/repost.controller'
import { RepostModule } from './repost/repost.module'

@Module({
	imports: [
		ConfigModule.forRoot(), // Инициализация модуля конфигурации
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DB_HOST'),
				port: +configService.get<number>('DB_PORT'),
				username: configService.get('DB_USERNAME'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_DATABASE'),
				entities: [
					UserEntity,
					PostEntity,
					CommentEntity,
					RatingEntity,
					FollowingEntity
				],
				synchronize: true
			}),
			inject: [ConfigService]
		}),
		UserModule,
		PostModule,
		CommentModule,
		AuthModule,
		AwsModule,
		ConfigModule.forRoot(),
		RatingModule,
		RepostModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
