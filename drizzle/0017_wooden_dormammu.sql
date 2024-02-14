-- Custom SQL migration file, put you code below! --
CREATE INDEX ON notes USING gin (to_tsvector('english', title || ' ' || _onlytextcontent));
