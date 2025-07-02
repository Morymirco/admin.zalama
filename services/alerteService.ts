import { createSupabaseService } from './supabaseService';
import { Alerte } from '@/types/alerte';

const alerteService = createSupabaseService<Alerte>('alertes');

export { alerteService }; 