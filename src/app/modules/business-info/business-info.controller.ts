import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BusinessInfoService } from './business-info.service';
import {
  CreateBusinessInfoDto,
  UpdateBusinessInfoDto,
  FindBusinessInfoDto,
} from './dto/business-info.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/dtos/auth.dto';

@ApiTags('business-info')
@Controller('business-info')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessInfoController {
  constructor(private readonly businessInfoService: BusinessInfoService) {}

  @Post()
  @ApiOperation({ summary: 'Create new business information' })
  create(@Body() createDto: CreateBusinessInfoDto) {
    return this.businessInfoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all business information records' })
  findAll() {
    return this.businessInfoService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Find business info by specific user ID' })
  findBySpecificUserId(@Param('userId') userId: string) {
    return this.businessInfoService.findByUserId(userId);
  }

  @Get('my-business')
  @ApiOperation({ summary: 'Find business info for the current user' })
  findByCurrentUser(@CurrentUser() user: AuthUser) {
    return this.businessInfoService.findByUserId(user.sub);
  }

  @Post('find-by-slug')
  @ApiOperation({ summary: 'Find business info by slug' })
  findBySlug(@Body() findDto: FindBusinessInfoDto) {
    return this.businessInfoService.findBySlug(findDto.slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find business info by ID' })
  findOne(@Param('id') id: string) {
    return this.businessInfoService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update business information' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBusinessInfoDto) {
    return this.businessInfoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete business information' })
  remove(@Param('id') id: string) {
    return this.businessInfoService.remove(id);
  }

  @Post('my-business')
  @ApiOperation({ summary: 'Create business info for the current user' })
  createMyBusiness(
    @CurrentUser() user: AuthUser,
    @Body() createDto: Omit<CreateBusinessInfoDto, 'userId'>,
  ) {
    const dto = {
      ...createDto,
      userId: user.sub,
    } as CreateBusinessInfoDto;

    return this.businessInfoService.create(dto);
  }
}
