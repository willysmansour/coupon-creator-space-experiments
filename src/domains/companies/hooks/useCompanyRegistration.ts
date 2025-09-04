import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Get user-friendly error messages
const getErrorMessage = (error: any): string => {
  if (!error?.message) return "Ett oväntat fel uppstod vid registreringen";
  
  if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
    return "Ett konto med denna e-postadress finns redan";
  }
  
  if (error.message.includes('invalid email')) {
    return "Ogiltig e-postadress";
  }

  return error?.message || "Ett oväntat fel uppstod vid registreringen";
};

// Create company and assign admin (for company registration)
export const useRegisterCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      email,
      password,
      companyName,
      firstName,
      lastName,
      logo
    }: {
      email: string;
      password: string;
      companyName: string;
      firstName?: string;
      lastName?: string;
      logo?: string;
    }) => {
      // Create the auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            company_name: companyName,
            first_name: firstName || companyName,
            last_name: lastName || 'Admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Wait a moment for the database trigger to create the company
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the company that was created by the database trigger
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_user_id', authData.user.id)
        .single();

      if (companyError) throw companyError;

      // Role assignment is handled by the database trigger automatically

      // Create QR code data for the company
      const qrUrl = `${window.location.origin}/company/${companyData.id}`;
      
      // Store QR code data in companies table
      await supabase
        .from('companies')
        .update({ 
          qr_code_url: qrUrl,
          qr_code_created_at: new Date().toISOString()
        })
        .eq('id', companyData.id);

      return { user: authData.user, company: companyData, qrCodeUrl: qrUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['company-aware-companies'] });
      
      toast.success(`Company registered successfully! Your QR code is ready at: ${data.qrCodeUrl}`);
      toast.info('Your QR code has been automatically generated and is ready to use!', {
        duration: 5000,
      });
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      toast.error('Registration failed: ' + message);
    }
  });
};
