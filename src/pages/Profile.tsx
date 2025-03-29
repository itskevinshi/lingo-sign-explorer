
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, User, Shield, RotateCcw, LogOut, Loader2, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { supabase } from '@/integrations/supabase/client';
import AvatarUpload from '@/components/AvatarUpload';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const Profile = () => {
  const { toast } = useToast();
  const { user, signOut, isLoading } = useAuth();
  const { progress, resetProgress, isLessonCompleted } = useProgress();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<Record<string, boolean>>({});
  const [selectLessonsDialogOpen, setSelectLessonsDialogOpen] = useState(false);
  
  // Get the list of all completed lessons for the reset specific lessons dialog
  const completedLessonsList = Object.keys(progress.completedLessons).filter(id => 
    progress.completedLessons[id]
  );

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !isLoading) {
      navigate('/auth/login');
      return;
    }

    if (user) {
      // Set email from auth
      setProfileData(prev => ({ ...prev, email: user.email || '' }));
      
      // Fetch profile data
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (error) throw error;
          
          if (data) {
            setProfileData(prev => ({
              ...prev,
              firstName: data.first_name || '',
              lastName: data.last_name || '',
            }));
            setAvatarUrl(data.avatar_url);
            setProfileId(data.id);
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error.message);
          toast({
            title: 'Error loading profile',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setProfileLoading(false);
        }
      };
      
      fetchProfile();
    }
  }, [user, isLoading, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Handle password change if provided
      if (profileData.newPassword && profileData.currentPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileData.newPassword,
        });
        
        if (passwordError) throw passwordError;
        
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAllProgress = async () => {
    setIsResetting(true);
    try {
      await resetProgress();
      toast({
        title: "Progress Reset",
        description: "Your learning progress has been reset successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset progress",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const resetSelectedLessons = async () => {
    setIsResetting(true);
    try {
      // Filter only selected lessons
      const lessonsToReset = Object.keys(selectedLessons).filter(id => selectedLessons[id]);
      
      if (lessonsToReset.length === 0) {
        throw new Error("No lessons selected");
      }
      
      // Create a new completedLessons object without the selected lessons
      const updatedCompletedLessons = { ...progress.completedLessons };
      lessonsToReset.forEach(lessonId => {
        delete updatedCompletedLessons[lessonId];
      });
      
      // Update in Supabase
      if (user) {
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed_lessons: updatedCompletedLessons
          })
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
      // Close the dialog and reset selection
      setSelectLessonsDialogOpen(false);
      setSelectedLessons({});
      
      toast({
        title: "Lessons Reset",
        description: `Successfully reset ${lessonsToReset.length} selected lessons.`,
      });
      
      // Force a reload to refresh the progress context
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset selected lessons",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const getInitials = () => {
    const first = profileData.firstName.charAt(0);
    const last = profileData.lastName.charAt(0);
    return first && last ? `${first}${last}` : 'U';
  };

  const handleAvatarUpdate = (url: string) => {
    setAvatarUrl(url);
  };

  if (isLoading || profileLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
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

        <div className="flex-1">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="resetProgress">Reset Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-6">
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
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
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
            </TabsContent>
            
            <TabsContent value="resetProgress" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reset Progress</CardTitle>
                  <CardDescription>Clear your learning data and start fresh</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      Resetting your progress will erase all your completed lessons, achievements, and statistics. This action cannot be undone.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="mr-3 bg-muted p-2 rounded-full">
                          <RotateCcw className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">Reset All Progress</h3>
                          <p className="text-sm text-muted-foreground">Clear all your learning data and start from the beginning</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="mt-2">
                                Reset All Data
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will permanently delete all your progress, achievements, and statistics.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={handleResetAllProgress}
                                  disabled={isResetting}
                                >
                                  {isResetting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Resetting...
                                    </>
                                  ) : (
                                    'Yes, reset everything'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="mr-3 bg-muted p-2 rounded-full">
                          <RotateCcw className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">Reset Specific Lessons</h3>
                          <p className="text-sm text-muted-foreground">Clear progress for individual lessons</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setSelectLessonsDialogOpen(true)}
                            disabled={completedLessonsList.length === 0}
                          >
                            Select Lessons
                          </Button>
                          
                          <Dialog open={selectLessonsDialogOpen} onOpenChange={setSelectLessonsDialogOpen}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Select lessons to reset</DialogTitle>
                                <DialogDescription>
                                  Choose the lessons you want to reset. This will mark them as incomplete.
                                </DialogDescription>
                              </DialogHeader>
                              
                              {completedLessonsList.length > 0 ? (
                                <ScrollArea className="h-[200px] border rounded-md p-2">
                                  <div className="space-y-2">
                                    {completedLessonsList.map(lessonId => (
                                      <div key={lessonId} className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={lessonId} 
                                          checked={selectedLessons[lessonId] || false}
                                          onCheckedChange={() => toggleLessonSelection(lessonId)}
                                        />
                                        <label htmlFor={lessonId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                          {lessonId}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                  <p className="text-muted-foreground">No completed lessons found.</p>
                                </div>
                              )}
                              
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectLessonsDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={resetSelectedLessons}
                                  disabled={isResetting || Object.values(selectedLessons).filter(Boolean).length === 0}
                                >
                                  {isResetting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Resetting...
                                    </>
                                  ) : (
                                    'Reset Selected Lessons'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
