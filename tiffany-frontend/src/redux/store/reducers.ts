/**
 * Store Reducers Configuration
 * Centralized configuration for all Redux reducers
 */

import authReducer from "../features/auth/store/slice/auth-slice";
import usersReducer from "../features/auth/store/slice/users-slice";

import bannerReducer from "../features/master-data/store/slice/banner-slice";
import categoriesReducer from "../features/master-data/store/slice/categories-slice";

import favoritesReducer from "../features/main/store/slice/favorite-slice";
import productReducer from "../features/business/store/slice/product-slice";
import orderAdminReducer from "../features/business/store/slice/order-admin-slice";
import bulkPromotionReducer from "../features/business/store/slice/bulk-promotion-slice";
import promotionSizeSelectionReducer from "../features/business/store/slice/promotion-size-selection-slice";
import businessSettingsReducer from "../features/business/store/slice/business-settings-slice";
import homeReducer from "../features/main/store/slice/home-slice";
import publicProductReducer from "../features/main/store/slice/public-product-slice";
import publicCategoriesReducer from "../features/main/store/slice/public-categories-slice";
import myOrdersReducer from "../features/main/store/slice/my-orders-slice";
import scrollReducer from "../features/main/store/slice/scroll-slice";
import cartReducer from "../features/main/store/slice/cart-slice";
import globalSettingsReducer from "./slices/global-settings-slice";
import locationReducer from "../features/location/store/slice/location-slice";
import publicLocationReducer from "../features/location/store/slice/public-location-slice";

/**
 * Root reducer configuration
 * Add new feature reducers here
 */
export const reducers = {
  // Global Settings
  globalSettings: globalSettingsReducer,

  // Auth
  auth: authReducer,
  users: usersReducer,

  // Master Data (Admin)
  banner: bannerReducer,
  categories: categoriesReducer,

  // Business
  businessSettings: businessSettingsReducer,
  products: productReducer,
  ordersAdmin: orderAdminReducer,
  bulkPromotion: bulkPromotionReducer,
  promotionSizeSelection: promotionSizeSelectionReducer,

  // Main/Public
  home: homeReducer,
  publicProducts: publicProductReducer,
  publicCategories: publicCategoriesReducer,
  myOrders: myOrdersReducer,
  scroll: scrollReducer,
  favorites: favoritesReducer,
  cart: cartReducer,

  // Location
  location: locationReducer,
  publicLocation: publicLocationReducer,
};
