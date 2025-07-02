import { createSupabaseService } from './supabaseService';
import { Notification } from '@/types/notification';

const notificationService = createSupabaseService<Notification>('notifications');

export { notificationService }; 