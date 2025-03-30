
import React from 'react';
import PathwayCard from './PathwayCard';
import { Coffee, Users, ShoppingBag, Briefcase, Heart, Utensils, Map, MessageCircle } from 'lucide-react';

const PathwaysSection: React.FC = () => {
  const pathways = [
    {
      title: 'Meet & Greet',
      description: 'Learn essential signs for introducing yourself and meeting new people',
      icon: <Users className="h-5 w-5" />,
      difficulty: 'beginner',
    },
    {
      title: 'At the Coffee Shop',
      description: 'Master ordering drinks and snacks at your local café',
      icon: <Coffee className="h-5 w-5" />,
      difficulty: 'beginner',
    },
    {
      title: 'Shopping Essentials',
      description: 'Learn how to navigate stores and ask for assistance',
      icon: <ShoppingBag className="h-5 w-5" />,
      difficulty: 'beginner',
    },
    {
      title: 'In the Workplace',
      description: 'Professional signs for effective communication at work',
      icon: <Briefcase className="h-5 w-5" />,
      difficulty: 'intermediate',
    },
    {
      title: 'Health & Wellbeing',
      description: 'Communicate about health, emotions, and personal needs',
      icon: <Heart className="h-5 w-5" />,
      difficulty: 'intermediate',
    },
    {
      title: 'Dining Out',
      description: 'Restaurant vocabulary and conversation skills',
      icon: <Utensils className="h-5 w-5" />,
      difficulty: 'intermediate',
    },
    {
      title: 'Travel & Directions',
      description: 'Navigate and ask for directions in any situation',
      icon: <Map className="h-5 w-5" />,
      difficulty: 'advanced',
    },
    {
      title: 'Deep Conversations',
      description: 'Express complex ideas and engage in meaningful discussions',
      icon: <MessageCircle className="h-5 w-5" />,
      difficulty: 'advanced',
    },
  ];

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Sign Mastery Pathways</h2>
        <p className="text-muted-foreground">
          Real-world conversation skills organized by context
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pathways.map((pathway, index) => (
          <PathwayCard
            key={index}
            title={pathway.title}
            description={pathway.description}
            icon={pathway.icon}
            difficulty={pathway.difficulty as 'beginner' | 'intermediate' | 'advanced'}
          />
        ))}
      </div>
    </section>
  );
};

export default PathwaysSection;
