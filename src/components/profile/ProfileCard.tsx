
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';

interface ProfileCardProps {
  user: any;
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
  };
  avatarUrl: string | null;
  handleAvatarUpdate: (url: string) => void;
  signOut: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  profileData,
  avatarUrl,
  handleAvatarUpdate,
  signOut
}) => {
  return (
    <Card className="w-full md:w-80">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          {user && (
            <AvatarUpload 
              uid={user.id}
              url={avatarUrl}
              onUploadComplete={handleAvatarUpdate}
              size="lg"
              showUploadButton={true}
            />
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">{profileData.firstName} {profileData.lastName}</p>
          <p className="text-sm text-muted-foreground">{profileData.email}</p>
        </div>
        <div className="bg-muted/30 rounded-lg px-4 py-3 w-full text-center">
          <p className="text-xs text-muted-foreground">Member since</p>
          <p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</p>
        </div>
        <Button variant="outline" className="w-full" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
