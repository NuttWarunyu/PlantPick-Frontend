// Input Validation using Joi
const Joi = require('joi');

/**
 * Validation middleware factory
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
}

// Common validation schemas
const schemas = {
  // Plant schemas
  createPlant: Joi.object({
    name: Joi.string().required().min(1).max(255).trim(),
    scientific_name: Joi.string().max(255).trim().allow(null, ''),
    category: Joi.string().max(100).trim().allow(null, ''),
    plant_type: Joi.string().max(100).trim().allow(null, ''),
    measurement_type: Joi.string().max(50).trim().allow(null, ''),
    description: Joi.string().max(5000).trim().allow(null, ''),
    image_url: Joi.string().uri().max(2048).allow(null, '')
  }),

  updatePlant: Joi.object({
    name: Joi.string().min(1).max(255).trim(),
    scientific_name: Joi.string().max(255).trim().allow(null, ''),
    category: Joi.string().max(100).trim().allow(null, ''),
    plant_type: Joi.string().max(100).trim().allow(null, ''),
    measurement_type: Joi.string().max(50).trim().allow(null, ''),
    description: Joi.string().max(5000).trim().allow(null, ''),
    image_url: Joi.string().uri().max(2048).allow(null, '')
  }),

  // Supplier schemas
  createSupplier: Joi.object({
    name: Joi.string().required().min(1).max(255).trim(),
    location: Joi.string().required().min(1).max(1000).trim(),
    phone: Joi.string().max(50).trim().allow(null, ''),
    phone_numbers: Joi.array().items(Joi.string().max(50)).allow(null),
    website: Joi.string().uri().max(2048).allow(null, ''),
    description: Joi.string().max(5000).trim().allow(null, ''),
    specialties: Joi.array().items(Joi.string()).allow(null),
    business_hours: Joi.string().max(500).trim().allow(null, ''),
    payment_methods: Joi.array().items(Joi.string()).allow(null)
  }),

  updateSupplier: Joi.object({
    name: Joi.string().min(1).max(255).trim(),
    location: Joi.string().min(1).max(1000).trim(),
    phone: Joi.string().max(50).trim().allow(null, ''),
    phone_numbers: Joi.array().items(Joi.string().max(50)).allow(null),
    website: Joi.string().uri().max(2048).allow(null, ''),
    description: Joi.string().max(5000).trim().allow(null, ''),
    specialties: Joi.array().items(Joi.string()).allow(null),
    business_hours: Joi.string().max(500).trim().allow(null, ''),
    payment_methods: Joi.array().items(Joi.string()).allow(null)
  }),

  // Plant-Supplier connection schema
  createPlantSupplier: Joi.object({
    plantId: Joi.string().required(),
    supplierId: Joi.string().required(),
    price: Joi.number().positive().allow(null),
    size: Joi.string().max(100).trim().allow(null, ''),
    stock_quantity: Joi.number().integer().min(0).allow(null),
    min_order_quantity: Joi.number().integer().min(1).allow(null),
    delivery_available: Joi.boolean().allow(null),
    delivery_cost: Joi.number().min(0).allow(null),
    notes: Joi.string().max(1000).trim().allow(null, '')
  }),

  // Bill schema
  createBill: Joi.object({
    supplier_id: Joi.string().allow(null, ''),
    supplier_name: Joi.string().required().min(1).max(255).trim(),
    supplier_phone: Joi.string().max(50).trim().allow(null, ''),
    supplier_location: Joi.string().max(1000).trim().allow(null, ''),
    bill_date: Joi.date().allow(null),
    total_amount: Joi.number().required().min(0),
    image_url: Joi.string().uri().max(2048).allow(null, ''),
    notes: Joi.string().max(5000).trim().allow(null, ''),
    items: Joi.array().items(
      Joi.object({
        plant_name: Joi.string().required().min(1).max(255).trim(),
        quantity: Joi.number().integer().min(1).allow(null),
        price: Joi.number().required().min(0),
        total_price: Joi.number().required().min(0),
        size: Joi.string().max(100).trim().allow(null, ''),
        notes: Joi.string().max(1000).trim().allow(null, '')
      })
    ).min(1)
  }),

  // AI Agent schemas
  scrapeWebsite: Joi.object({
    websiteId: Joi.string().required(),
    url: Joi.string().uri().required()
  }),

  analyzeText: Joi.object({
    text: Joi.string().required().min(1).max(50000),
    sourceType: Joi.string().valid('Facebook', 'Website', 'Text').default('Text')
  }),

  // Route optimization schema
  optimizeRoute: Joi.object({
    projectLocation: Joi.string().required().min(1).max(1000).trim(),
    selectedSuppliers: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        location: Joi.string().required(),
        items: Joi.array().items(Joi.object()).default([]),
        totalValue: Joi.number().min(0).default(0)
      })
    ).min(1).required()
  }),

  // Google Maps search schema
  searchMaps: Joi.object({
    keywords: Joi.string().required().min(1).max(5000),
    filterWholesale: Joi.boolean().default(false)
  }),

  // Query parameters
  queryParams: {
    search: Joi.string().max(255).trim().allow(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    sort: Joi.string().valid('name', 'price', 'created_at').default('name'),
    order: Joi.string().valid('asc', 'desc').default('asc')
  }
};

module.exports = {
  validate,
  schemas
};

