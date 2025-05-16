/*
  # Add training data support

  1. New Tables
    - `training_data`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `created_at` (timestamp with timezone)
      - `user_id` (uuid, references auth.users)
      - `is_validated` (boolean)
      - `validation_score` (integer)

  2. Security
    - Enable RLS on `training_data` table
    - Add policies for authenticated users to:
      - Read their own training data
      - Create new training data
*/

CREATE TABLE IF NOT EXISTS training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  is_validated boolean DEFAULT false,
  validation_score integer CHECK (validation_score >= 0 AND validation_score <= 100)
);

ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own training data"
  ON training_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create training data"
  ON training_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);