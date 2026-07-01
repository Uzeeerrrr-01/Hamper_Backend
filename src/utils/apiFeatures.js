class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Parses query string into Prisma where object
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Handle filtering (e.g. price[gte]=50)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|contains)\b/g, match => `"${match}"`);
    const parsedQuery = JSON.parse(queryStr);
    
    // Transform to Prisma specific format if needed, but standard JSON usually needs mapping
    // Simple implementation for Prisma:
    let prismaWhere = {};
    for (const key in parsedQuery) {
      if (typeof parsedQuery[key] === 'object') {
        prismaWhere[key] = parsedQuery[key];
      } else {
        // Assume string matching
        if(parsedQuery[key] === 'true') prismaWhere[key] = true;
        else if(parsedQuery[key] === 'false') prismaWhere[key] = false;
        else if(!isNaN(parsedQuery[key])) prismaWhere[key] = Number(parsedQuery[key]);
        else prismaWhere[key] = parsedQuery[key];
      }
    }
    
    return prismaWhere;
  }

  // Returns Prisma orderBy object
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map(field => {
        if (field.startsWith('-')) return { [field.substring(1)]: 'desc' };
        return { [field]: 'asc' };
      });
      return sortBy;
    } else {
      return [{ createdAt: 'desc' }];
    }
  }

  // Returns Prisma skip/take object for pagination
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    return { skip, take: limit };
  }
}

module.exports = APIFeatures;
