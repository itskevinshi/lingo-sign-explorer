
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface NotificationsTabProps {
  handleSaveProfile: () => Promise<void>;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ handleSaveProfile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Daily Reminders</Label>
            <p className="text-sm text-muted-foreground">Receive daily reminders to practice</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Achievement Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified when you earn achievements</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Updates</Label>
            <p className="text-sm text-muted-foreground">Receive weekly progress reports via email</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Content Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified when new lessons are available</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveProfile}>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationsTab;
