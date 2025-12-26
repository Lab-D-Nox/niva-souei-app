import { Link } from "wouter";
import { Heart, Eye, MessageCircle, Play, Music, FileText, Globe, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkCardProps {
  work: {
    id: number;
    type: string;
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    origin: string;
    serviceTier?: string | null;
    likeCount: number;
    commentCount: number;
    viewCount: number;
  };
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Play className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
  web: <Globe className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  image: "画像",
  video: "動画",
  audio: "音声",
  text: "テキスト",
  web: "Webサイト",
};

const serviceTierLabels: Record<string, string> = {
  spot: "Spot Concept",
  standard: "Standard Translation",
  grand: "Grand Story",
};

export function WorkCard({ work, className }: WorkCardProps) {
  return (
    <Link href={`/works/${work.id}`}>
      <article
        className={cn(
          "group bg-card rounded-xl overflow-hidden border border-border/50 hover-lift cursor-pointer",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {work.thumbnailUrl ? (
            <img
              src={work.thumbnailUrl}
              alt={work.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {typeIcons[work.type] || <ImageIcon className="h-12 w-12" />}
            </div>
          )}
          
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {typeIcons[work.type]}
              <span className="ml-1">{typeLabels[work.type]}</span>
            </Badge>
          </div>
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                work.origin === "client" ? "badge-client" : "badge-personal"
              )}
            >
              {work.origin === "client" ? "受注作品" : "個人作品"}
            </Badge>
            {work.serviceTier && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  work.serviceTier === "spot" && "badge-spot",
                  work.serviceTier === "standard" && "badge-standard",
                  work.serviceTier === "grand" && "badge-grand"
                )}
              >
                {serviceTierLabels[work.serviceTier]}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {work.title}
          </h3>

          {/* Description */}
          {work.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {work.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {work.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {work.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {work.viewCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Skeleton for loading state
export function WorkCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4">
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-full bg-muted rounded mb-1" />
        <div className="h-4 w-2/3 bg-muted rounded mb-3" />
        <div className="flex gap-4">
          <div className="h-4 w-12 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
