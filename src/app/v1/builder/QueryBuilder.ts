import { FilterQuery, Query } from 'mongoose';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import config from '../config';

/**
 * A chainable utility to build Mongoose queries dynamically from request query parameters.
 *
 * Supports search, filter, sort, pagination, field selection, and metadata generation.
 *
 * @template T - The type of the Mongoose document.
 *
 * @example
 * // In a service or controller:
 * import QueryBuilder from './utils/QueryBuilder';
 * import { UserModel } from './models/User.model';
 *
 * const queryParams = {
 *   searchTerm: 'john',
 *   role: 'admin',
 *   sort: 'name,-createdAt',
 *   page: '2',
 *   limit: '10',
 *   fields: 'name,email'
 * };
 *
 * const queryBuilder = new QueryBuilder(UserModel.find(), queryParams)
 *   .search(['name', 'email'])
 *   .filter()
 *   .sort()
 *   .paginate()
 *   .fields();
 *
 * const users = await queryBuilder.modelQuery;
 * const meta = await queryBuilder.paginateMeta();
 *
 * return {
 *   meta,
 *   data: users,
 * };
 */
class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.query = query;
    this.modelQuery = modelQuery;
  }

  search(searchableFields: string[]) {
    const searchTerm = (this?.query?.searchTerm as string) || '';
    const regex = new RegExp(searchTerm, 'i');

    this.modelQuery = this?.modelQuery?.find({
      $or: searchableFields.map(
        (field) =>
          ({
            [field]: { $regex: regex },
          }) as FilterQuery<T>,
      ),
    });

    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeQueryProperty: string[] = [
      'searchTerm',
      'sort',
      'limit',
      'page',
      'fields',
    ];
    excludeQueryProperty.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  sort() {
    const sort =
      (this.query?.sort as string)?.split(',')?.join(' ') ||
      config.PAGINATION_DEFAULT_SORT;
    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  paginate() {
    const limit = Number(this.query?.limit) || config.PAGINATION_DEFAULT_LIMIT;
    const page = Number(this.query?.page) || 1;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  async paginateMeta() {
    const filter = this.modelQuery.getFilter();
    const totalItems = await this.modelQuery.model.countDocuments(filter);
    const itemsPerPage =
      Number(this.query?.limit) || config.PAGINATION_DEFAULT_LIMIT;
    const currentPage = Number(this.query?.page) || 1;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // check if no items, return empty meta without throwing
    if (totalItems === 0) {
      return {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage,
      };
    }

    if (totalPages < currentPage) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Requested page number (${currentPage}) exceeds the total available pages (${totalPages}). Please provide a valid page number.`,
      );
    }

    return {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
    };
  }
}

export default QueryBuilder;
