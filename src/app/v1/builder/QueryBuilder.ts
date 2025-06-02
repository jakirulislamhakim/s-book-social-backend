import { FilterQuery, Query } from 'mongoose';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

/**
 * QueryBuilder class for building dynamic queries using Mongoose.
 * This class allows you to chain methods for filtering, searching, sorting,
 * pagination, and selecting fields in MongoDB queries.
 *
 * @template T - The type of the document in the Mongoose model.
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
      (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  paginate() {
    const limit = Number(this.query?.limit) || 0;
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
    const itemsPerPage = Number(this.query?.limit) || 20;
    const currentPage = Number(this.query?.page) || 1;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalItems < currentPage) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `page number ${currentPage} must be smaller than totalPage ${totalPages} `,
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
