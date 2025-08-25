import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Upload company logo
export const uploadCompanyLogo = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `company-logos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Update company information
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, logo }: { id?: string; name: string; logo?: string }) => {
      if (id) {
        // Update existing company
        const { data, error } = await supabase
          .from("companies")
          .update({ name, logo })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new company
        const { data, error } = await supabase
          .from("companies")
          .insert({ name, logo })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};