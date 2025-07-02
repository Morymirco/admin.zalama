import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mspmrzlqhwpdkkburjiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcG1yemxxaHdwZGtrYnVyaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODcyNTgsImV4cCI6MjA2NjM2MzI1OH0.zr-TRpKjGJjW0nRtsyPcCLy4Us-c5tOGX71k5_3JJd0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const employeePhotoService = {
  async uploadPhoto(file: File, employeeId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('employee-photos')
        .upload(fileName, file);
      
      if (error) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Erreur dans uploadPhoto:', error);
      throw error;
    }
  },
  
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      const fileName = photoUrl.split('/').pop();
      if (!fileName) return;
      
      const { error } = await supabase.storage
        .from('employee-photos')
        .remove([fileName]);
      
      if (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deletePhoto:', error);
      throw error;
    }
  },
  
  async updateEmployeePhoto(employeeId: string, photoUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ photo_url: photoUrl })
        .eq('id', employeeId);
      
      if (error) {
        console.error('Erreur lors de la mise à jour de la photo:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans updateEmployeePhoto:', error);
      throw error;
    }
  },

  async uploadPhotoViaAPI(file: File, employeeId: string, updateDatabase: boolean = false): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('employeeId', employeeId);
      formData.append('updateDatabase', updateDatabase.toString());
      
      const response = await fetch('/api/upload-employee-photo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data.photoUrl;
    } catch (error) {
      console.error('Erreur dans uploadPhotoViaAPI:', error);
      throw error;
    }
  }
}; 