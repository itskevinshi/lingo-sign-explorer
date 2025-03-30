
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CommunityStats } from '@/components/community/CommunityStats';
import { Leaderboards } from '@/components/community/Leaderboards';

const Community = () => {
  const [activeTab, setActiveTab] = useState<string>("stats");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">
          See how the SignLingo community is learning together!
        </p>
      </div>

      <Tabs defaultValue="stats" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="space-y-4 mt-6">
          <CommunityStats />
        </TabsContent>
        <TabsContent value="leaderboards" className="space-y-4 mt-6">
          <Leaderboards />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
