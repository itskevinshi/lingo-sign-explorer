
import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  uid: string;
  url: string | null;
  onUploadComplete: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  uid,
  url,
  onUploadComplete,
  size = 'md',
  showUploadButton = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const avatarSize = {
    sm: 'h-10 w-10',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  }[size];

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }[size];

  const getInitials = () => {
    return 'U';
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${uid}/${Math.random().toString(36).slice(2)}.${fileExt}`;

      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload JPEG, PNG, GIF or WEBP');
      }

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      if (data) {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', uid);

        if (updateError) throw updateError;

        onUploadComplete(publicUrl);
        
        toast({
          title: "Success",
          description: "Your profile picture has been updated.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while uploading your profile picture.",
        variant: "destructive",
      });
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={uploadAvatar}
        className="hidden"
        ref={fileInputRef}
        disabled={uploading}
      />
      
      <Avatar className={`${avatarSize} cursor-pointer group`} onClick={handleButtonClick}>
        <AvatarImage src={url || ''} alt="Profile picture" />
        <AvatarFallback className={`text-3xl bg-accent text-accent-foreground ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? <Loader2 className={`${iconSize} animate-spin`} /> : getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {/* Removed the camera button overlay */}
      
      {showUploadButton && (
        <Button 
          variant="outline" 
          className="mt-2 w-full text-xs"
          onClick={handleButtonClick}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-3 w-3" />
              Change Picture
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default AvatarUpload;
