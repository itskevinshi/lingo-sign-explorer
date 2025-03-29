
import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, BookOpen, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="space-y-12 py-6 animate-fade-in">
      <section className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex justify-center items-center p-3 rounded-full bg-accent/10 text-accent mb-2">
          <Hand size={32} className="animate-pulse-light" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Learn American Sign Language <span className="text-accent">Interactively</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Master ASL through our interactive platform with real-time feedback and structured lessons
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/lessons">
            <Button size="lg" className="group">
              Start Learning 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/auth/signup">
            <Button size="lg" variant="outline">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="card-hover">
            <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
              <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-semibold">Structured Lessons</h3>
              <p className="text-muted-foreground">
                Progress through carefully designed lessons covering the ASL alphabet and common phrases
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
              <div className="p-3 rounded-full bg-primary/20 text-primary">
                <Hand size={24} />
              </div>
              <h3 className="text-xl font-semibold">Interactive Practice</h3>
              <p className="text-muted-foreground">
                Practice signs with your webcam and receive immediate feedback on your technique
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
              <div className="p-3 rounded-full bg-accent/20 text-accent">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-semibold">Track Progress</h3>
              <p className="text-muted-foreground">
                Earn XP, unlock achievements, and monitor your progress as you master ASL
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-4xl mx-auto bg-card rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold">Why Learn ASL?</h2>
            <p className="text-muted-foreground">
              American Sign Language is a complete, natural language expressed by movements of the hands and face. Learning ASL helps bridge communication gaps and creates a more inclusive world.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-accent/20 p-1 mt-0.5">
                  <ArrowRight size={12} className="text-accent" />
                </div>
                <span>Connect with the deaf and hard-of-hearing community</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-accent/20 p-1 mt-0.5">
                  <ArrowRight size={12} className="text-accent" />
                </div>
                <span>Develop a valuable communication skill</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-accent/20 p-1 mt-0.5">
                  <ArrowRight size={12} className="text-accent" />
                </div>
                <span>Enhance cognitive abilities and spatial awareness</span>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 bg-muted p-6 rounded-lg flex items-center justify-center">
            <div className="text-6xl font-bold text-center space-y-4">
              <div className="flex justify-center gap-4">
                <span className="bg-accent/20 text-accent p-2 rounded-lg">A</span>
                <span className="bg-primary/20 text-primary p-2 rounded-lg">S</span>
                <span className="bg-secondary/20 text-secondary p-2 rounded-lg">L</span>
              </div>
              <p className="text-base text-muted-foreground">
                Start your ASL journey today
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
