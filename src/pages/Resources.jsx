import React from 'react';
import { Library } from 'lucide-react';
import { RESOURCES } from '@/lib/resources';
import { ResourceVideoCard, ResourceLinkCard } from '@/components/resources/ResourceCards';

export default function Resources() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Library className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Resources</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Reference videos, guides, and activity materials to support your sessions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {RESOURCES.map((group) => (
          <section key={group.topic}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">{group.topic}</h2>
              <div className="flex-1 h-px bg-border/60" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item, i) =>
                item.type === 'video' ? (
                  <div key={i} className="sm:col-span-2">
                    <ResourceVideoCard item={item} />
                  </div>
                ) : (
                  <ResourceLinkCard key={i} item={item} />
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}