
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResetProgressTabProps {
  isResetting: boolean;
  handleResetAllProgress: () => Promise<void>;
  completedLessonsList: string[];
  selectedLessons: Record<string, boolean>;
  toggleLessonSelection: (lessonId: string) => void;
  resetSelectedLessons: () => Promise<void>;
  selectLessonsDialogOpen: boolean;
  setSelectLessonsDialogOpen: (open: boolean) => void;
}

const ResetProgressTab: React.FC<ResetProgressTabProps> = ({
  isResetting,
  handleResetAllProgress,
  completedLessonsList,
  selectedLessons,
  toggleLessonSelection,
  resetSelectedLessons,
  selectLessonsDialogOpen,
  setSelectLessonsDialogOpen
}) => {
  return (
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
  );
};

export default ResetProgressTab;
