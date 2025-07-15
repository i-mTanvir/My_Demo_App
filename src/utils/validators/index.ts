import { VALIDATION } from '../constants';

// Base validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// Generic field validator
export const validateField = (
  value: any,
  rules: FieldValidation,
  fieldName: string = 'Field'
): ValidationResult => {
  const errors: string[] = [];

  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true, errors: [] };
  }

  // String validations
  if (typeof value === 'string') {
    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${fieldName} format is invalid`);
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  return validateField(email, {
    required: true,
    pattern: VALIDATION.EMAIL.PATTERN,
  }, 'Email');
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters long`);
  }

  if (VALIDATION.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (VALIDATION.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (VALIDATION.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (VALIDATION.PASSWORD.REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Phone validation
export const validatePhone = (phone: string): ValidationResult => {
  return validateField(phone, {
    pattern: VALIDATION.PHONE.PATTERN,
  }, 'Phone number');
};

// SKU validation
export const validateSKU = (sku: string): ValidationResult => {
  return validateField(sku, {
    required: true,
    minLength: VALIDATION.SKU.MIN_LENGTH,
    maxLength: VALIDATION.SKU.MAX_LENGTH,
    pattern: VALIDATION.SKU.PATTERN,
  }, 'SKU');
};

// Product validation
export interface ProductData {
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  category_id: string;
  barcode?: string;
}

export const validateProduct = (product: ProductData): ValidationResult => {
  const errors: string[] = [];

  // Name validation
  const nameValidation = validateField(product.name, {
    required: true,
    minLength: 2,
    maxLength: 100,
  }, 'Product name');
  errors.push(...nameValidation.errors);

  // SKU validation
  const skuValidation = validateSKU(product.sku);
  errors.push(...skuValidation.errors);

  // Price validation
  if (typeof product.price !== 'number' || product.price < 0) {
    errors.push('Price must be a positive number');
  }

  // Cost validation
  if (typeof product.cost !== 'number' || product.cost < 0) {
    errors.push('Cost must be a positive number');
  }

  // Category validation
  if (!product.category_id) {
    errors.push('Category is required');
  }

  // Description validation (optional)
  if (product.description) {
    const descValidation = validateField(product.description, {
      maxLength: 500,
    }, 'Description');
    errors.push(...descValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Customer validation
export interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
}

export const validateCustomer = (customer: CustomerData): ValidationResult => {
  const errors: string[] = [];

  // Name validation
  const nameValidation = validateField(customer.name, {
    required: true,
    minLength: 2,
    maxLength: 100,
  }, 'Customer name');
  errors.push(...nameValidation.errors);

  // Email validation (optional)
  if (customer.email) {
    const emailValidation = validateEmail(customer.email);
    errors.push(...emailValidation.errors);
  }

  // Phone validation (optional)
  if (customer.phone) {
    const phoneValidation = validatePhone(customer.phone);
    errors.push(...phoneValidation.errors);
  }

  // Company validation (optional)
  if (customer.company) {
    const companyValidation = validateField(customer.company, {
      maxLength: 100,
    }, 'Company');
    errors.push(...companyValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Inventory validation
export interface InventoryData {
  product_id: string;
  location_id: string;
  quantity: number;
  reorder_point?: number;
  max_stock?: number;
}

export const validateInventory = (inventory: InventoryData): ValidationResult => {
  const errors: string[] = [];

  // Product ID validation
  if (!inventory.product_id) {
    errors.push('Product is required');
  }

  // Location ID validation
  if (!inventory.location_id) {
    errors.push('Location is required');
  }

  // Quantity validation
  if (typeof inventory.quantity !== 'number' || inventory.quantity < 0) {
    errors.push('Quantity must be a non-negative number');
  }

  // Reorder point validation (optional)
  if (inventory.reorder_point !== undefined) {
    if (typeof inventory.reorder_point !== 'number' || inventory.reorder_point < 0) {
      errors.push('Reorder point must be a non-negative number');
    }
  }

  // Max stock validation (optional)
  if (inventory.max_stock !== undefined) {
    if (typeof inventory.max_stock !== 'number' || inventory.max_stock < 0) {
      errors.push('Max stock must be a non-negative number');
    }
    
    if (inventory.reorder_point !== undefined && inventory.max_stock < inventory.reorder_point) {
      errors.push('Max stock must be greater than or equal to reorder point');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Sale validation
export interface SaleData {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  discount?: number;
  tax_rate?: number;
  notes?: string;
}

export const validateSale = (sale: SaleData): ValidationResult => {
  const errors: string[] = [];

  // Items validation
  if (!sale.items || sale.items.length === 0) {
    errors.push('At least one item is required');
  } else {
    sale.items.forEach((item, index) => {
      if (!item.product_id) {
        errors.push(`Item ${index + 1}: Product is required`);
      }
      
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be a positive number`);
      }
      
      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Item ${index + 1}: Price must be a non-negative number`);
      }
    });
  }

  // Discount validation (optional)
  if (sale.discount !== undefined) {
    if (typeof sale.discount !== 'number' || sale.discount < 0 || sale.discount > 100) {
      errors.push('Discount must be between 0 and 100');
    }
  }

  // Tax rate validation (optional)
  if (sale.tax_rate !== undefined) {
    if (typeof sale.tax_rate !== 'number' || sale.tax_rate < 0 || sale.tax_rate > 100) {
      errors.push('Tax rate must be between 0 and 100');
    }
  }

  // Notes validation (optional)
  if (sale.notes) {
    const notesValidation = validateField(sale.notes, {
      maxLength: 500,
    }, 'Notes');
    errors.push(...notesValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Form validation helper
export const validateForm = <T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<keyof T, string[]> } => {
  const errors = {} as Record<keyof T, string[]>;
  let isValid = true;

  Object.keys(validators).forEach((key) => {
    const validator = validators[key as keyof T];
    const result = validator(data[key as keyof T]);
    
    if (!result.isValid) {
      errors[key as keyof T] = result.errors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Async validation helper
export const validateAsync = async <T>(
  value: T,
  validator: (value: T) => Promise<ValidationResult>
): Promise<ValidationResult> => {
  try {
    return await validator(value);
  } catch (error) {
    return {
      isValid: false,
      errors: ['Validation error occurred'],
    };
  }
};