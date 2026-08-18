import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, GraduationCap, ClipboardCheck, Trash2 } from 'lucide-react';

const TYPE_META = {
  coach: { label: 'Coaching', icon: MessageSquare },
  guided_practice: { label: 'Guided practice', icon: GraduationCap },
  assessment_coaching: { label: 'Assessment coaching', icon: ClipboardCheck },
};

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ConversationHistory({ onClose, onSelect }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await base44.entities.CoachSession.list('-updated_date', 50);
        setSessions(list);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (e, session) => {
    e.stopPropagation();
    try {
      await base44.entities.CoachConversation.deleteMany({ session_id: session.id });
      await base44.entities.CoachSession.delete(session.id);
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    } catch (err) {
      // ignore
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Past conversations</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No past conversations yet. Your coaching chats will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const meta = TYPE_META[s.type] || TYPE_META.coach;
              const Icon = meta.icon;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onSelect(s)}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {meta.label} · {formatDate(s.updated_date || s.created_date)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(e, s)}
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}