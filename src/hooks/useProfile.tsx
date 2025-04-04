
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, ProfileFormValues } from '@/types/supabase-adapter';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      // @ts-ignore - Ignore type errors for Supabase query
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // If we have a profile, map it to our UserProfile interface; otherwise create a default one
      const userProfile: UserProfile = data 
        ? {
            id: data.id,
            email: user.email || '',
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role,
            avatar_url: data.avatar_url,
            created_at: data.created_at,
            updated_at: data.updated_at
          }
        : {
            id: user.id,
            email: user.email || '',
            firstName: null,
            lastName: null,
            role: 'user'
          };

      setProfile(userProfile);
      
      // If no profile exists yet, create one
      if (!data) {
        await createProfile(userProfile);
      }
      
      return userProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userProfile: UserProfile) => {
    try {
      // @ts-ignore - Ignore type errors for Supabase query
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userProfile.id,
          email: userProfile.email,
          first_name: userProfile.firstName,
          last_name: userProfile.lastName,
          role: userProfile.role || 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
    }
  };

  const updateProfile = async (values: ProfileFormValues) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Map our interface fields to database column names
      // @ts-ignore - Ignore type errors for Supabase query
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
