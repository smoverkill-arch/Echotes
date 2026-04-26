# Known Gotchas

## Local time vs persisted timestamp

The UI works with local day semantics, but `scheduled_at` is persisted as an
instant. Regressions in date parsing can silently break same-day validation.

## Projected tasks exist in two day contexts

A projected task belongs to both `source_day` and `target_day`. The origin day
must render a ghost; the destination day must render the real item.

## Timeline orientation is a render concern

Do not put left/right orientation into `TimelineNode`. The domain node stays
side-free; render components decide the visual side.

## The schema already has `note_echoes`

The table exists, but the baseline does not expose the feature as delivered
product behavior yet.

## Echo metadata is not the inline source of truth

For inline mentions, `content` stores the token position and presence. Echo
metadata is auxiliary; the semantic relation lives in `note_echoes`.

## A ghost is not a creation marker

For projected tasks, the origin day renders only `task_ghost`. It must not also
render a separate `task_creation_marker`.

## Tag color override must be sticky

If a user manually overrides color, later tag changes must not silently overwrite
that color while `is_color_overridden` remains true.

## The client cannot use `service_role`

The mobile client is limited to public Supabase configuration and RLS-backed
queries.
