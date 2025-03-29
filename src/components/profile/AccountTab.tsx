
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AccountTabProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: () => Promise<void>;
  isUpdating: boolean;
}

const AccountTab: React.FC<AccountTabProps> = ({
  profileData,
  handleInputChange,
  handleSaveProfile,
  isUpdating,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              placeholder="First Name" 
              value={profileData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              placeholder="Last Name" 
              value={profileData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Email" 
            value={profileData.email}
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input 
            id="currentPassword" 
            type="password" 
            placeholder="Enter current password" 
            value={profileData.currentPassword}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type="password" 
              placeholder="Enter new password" 
              value={profileData.newPassword}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm new password"
              value={profileData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveProfile}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountTab;
