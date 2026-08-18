import React, { useState, useEffect } from 'react';
import { Play, X, Video, ExternalLink } from 'lucide-react';

export default function VideoCard({ videoId, title, description, start, end }) {
  const [open, setOpen] = useState(false);
  const hasVideo = Boolean(videoId);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  let embedSrc = '';
  let watchUrl = '';
  let isDrive = false;
  if (hasVideo) {
    if (videoId.startsWith('drive:')) {
      isDrive = true;
      const fileId = videoId.slice(6);
      embedSrc = `https://drive.google.com/file/d/${fileId}/preview`;
      watchUrl = `https://drive.google.com/file/d/${fileId}/view`;
    } else {
      const params = new URLSearchParams({ rel: '0' });
      if (start) params.set('start', String(start));
      if (end) params.set('end', String(end));
      embedSrc = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      const watchParams = new URLSearchParams();
      if (start) watchParams.set('t', `${start}s`);
      watchUrl = `https://www.youtube.com/watch?v=${videoId}&${watchParams.toString()}`;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => hasVideo && setOpen(true)}
        disabled={!hasVideo}
        className="my-5 w-full flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-muted/30 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-70 disabled:cursor-default not-prose"
      >
        <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          {hasVideo ? (
            <Play className="w-6 h-6 text-primary" />
          ) : (
            <Video className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            {hasVideo ? 'Watch this' : 'Video coming'}
          </p>
          <p className="text-base font-semibold text-foreground mt-0.5">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </button>

      {open && hasVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
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
                title={title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
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
              {isDrive ? 'Open in Google Drive' : 'Open on YouTube'}
            </a>
          </div>
        </div>
      )}
    </>
  );
}