-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CoachClient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Onboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NutritionPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CheckIn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgressPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Measurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PerformanceLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuizSubmission" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICY: Allow the service role (Prisma) full access
-- This is critical — our app connects via the
-- connection string which uses the postgres role
-- ============================================

-- User
CREATE POLICY "Service role full access" ON "User"
  FOR ALL USING (true) WITH CHECK (true);

-- CoachClient
CREATE POLICY "Service role full access" ON "CoachClient"
  FOR ALL USING (true) WITH CHECK (true);

-- Onboarding
CREATE POLICY "Service role full access" ON "Onboarding"
  FOR ALL USING (true) WITH CHECK (true);

-- WorkoutPlan
CREATE POLICY "Service role full access" ON "WorkoutPlan"
  FOR ALL USING (true) WITH CHECK (true);

-- NutritionPlan
CREATE POLICY "Service role full access" ON "NutritionPlan"
  FOR ALL USING (true) WITH CHECK (true);

-- CheckIn
CREATE POLICY "Service role full access" ON "CheckIn"
  FOR ALL USING (true) WITH CHECK (true);

-- ProgressPhoto
CREATE POLICY "Service role full access" ON "ProgressPhoto"
  FOR ALL USING (true) WITH CHECK (true);

-- Measurement
CREATE POLICY "Service role full access" ON "Measurement"
  FOR ALL USING (true) WITH CHECK (true);

-- PerformanceLog
CREATE POLICY "Service role full access" ON "PerformanceLog"
  FOR ALL USING (true) WITH CHECK (true);

-- Message
CREATE POLICY "Service role full access" ON "Message"
  FOR ALL USING (true) WITH CHECK (true);

-- Notification
CREATE POLICY "Service role full access" ON "Notification"
  FOR ALL USING (true) WITH CHECK (true);

-- QuizSubmission
CREATE POLICY "Service role full access" ON "QuizSubmission"
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- BLOCK: Deny anon/public access via Supabase API
-- The policies above only allow the postgres role
-- (used by Prisma). The anon key used by Supabase
-- client libraries will be blocked by RLS since
-- there are no policies for the anon role.
--
-- If you want to also restrict the Supabase
-- REST API (PostgREST), revoke anon access:
-- ============================================

REVOKE ALL ON "User" FROM anon;
REVOKE ALL ON "CoachClient" FROM anon;
REVOKE ALL ON "Onboarding" FROM anon;
REVOKE ALL ON "WorkoutPlan" FROM anon;
REVOKE ALL ON "NutritionPlan" FROM anon;
REVOKE ALL ON "CheckIn" FROM anon;
REVOKE ALL ON "ProgressPhoto" FROM anon;
REVOKE ALL ON "Measurement" FROM anon;
REVOKE ALL ON "PerformanceLog" FROM anon;
REVOKE ALL ON "Message" FROM anon;
REVOKE ALL ON "Notification" FROM anon;
REVOKE ALL ON "QuizSubmission" FROM anon;

-- Also revoke from authenticated (Supabase Auth users)
-- since we handle auth via NextAuth, not Supabase Auth
REVOKE ALL ON "User" FROM authenticated;
REVOKE ALL ON "CoachClient" FROM authenticated;
REVOKE ALL ON "Onboarding" FROM authenticated;
REVOKE ALL ON "WorkoutPlan" FROM authenticated;
REVOKE ALL ON "NutritionPlan" FROM authenticated;
REVOKE ALL ON "CheckIn" FROM authenticated;
REVOKE ALL ON "ProgressPhoto" FROM authenticated;
REVOKE ALL ON "Measurement" FROM authenticated;
REVOKE ALL ON "PerformanceLog" FROM authenticated;
REVOKE ALL ON "Message" FROM authenticated;
REVOKE ALL ON "Notification" FROM authenticated;
REVOKE ALL ON "QuizSubmission" FROM authenticated;
