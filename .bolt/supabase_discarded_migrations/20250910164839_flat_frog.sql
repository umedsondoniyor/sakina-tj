@@ .. @@
   author_id uuid REFERENCES auth.users(id),
   category_id uuid REFERENCES blog_categories(id),
   title text NOT NULL,
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
+-- Add foreign key constraints
+ALTER TABLE blog_posts 
+ADD CONSTRAINT fk_blog_posts_category 
+FOREIGN KEY (category_id) REFERENCES blog_categories(id);
+
+ALTER TABLE blog_posts 
+ADD CONSTRAINT fk_blog_posts_author 
+FOREIGN KEY (author_id) REFERENCES auth.users(id);
+
+ALTER TABLE blog_post_tags 
+ADD CONSTRAINT fk_blog_post_tags_post 
+FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
+
+ALTER TABLE blog_post_tags 
+ADD CONSTRAINT fk_blog_post_tags_tag 
+FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE;
+
 -- Create indexes for performance
 CREATE INDEX idx_blog_posts_status ON blog_posts(status);
 CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);