import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('/')
export class AppController {
  @Get()
  getHello(@Req() request: Request): string {
    const host = request.get('host');
    return `Hello World! This is app home page, to start accessing your customs go to https://${host}/api/v1/customs`;
  }
}
