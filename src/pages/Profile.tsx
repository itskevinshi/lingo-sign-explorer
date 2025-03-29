
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { supabase } from '@/integrations/supabase/client';

// Import the new components
import ProfileCard from '@/components/profile/ProfileCard';
import AccountTab from '@/components/profile/AccountTab';
import NotificationsTab from '@/components/profile/NotificationsTab';
import ResetProgressTab from '@/components/profile/ResetProgressTab';

const Profile = () => {
  const { toast } = useToast();
  const { user, signOut, isLoading } = useAuth();
  const { progress, resetProgress } = useProgress();
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
        <ProfileCard 
          user={user}
          profileData={profileData}
          avatarUrl={avatarUrl}
          handleAvatarUpdate={handleAvatarUpdate}
          signOut={signOut}
        />

        <div className="flex-1">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="resetProgress">Reset Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-6">
              <AccountTab 
                profileData={profileData}
                handleInputChange={handleInputChange}
                handleSaveProfile={handleSaveProfile}
                isUpdating={isUpdating}
              />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <NotificationsTab 
                handleSaveProfile={handleSaveProfile}
              />
            </TabsContent>
            
            <TabsContent value="resetProgress" className="mt-6">
              <ResetProgressTab 
                isResetting={isResetting}
                handleResetAllProgress={handleResetAllProgress}
                completedLessonsList={completedLessonsList}
                selectedLessons={selectedLessons}
                toggleLessonSelection={toggleLessonSelection}
                resetSelectedLessons={resetSelectedLessons}
                selectLessonsDialogOpen={selectLessonsDialogOpen}
                setSelectLessonsDialogOpen={setSelectLessonsDialogOpen}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
