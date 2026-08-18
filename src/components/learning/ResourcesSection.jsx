import React, { useState } from 'react';
import { BookOpen, Play, ExternalLink, ChevronDown, X } from 'lucide-react';
import { RESOURCES } from '@/lib/resources';

function VideoResource({ item }) {
  const [open, setOpen] = useState(false);
  const embedSrc = `https://www.youtube.com/embed/${item.videoId}?rel=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${item.videoId}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-muted/30 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Play className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Watch</p>
          <p className="text-base font-semibold text-foreground mt-0.5">{item.title}</p>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={embedSrc}
                title={item.title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white underline underline-offset-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open on YouTube
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function LinkResource({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card text-left transition-colors hover:border-primary/40 hover:bg-primary/5 group"
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </div>
    </a>
  );
}

export default function ResourcesSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between mb-1 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold tracking-tight">Resources</h2>
            <p className="text-sm text-muted-foreground">
              Reference videos and links to support your sessions
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-5 space-y-6">
          {RESOURCES.map((group) => (
            <div key={group.topic}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.topic}
                </h3>
                <div className="flex-1 h-px bg-border/60" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((item, i) =>
                  item.type === 'video' ? (
                    <div key={i} className="sm:col-span-2">
                      <VideoResource item={item} />
                    </div>
                  ) : (
                    <LinkResource key={i} item={item} />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}