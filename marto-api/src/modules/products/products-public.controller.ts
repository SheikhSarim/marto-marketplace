
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enum/auth-type.enum';

@ApiTags('Public Products')
@Auth(AuthType.None)
@Controller('products')
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Browse public products',
    description:
      'Returns paginated products from approved sellers and active shops. Supports search, filtering by category, shop category, availability, price range and status, along with sorting.',
  })
  @ApiOkResponse({
    description: 'Paginated products retrieved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findPublicProducts(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get public product details',
    description: 'Returns details of a publicly visible product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Product details retrieved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid product UUID.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found or not publicly available.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findPublicProduct(id);
  }
}
