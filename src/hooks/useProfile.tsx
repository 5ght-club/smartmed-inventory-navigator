
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, ProfileFormValues } from '@/types/supabase-adapter';
import { toast } from 'sonner';
import { profilesTable } from '@/types/supabase-adapter';

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
      const { data, error } = await profilesTable.getOne({ id: user.id });

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // If we have a profile, use it; otherwise create a default one
      const userProfile: UserProfile = data || {
        id: user.id,
        email: user.email || '',
        firstName: null,
        lastName: null,
        role: 'user'
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
      const { error } = await profilesTable.update({
        first_name: values.firstName,
        last_name: values.lastName,
        updated_at: new Date().toISOString()
      }, { id: user.id });

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
