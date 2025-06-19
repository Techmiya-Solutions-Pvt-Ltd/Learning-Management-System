import React, { useEffect, useState } from 'react';
import { Mail, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<null | {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  }>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="flex flex-col items-center pb-0">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-primary-foreground">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </span>
            </div>
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            <Badge variant="secondary" className="mt-2 capitalize">
              {user.role}
            </Badge>
          </CardHeader>

          <CardContent className="mt-6 space-y-4">
            <div className="flex items-center justify-center text-sm">
              <User size={18} className="mr-2 text-muted-foreground" />
              <span>{user.username}</span>
            </div>
            <div className="flex items-center justify-center text-sm">
              <Mail size={18} className="mr-2 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
