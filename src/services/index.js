// Public service API for the app.
//
// Pages and components import everything they need from here:
//   import { content, ai, assessment, getModuleCompletions } from '@/services';
//
// This file re-exports the Base44 adapter by default. To run the app on a
// different backend, implement a replacement adapter with the same surface
// (content, ai, assessment, files) and point this file at it — no page code
// needs to change.
//
// The device-local progress store is re-exported by name so existing call
// sites keep working; swap it for a server-backed store by replacing this
// re-export.

export { content, ai, assessment, files } from './base44Adapter';
export * from './localProgress';