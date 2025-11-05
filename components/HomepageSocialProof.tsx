"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function HomepageSocialProof() {
  // Prevent right-click context menu on images
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Array of avatar data - you can replace these URLs with actual user photos
  const avatars = [
    {
      src: "/homepagesocialproof/diego.webp",
      alt: "User 1",
      fallback: "U1",
    },
    {
      src: "/homepagesocialproof/Sanish.webp",
      alt: "User 2",
      fallback: "U2",
    },
    {
      src: "/homepagesocialproof/Christian.webp",
      alt: "User 3",
      fallback: "U3",
    },
    {
      src: "/homepagesocialproof/ali.webp",
      alt: "User 4",
      fallback: "U4",
    },
    {
      src: "/homepagesocialproof/Hasibullah.webp",
      alt: "User 5",
      fallback: "U5",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Overlapping Avatars */}
      <div
        className="flex -space-x-3 select-none"
        onContextMenu={handleContextMenu}
      >
        {avatars.map((avatar, index) => (
          <Avatar
            key={index}
            className="w-10 h-10 border-1 border-background ring-2 ring-background"
          >
            <AvatarImage
              src={avatar.src}
              alt={avatar.alt}
              className="object-cover select-none pointer-events-none"
              draggable={false}
            />
            <AvatarFallback className="bg-gradient-hero text-white">
              {avatar.fallback}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Stars and Text */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="w-3 h-3 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <p className="text-sm text-foreground font-medium">
          Loved by 500+ AI job seekers
        </p>
      </div>
    </div>
  );
}
