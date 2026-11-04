import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResult } from '../interface/paginated.interface';

interface PaginationOptions {
  searchFields?: string[];
  allowedSortFields?: string[];
  defaultSortField: string;
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

    // Search
    const search = query.search?.trim();

    if (search && options.searchFields?.length) {
      const searchConditions = options.searchFields
        .map((field) => `${field} ILIKE :search`)
        .join(' OR ');

      queryBuilder.andWhere(`(${searchConditions})`, {
        search: `%${search}%`,
      });
    }

    // Sorting: only allow configured fields
    const allowedFields = options.allowedSortFields ?? [];

    const sortField =
      query.sortBy && allowedFields.includes(query.sortBy)
        ? query.sortBy
        : options.defaultSortField;

    const sortOrder = query.sortOrder ?? 'DESC';

    queryBuilder.orderBy(sortField, sortOrder);

    // Pagination
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