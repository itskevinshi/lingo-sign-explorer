
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hand, BookOpen, BarChart, User, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { name: 'Home', path: '/', icon: <Hand className="h-5 w-5" /> },
  { name: 'Lessons', path: '/lessons', icon: <BookOpen className="h-5 w-5" /> },
  { name: 'Progress', path: '/progress', icon: <BarChart className="h-5 w-5" /> },
  { name: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
];

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const handleNavigation = () => {
    if (open) setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Hand className="h-8 w-8 text-accent" />
          <span className="text-xl font-bold tracking-tight text-primary">SignLingo</span>
        </Link>

        {isMobile ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-60">
              <div className="flex flex-col gap-6 py-6">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavigation}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                        location.pathname === item.path
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-2">
                  <Link to="/auth/login" onClick={handleNavigation}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth/signup" onClick={handleNavigation}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-2 ml-4">
              <Link to="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;
