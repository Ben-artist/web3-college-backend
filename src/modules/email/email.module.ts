import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config: any = {
          transport: {
            host: configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
            port: configService.get<number>('MAIL_PORT', 587),
            secure: configService.get<boolean>('MAIL_SECURE', false), // true for 465, false for other ports
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: `"Web3大学" <${configService.get<string>('MAIL_FROM', 'noreply@web3-university.com')}>`,
          },
        };

        // 使用Handlebars模板
        try {
          const { HandlebarsAdapter } = await import(
            '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
          );
          config.template = {
            dir: `${__dirname}/templates`,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          };
        } catch (_error) {}
        return config;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
