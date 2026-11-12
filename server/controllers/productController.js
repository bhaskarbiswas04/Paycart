
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

// GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    await connectDB();

    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Validate pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isSafeInteger(pageNumber) ||
      !Number.isSafeInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
      });
    }

    // Build MongoDB query
    const filter = {
      isActive: true,
    };

    // Search
    if (search?.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      const categories = ['Electronics', 'Fashion', 'Accessories'];

      if (!categories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category',
        });
      }

      filter.category = category;
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = minPrice === undefined ? 0 : Number(minPrice);
      const max = maxPrice === undefined ? Infinity : Number(maxPrice);

      if (
        !Number.isFinite(min) ||
        min < 0 ||
        !Number.isFinite(max) && max !== Infinity ||
        max < min
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price range',
        });
      }

      filter.pricePaise = {
        $gte: Math.round(min * 100),
      };

      if (Number.isFinite(max)) {
        filter.pricePaise.$lte = Math.round(max * 100);
      }
    }

    // Sorting
    const sortOptions = {
      price_asc: { pricePaise: 1 },
      price_desc: { pricePaise: -1 },
      newest: { createdAt: -1 },
    };

    const sortOption = sort || 'newest';

    if (!sortOptions[sortOption]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sorting option',
      });
    }

    // Pagination
    const skip = (pageNumber - 1) * limitNumber;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions[sortOption])
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalProducts / limitNumber),
          totalProducts,
          limit: limitNumber,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    await connectDB();

    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};