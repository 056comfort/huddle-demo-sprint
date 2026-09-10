-- Row-Level Security policies for Huddle
-- Run this in Supabase's SQL Editor (Dashboard -> SQL Editor -> New query)
--
-- IMPORTANT: these policies only take effect for connections using a role
-- SUBJECT to RLS (e.g. Supabase's "authenticated" role via supabase-js).
-- A direct postgres/superuser connection (which the Express backend currently
-- uses) bypasses RLS entirely. Confirm with backend whether this matters
-- before assuming these policies are your main security layer.

-- Enable RLS on each table (required before any policy takes effect)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- USERS: everyone authenticated can view basic user info (needed to show
-- names/avatars of other conversation members), but only update their own row.
CREATE POLICY "users_select_all_authenticated"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "users_update_own_row"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- CONVERSATION_MEMBERS: a user can only see membership rows for conversations
-- they themselves belong to.
CREATE POLICY "members_select_own_conversations"
  ON conversation_members FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members
      WHERE "userId" = auth.uid()
    )
  );

CREATE POLICY "members_insert_self_only"
  ON conversation_members FOR INSERT
  WITH CHECK ("userId" = auth.uid());

-- CONVERSATIONS: a user can only see conversations they're a member of.
CREATE POLICY "conversations_select_if_member"
  ON conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM conversation_members
      WHERE "userId" = auth.uid()
    )
  );

-- MESSAGES: a user can only see messages in conversations they belong to,
-- and can only insert messages sent as themselves.
CREATE POLICY "messages_select_if_conversation_member"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members
      WHERE "userId" = auth.uid()
    )
  );

CREATE POLICY "messages_insert_self_only"
  ON messages FOR INSERT
  WITH CHECK ("senderId" = auth.uid());
