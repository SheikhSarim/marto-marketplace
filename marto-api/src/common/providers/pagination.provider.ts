import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResult } from '../interface/paginated.interface';

interface PaginationOptions {
  searchFields?: string[];
  allowedSortFields?: string[];
  defaultSortField: string;
  defaultSortOrder?: 'ASC' | 'DESC';
  secondarySortField?: string;
}

@Injectable()
export class PaginationProvider {
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    query: PaginationQueryDto,
    options: PaginationOptions,
  ): Promise<PaginatedResult<T>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    if (search && options.searchFields?.length) {
      const escapedSearch = search.replace(/[\\%_]/g, '\\$&');

      const searchConditions = options.searchFields
        .map((field) => `${field} ILIKE :search ESCAPE '\\'`)
        .join(' OR ');

      queryBuilder.andWhere(`(${searchConditions})`, {
        search: `%${escapedSearch}%`,
      });
    }

    const allowedFields = options.allowedSortFields ?? [];

    const sortField =
      query.sortBy && allowedFields.includes(query.sortBy)
        ? query.sortBy
        : options.defaultSortField;

    const sortOrder =
      query.sortOrder ?? options.defaultSortOrder ?? 'DESC';

    queryBuilder.orderBy(sortField, sortOrder);

    if (options.secondarySortField) {
      queryBuilder.addOrderBy(options.secondarySortField, 'ASC');
    }

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}