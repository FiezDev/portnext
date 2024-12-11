'use client';

import { Button } from '@/components/ui/button';
import { GithubIcon, LinkedinIcon, TwitterIcon } from 'lucide-react';

export function PortfolioHero() {
  return (
    <section className="text-center space-y-8">
      <h1 className="text-4xl font-bold sm:text-6xl">
        Full Stack Developer & Designer
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Building beautiful, functional, and scalable web applications with modern technologies.
      </p>
      <div className="flex justify-center gap-4">
        <Button size="lg">View Projects</Button>
        <Button size="lg" variant="outline">
          Contact Me
        </Button>
      </div>
      <div className="flex justify-center gap-4">
        <Button variant="ghost" size="icon">
          <GithubIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <LinkedinIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <TwitterIcon className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}