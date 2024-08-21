import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('11. SHOPPING API')
@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) { }

  @ApiOperation({ summary: '네이버 쇼핑 API 상품 검색' })
  @ApiQuery({ name: 'keyword', required: true, type: String })
  @Get()
  async search(@Query('keyword') keyword: string) {
    const items = await this.shoppingService.search(keyword);

    return {
      status: HttpStatus.OK,
      message: '상품 검색에 성공했습니다.',
      data: items,
    };
  }
}