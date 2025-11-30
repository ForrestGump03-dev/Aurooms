-- Insert AuRooms real rooms (from actual database)
INSERT INTO rooms (name, type, description, price_per_night, max_guests, size, bed_type, amenities, image_urls, available) VALUES
('Blue Room', 'family', 'Elegant room with premium amenities, and authentic Sicilian touches.', 100.00, 4, '30 sqm', '1 Double Bed - 2 Single Bed', 
 ARRAY['WiFi', 'Air Conditioning', 'Mini Bar', 'TV', 'Balcony', 'Bathroom Amenities'],
 ARRAY['/Blue.jpg', '/Blue2.jpg'], true),

('Glicine Room', 'couple', 'Spacious room with premium comfort.', 65.00, 2, '25 sqm', '1 Double Bed',
 ARRAY['WiFi', 'Air Conditioning', 'Premium Bedding', 'Mini Bar', 'TV', 'Bathroom Amenities'],
 ARRAY['/Glicine.jpg', '/Glicine2.jpg'], true),

('Yellow Room', 'couple', 'Minimal suite, perfect for extended stays and special occasions.', 65.00, 2, '25 sqm', '1 Double Bed',
 ARRAY['WiFi', 'Air Conditioning', 'Premium Amenities', 'Mini Bar', 'TV', 'Bathroom Amenities'],
 ARRAY['/Yellow.jpg'], true);

