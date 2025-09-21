'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, MapPin, Building, Users, BookOpen, Star } from "lucide-react";

type TGitHubProfile = {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  company: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
};

type TGitHubProfileCardProps = {
  username: string;
  children: React.ReactNode;
  className?: string;
};

export function GitHubProfileCard({ username, children, className = "" }: TGitHubProfileCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [profile, setProfile] = useState<TGitHubProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isHovered && !profile && !isLoading) {
      setIsLoading(true);
      fetch(`https://api.github.com/users/${username}`)
        .then(response => response.json())
        .then(data => {
          setProfile(data);
        })
        .catch(error => {
          console.error('Failed to fetch GitHub profile:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isHovered, profile, isLoading, username]);

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full z-50 w-80 max-w-[90vw]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Invisible bridge to prevent hover loss */}
            <div className="h-3 w-full" />
            
            {/* GitHub profile card */}
            <div className="bg-card border border-border rounded-lg shadow-xl overflow-hidden">
              {isLoading ? (
                <div className="p-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                </div>
              ) : profile ? (
                <>
                  {/* Header with avatar */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-start gap-3">
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.name || profile.login} avatar`}
                        className="w-16 h-16 rounded-full border-2 border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-foreground truncate">
                          {profile.name || profile.login}
                        </h3>
                        <p className="text-sm text-muted-foreground">@{profile.login}</p>
                        {profile.bio && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {profile.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info section */}
                  <div className="p-4 space-y-3">
                    {/* Location and company */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {profile.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {profile.location}
                        </span>
                      )}
                      {profile.company && (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          {profile.company}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-medium">{profile.public_repos}</span> repositories
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-medium">{profile.followers}</span> followers
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      View profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="text-xs text-muted-foreground">
                      GitHub profile
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Failed to load profile
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
