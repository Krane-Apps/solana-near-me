// Firebase configuration
export { default as db, COLLECTIONS } from './config';

// Firebase services
export {
  MerchantService,
  TransactionService,
  UserService,
  RewardService,
  AchievementService,
  type Transaction,
  type User,
  type Reward,
  type Achievement,
} from './services';

// Firebase hooks
export {
  useMerchants,
  useUser,
  useUserTransactions,
  useUserRewards,
  useAchievements,
  usePaymentProcessor,
} from './hooks'; 