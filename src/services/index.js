/**
 * Services Barrel Export
 * Central export point for all application services
 */

// Auth services
export { authService } from './auth/auth.service';
export { sessionService } from './auth/session.service';

// Data services
export { productsService } from './data/products.service';
export { categoriesService } from './data/categories.service';
export { usersService } from './data/users.service';
export { addressService } from './data/users.service';
export { profileService } from './data/profile.service';
export { ordersService } from './data/orders.service';
export { paymentService } from './data/payment.service';

// Roles and permissions services
export { rolesService } from './roles/roles.service';

// Configuration
export { default as supabase } from '../config/supabase';
