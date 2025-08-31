import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Get all profiles
export const useProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
};

// Get current user profile
export const useCurrentProfile = () => {
  return useQuery({
    queryKey: ["current-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
  });
};

// Create or update profile
export const useUpsertProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Du är inte inloggad.");
      }

      const payload = { ...profile, user_id: user.id };

      // Try to insert first, if it fails due to conflict, then update
      const { data, error } = await supabase
        .from("profiles")
        .upsert(payload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["current-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      
      // Update cache directly for immediate UI update
      queryClient.setQueryData(["current-profile"], data);
    },
  });
};

// Upload profile image
export const uploadProfileImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `profiles/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath);

  return data.publicUrl;
};