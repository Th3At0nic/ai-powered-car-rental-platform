import { Query } from 'mongoose';

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(query: Record<string, unknown>, modelQuery: Query<T[], T>) {
    this.query = query;
    this.modelQuery = modelQuery;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm;

    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      });
    }
    return this;
  }

  sortBy() {
    const sortBy =
      (this.query.sortBy as string)?.split(',')?.join(' ') || '-createdAt';

    this.modelQuery = this.modelQuery.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 200;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this.query.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const filter = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(filter);
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 200;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }

  filter() {
    const queryObject = { ...this.query };
    const excludeFieldForFilter = [
      'searchTerm',
      'sortBy',
      'limit',
      'page',
      'fields',
    ];
    excludeFieldForFilter.forEach((elem) => delete queryObject[elem]);

    this.modelQuery = this.modelQuery.find(queryObject);
    return this;
  }

  // filter() {
  //   const queryObject = { ...this.query };
  //   const excludeFieldForFilter = [
  //     'searchTerm',
  //     'sortBy',
  //     'limit',
  //     'page',
  //     'fields',
  //     'dateFilter', //  Custom param
  //     'eventDate', //  Optional exact date match
  //   ];
  //   excludeFieldForFilter.forEach((elem) => delete queryObject[elem]);

  //   // Handle basic filtering
  //   this.modelQuery = this.modelQuery.find(queryObject);

  //   const dateFilter = this.query.dateFilter as string;
  //   const eventDate = this.query.eventDate as string;

  //   let startDate: Date | undefined;
  //   let endDate: Date | undefined;

  //   const today = new Date();

  //   if (dateFilter) {
  //     switch (dateFilter) {
  //       case 'today':
  //         startDate = new Date(today.setHours(0, 0, 0, 0));
  //         endDate = new Date(today.setHours(23, 59, 59, 999));
  //         break;

  //       case 'currentWeek': {
  //         const current = new Date();
  //         const day = current.getDay();
  //         const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  //         startDate = new Date(current.setDate(diff));
  //         startDate.setHours(0, 0, 0, 0);
  //         endDate = new Date(startDate);
  //         endDate.setDate(startDate.getDate() + 6);
  //         endDate.setHours(23, 59, 59, 999);
  //         break;
  //       }

  //       case 'lastWeek': {
  //         const current = new Date();
  //         const day = current.getDay();
  //         const diff = current.getDate() - day + (day === 0 ? -6 : 1) - 7;
  //         startDate = new Date(current.setDate(diff));
  //         startDate.setHours(0, 0, 0, 0);
  //         endDate = new Date(startDate);
  //         endDate.setDate(startDate.getDate() + 6);
  //         endDate.setHours(23, 59, 59, 999);
  //         break;
  //       }

  //       case 'currentMonth':
  //         startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  //         endDate = new Date(
  //           today.getFullYear(),
  //           today.getMonth() + 1,
  //           0,
  //           23,
  //           59,
  //           59,
  //           999,
  //         );
  //         break;

  //       case 'lastMonth':
  //         startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  //         endDate = new Date(
  //           today.getFullYear(),
  //           today.getMonth(),
  //           0,
  //           23,
  //           59,
  //           59,
  //           999,
  //         );
  //         break;
  //     }
  //   } else if (eventDate) {
  //     // If an exact date is given
  //     const exactDate = new Date(eventDate);
  //     if (!isNaN(exactDate.getTime())) {
  //       startDate = new Date(exactDate.setHours(0, 0, 0, 0));
  //       endDate = new Date(exactDate.setHours(23, 59, 59, 999));
  //     }
  //   }

  //   if (startDate && endDate) {
  //     this.modelQuery = this.modelQuery.find({
  //       ...queryObject,
  //       dateTime: {
  //         $gte: startDate,
  //         $lte: endDate,
  //       },
  //     });
  //   }

  //   return this;
  // }
}
