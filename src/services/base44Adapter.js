// Base44 service adapter — the ONLY place that knows about the Base44 SDK.
// Pages and components import from '@/services' (the public API in index.js),
// never from this file or from '@/api/base44Client' directly.
//
// To deploy on another platform, write a replacement adapter that implements
// the same exported surface (content, ai, assessment, files) using your
// backend of choice, then swap the import in index.js. No page code changes.

import { base44 } from '@/api/base44Client';

// --- Content (entity reads) ---

export const content = {
  /** List learning modules, optionally sorted + limited. */
  listModules: (sort, limit) => base44.entities.LearningModule.list(sort, limit),
  /** List all clubs (used by the assessment club selector). */
  listClubs: () => base44.entities.Club.list(),
  /** List assessment records (used by the admin Insights view). */
  listAssessments: (sort, limit) => base44.entities.Assessment.list(sort, limit),
};

// --- AI / backend functions ---

export const ai = {
  /** Send a message to the AI Coach and receive a response. */
  chatWithCoach: (payload) => base44.functions.invoke('chatWithCoach', payload),
  /** Generate multiple-choice options for a module checkpoint pop quiz. */
  generateCheckpointOptions: (payload) => base44.functions.invoke('generateCheckpointOptions', payload),
};

// --- Assessment processing ---

export const assessment = {
  /** Score a completed assessment and return proficiency results. */
  process: (payload) => base44.functions.invoke('processAssessment', payload),
};

// --- File uploads (client-side integrations) ---

export const files = {
  /** Upload a public file and receive { file_url }. */
  upload: (file) => base44.integrations.Core.UploadFile({ file }),
  /** Upload a private file and receive { file_uri }. */
  uploadPrivate: (file) => base44.integrations.Core.UploadPrivateFile({ file }),
  /** Create a time-limited signed download URL for a private file. */
  signedUrl: (fileUri, expiresIn) => base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: expiresIn }),
};