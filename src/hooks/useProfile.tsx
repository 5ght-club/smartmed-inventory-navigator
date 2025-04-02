
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, ProfileFormValues } from '@/types/profile';
import { toast } from 'sonner';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Convert database format to our application format
      const userProfile: UserProfile = {
        id: data.id,
        email: data.email || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        role: data.role || 'user',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (values: ProfileFormValues) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      toast.success('Profile updated successfully');
      await fetchProfile(); // Refresh the profile data
      return { success: true };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, fetchProfile, updateProfile };
};
