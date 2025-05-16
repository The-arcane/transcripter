/*
  # Add training feedback system

  1. New Tables
    - `training_feedback`
      - `id` (uuid, primary key)
      - `training_data_id` (uuid, references training_data)
      - `user_id` (uuid, references auth.users)
      - `feedback` (text)
      - `rating` (integer)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `training_feedback` table
    - Add policies for authenticated users to:
      - Read their own feedback
      - Create new feedback
*/

CREATE TABLE IF NOT EXISTS training_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_data_id uuid REFERENCES training_data NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  feedback text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own feedback"
  ON training_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON training_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);