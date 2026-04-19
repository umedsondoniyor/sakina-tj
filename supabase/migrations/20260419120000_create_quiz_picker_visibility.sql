/*
  # Quiz picker cards visibility (home page)

  Controls whether each product-picker banner (mattress / bed) is shown on the client.
  Admin updates; public read for the storefront.
*/

CREATE TABLE IF NOT EXISTS quiz_picker_visibility (
  product_type text PRIMARY KEY CHECK (product_type IN ('mattress', 'bed')),
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE quiz_picker_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read quiz picker visibility"
  ON quiz_picker_visibility
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage quiz picker visibility"
  ON quiz_picker_visibility
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION update_quiz_picker_visibility_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quiz_picker_visibility_updated_at ON quiz_picker_visibility;
CREATE TRIGGER quiz_picker_visibility_updated_at
  BEFORE UPDATE ON quiz_picker_visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_picker_visibility_updated_at();

INSERT INTO quiz_picker_visibility (product_type, is_visible) VALUES ('mattress', true)
ON CONFLICT (product_type) DO NOTHING;
INSERT INTO quiz_picker_visibility (product_type, is_visible) VALUES ('bed', true)
ON CONFLICT (product_type) DO NOTHING;
