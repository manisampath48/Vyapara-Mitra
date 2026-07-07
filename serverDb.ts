import fs from 'fs';
import path from 'path';
import { Product, Customer, Sale, Invoice } from './src/types';

const DB_FILE = path.join(process.cwd(), 'database.json');

// Realistic Indian Names for Mock Data
const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Rahul', 'Anjali', 'Vikram', 'Neha', 'Suresh', 'Kavita',
  'Arjun', 'Deepika', 'Manish', 'Pooja', 'Sanjay', 'Ritu', 'Vijay', 'Meera', 'Rohan', 'Swati',
  'Abhishek', 'Kiran', 'Harish', 'Aisha', 'Vivek', 'Sneha', 'Anil', 'Divya', 'Ramesh', 'Shalini',
  'Gaurav', 'Aditi', 'Alok', 'Tanya', 'Kartik', 'Shruti', 'Pranav', 'Nisha', 'Manoj', 'Komal'
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Patel', 'Rao', 'Verma', 'Desai', 'Singh', 'Gupta', 'Reddy', 'Nair',
  'Joshi', 'Mehta', 'Choudhary', 'Iyer', 'Mishra', 'Prasad', 'Yadav', 'Shah', 'Narayanan', 'Saxena',
  'Dubey', 'Grover', 'Trivedi', 'Bose', 'Gill', 'Ranjan', 'Shenoy', 'Pandey', 'Dutta', 'Pillai'
];

// Helper to generate a random phone number
function generatePhone() {
  const digits = '789';
  let phone = digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 9; i++) {
    phone += Math.floor(Math.random() * 10);
  }
  return '+91 ' + phone.substring(0, 5) + ' ' + phone.substring(5);
}

// Generate a random date in the last N days
function randomDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  // Add some random hours
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date.toISOString();
}

// All 30 business profiles
export const BUSINESS_CATALOGS: Record<string, Array<{ name: string; category: string; price: number; unit: string; minStock: number }>> = {
  'GROCERY': [
    { name: 'Amul Milk', category: 'Grocery', price: 30, unit: 'packet', minStock: 25 },
    { name: 'Tata Salt 1kg', category: 'Grocery', price: 28, unit: 'packet', minStock: 15 },
    { name: 'Aashirvaad Atta 5kg', category: 'Grocery', price: 260, unit: 'bag', minStock: 10 },
    { name: 'Maggi 2-Min Noodles', category: 'Grocery', price: 15, unit: 'packet', minStock: 25 },
    { name: 'Parle G Biscuits', category: 'Grocery', price: 10, unit: 'packet', minStock: 30 },
    { name: 'Fortune Soya Health Oil 1L', category: 'Grocery', price: 145, unit: 'bottle', minStock: 12 },
    { name: 'Premium Basmati Rice 5kg', category: 'Grocery', price: 550, unit: 'bag', minStock: 10 },
    { name: 'Madhur Pure Sugar 1kg', category: 'Grocery', price: 48, unit: 'packet', minStock: 15 },
    { name: 'Taj Mahal Tea 500g', category: 'Grocery', price: 340, unit: 'packet', minStock: 8 },
    { name: 'Nescafe Classic Coffee 100g', category: 'Grocery', price: 195, unit: 'jar', minStock: 12 },
    { name: 'Surf Excel Easy Wash 1kg', category: 'Grocery', price: 140, unit: 'packet', minStock: 8 },
    { name: 'Dettol Liquid Handwash 200ml', category: 'Grocery', price: 99, unit: 'bottle', minStock: 10 },
    { name: 'Colgate MaxFresh Toothpaste', category: 'Grocery', price: 95, unit: 'tube', minStock: 15 },
    { name: 'Cinthol Lime Soap 4-pack', category: 'Grocery', price: 145, unit: 'pack', minStock: 8 }
  ],
  'PHARMACY': [
    { name: 'Paracetamol 650mg', category: 'Pharmacy', price: 15, unit: 'strip', minStock: 25 },
    { name: 'Dolo 650', category: 'Pharmacy', price: 35, unit: 'strip', minStock: 25 },
    { name: 'Azithromycin 500mg', category: 'Pharmacy', price: 120, unit: 'strip', minStock: 10 },
    { name: 'Cetirizine Allergy Tablets 10s', category: 'Pharmacy', price: 35, unit: 'strip', minStock: 15 },
    { name: 'ORS Orange Drink Pack', category: 'Pharmacy', price: 20, unit: 'packet', minStock: 30 },
    { name: 'Crocin Pain Relief Tablet', category: 'Pharmacy', price: 25, unit: 'strip', minStock: 25 },
    { name: 'Limcee Vitamin C 500mg', category: 'Pharmacy', price: 25, unit: 'strip', minStock: 20 },
    { name: 'Sterile Cotton Roll 100g', category: 'Pharmacy', price: 60, unit: 'roll', minStock: 15 },
    { name: 'Band-Aid Adhesive Strips 20s', category: 'Pharmacy', price: 45, unit: 'box', minStock: 15 },
    { name: 'Dettol Antiseptic Liquid 250ml', category: 'Pharmacy', price: 145, unit: 'bottle', minStock: 15 },
    { name: 'Alcohol Hand Sanitizer 500ml', category: 'Pharmacy', price: 145, unit: 'bottle', minStock: 12 },
    { name: 'Sterile Syringes 5ml', category: 'Pharmacy', price: 10, unit: 'piece', minStock: 50 },
    { name: 'Digital Thermometer', category: 'Pharmacy', price: 250, unit: 'piece', minStock: 10 },
    { name: 'Disposable 3-Ply Face Masks 50s', category: 'Pharmacy', price: 120, unit: 'box', minStock: 15 },
    { name: 'Vicks Vaporub 50g', category: 'Pharmacy', price: 155, unit: 'jar', minStock: 10 },
    { name: 'Cough Syrup (Ascoril) 100ml', category: 'Pharmacy', price: 118, unit: 'bottle', minStock: 12 }
  ],
  'RESTAURANT': [
    { name: 'Special Chicken Biryani', category: 'Food & Beverage', price: 280, unit: 'portion', minStock: 8 },
    { name: 'Egg Fried Rice', category: 'Food & Beverage', price: 180, unit: 'portion', minStock: 10 },
    { name: 'Schezwan Noodles', category: 'Food & Beverage', price: 160, unit: 'portion', minStock: 10 },
    { name: 'Cheese Burst Pizza', category: 'Food & Beverage', price: 350, unit: 'piece', minStock: 5 },
    { name: 'Crispy Veg Burger', category: 'Food & Beverage', price: 120, unit: 'piece', minStock: 12 },
    { name: 'Nescafe Classic Hot Coffee', category: 'Food & Beverage', price: 60, unit: 'cup', minStock: 25 },
    { name: 'Special Masala Tea', category: 'Food & Beverage', price: 40, unit: 'cup', minStock: 25 },
    { name: 'Fresh Orange Juice', category: 'Food & Beverage', price: 90, unit: 'glass', minStock: 15 },
    { name: 'Premium Vanilla Ice Cream', category: 'Food & Beverage', price: 80, unit: 'cup', minStock: 10 },
    { name: 'Coca Cola Soft Drink 500ml', category: 'Food & Beverage', price: 40, unit: 'bottle', minStock: 30 },
    { name: 'Fresh Paneer Tikka Platter', category: 'Food & Beverage', price: 340, unit: 'plate', minStock: 5 },
    { name: 'Masala Dosa with Chutneys', category: 'Food & Beverage', price: 80, unit: 'plate', minStock: 10 }
  ],
  'BAKERY': [
    { name: 'Vanilla Sponge Cake 1/2kg', category: 'Bakery', price: 350, unit: 'piece', minStock: 5 },
    { name: 'Fresh Baked White Bread', category: 'Bakery', price: 40, unit: 'loaf', minStock: 12 },
    { name: 'Crispy Veg Puffs', category: 'Bakery', price: 25, unit: 'piece', minStock: 20 },
    { name: 'Multigrain Cookies 250g', category: 'Bakery', price: 120, unit: 'pack', minStock: 8 },
    { name: 'Chocolate Glazed Donuts', category: 'Bakery', price: 60, unit: 'piece', minStock: 10 },
    { name: 'Blueberry Muffins', category: 'Bakery', price: 70, unit: 'piece', minStock: 10 },
    { name: 'Walnut Chocolate Brownies', category: 'Bakery', price: 80, unit: 'piece', minStock: 10 },
    { name: 'Strawberry Cupcake 6s', category: 'Bakery', price: 150, unit: 'box', minStock: 5 },
    { name: 'Chocolate Fudge Pastry', category: 'Bakery', price: 75, unit: 'piece', minStock: 10 },
    { name: 'Butter Croissant 4-Pack', category: 'Bakery', price: 180, unit: 'pack', minStock: 6 }
  ],
  'CLOTHING': [
    { name: 'Cotton Crewneck T-Shirt (M)', category: 'Apparel', price: 399, unit: 'piece', minStock: 10 },
    { name: 'Denim Slim Fit Jeans (32)', category: 'Apparel', price: 1199, unit: 'piece', minStock: 5 },
    { name: 'Ankle Cotton Socks 3-Pack', category: 'Apparel', price: 149, unit: 'pack', minStock: 12 },
    { name: 'Wildhorn Leather Wallet', category: 'Accessories', price: 599, unit: 'piece', minStock: 5 },
    { name: 'Casual Linen Shirt (L)', category: 'Apparel', price: 899, unit: 'piece', minStock: 8 },
    { name: 'Summer Cotton Dress (S)', category: 'Apparel', price: 1299, unit: 'piece', minStock: 6 },
    { name: 'Kids Printed Pyjamas', category: 'Apparel', price: 349, unit: 'piece', minStock: 10 },
    { name: 'Woollen Cardigan Sweater', category: 'Apparel', price: 1499, unit: 'piece', minStock: 4 },
    { name: 'Leather Formal Belt Black', category: 'Accessories', price: 450, unit: 'piece', minStock: 5 },
    { name: 'Premium Compact Umbrella', category: 'Accessories', price: 349, unit: 'piece', minStock: 8 }
  ],
  'ELECTRONICS': [
    { name: 'OnePlus Nord Wired Earphones', category: 'Electronics', price: 399, unit: 'piece', minStock: 10 },
    { name: 'Mi Power Bank 20000mAh', category: 'Electronics', price: 1499, unit: 'piece', minStock: 5 },
    { name: 'Syska Smart LED Bulb 9W', category: 'Electronics', price: 249, unit: 'piece', minStock: 15 },
    { name: 'SanDisk 64GB USB 3.0 Drive', category: 'Electronics', price: 429, unit: 'piece', minStock: 8 },
    { name: 'Boat Stone Wireless Speaker', category: 'Electronics', price: 1299, unit: 'piece', minStock: 6 },
    { name: 'Logitech Wireless Keyboard', category: 'Electronics', price: 1199, unit: 'piece', minStock: 5 },
    { name: 'TP-Link AC1200 Wi-Fi Router', category: 'Electronics', price: 1699, unit: 'piece', minStock: 5 },
    { name: 'Samsung EVO SD Card 128GB', category: 'Electronics', price: 899, unit: 'piece', minStock: 8 },
    { name: 'Extension Board 4-Socket', category: 'Electronics', price: 349, unit: 'piece', minStock: 10 },
    { name: 'HDMI 2.0 High Speed Cable', category: 'Electronics', price: 199, unit: 'piece', minStock: 12 }
  ],
  'MOBILES': [
    { name: 'Tempered Glass Screen Protector', category: 'Mobile Accessories', price: 149, unit: 'piece', minStock: 25 },
    { name: 'Silicon Protective Case (Clear)', category: 'Mobile Accessories', price: 199, unit: 'piece', minStock: 20 },
    { name: 'USB Type-C Fast Charger 33W', category: 'Mobile Accessories', price: 699, unit: 'piece', minStock: 10 },
    { name: 'Apple Lightning Cable 1m', category: 'Mobile Accessories', price: 899, unit: 'piece', minStock: 12 },
    { name: 'Samsung Galaxy Buds Pro', category: 'Mobile Accessories', price: 7999, unit: 'piece', minStock: 3 },
    { name: 'Magnetic Car Phone Mount', category: 'Mobile Accessories', price: 349, unit: 'piece', minStock: 8 },
    { name: 'Mobile Ring Holder Stand', category: 'Mobile Accessories', price: 79, unit: 'piece', minStock: 30 },
    { name: 'Infinix Case Carbon Fiber', category: 'Mobile Accessories', price: 249, unit: 'piece', minStock: 10 },
    { name: 'Fast Charging Car Adapter 45W', category: 'Mobile Accessories', price: 499, unit: 'piece', minStock: 8 },
    { name: 'Type-C to 3.5mm Headphone Jack', category: 'Mobile Accessories', price: 199, unit: 'piece', minStock: 15 }
  ],
  'HARDWARE': [
    { name: 'Pidilite Fevicol SH 1kg', category: 'Adhesives', price: 265, unit: 'tub', minStock: 10 },
    { name: 'Double Sided Foam Tape', category: 'Adhesives', price: 75, unit: 'roll', minStock: 15 },
    { name: 'Steel Screw Set box of 100', category: 'Fasteners', price: 180, unit: 'box', minStock: 12 },
    { name: 'Screwdriver Tool Set 6-in-1', category: 'Hand Tools', price: 299, unit: 'set', minStock: 8 },
    { name: 'Asian Paints White Primer 4L', category: 'Paints & Primers', price: 540, unit: 'can', minStock: 5 },
    { name: 'Heavy Duty Mortise Door Lock', category: 'Locks', price: 1250, unit: 'set', minStock: 4 },
    { name: 'Teflon Thread Seal Tape 10s', category: 'Plumbing', price: 120, unit: 'box', minStock: 10 },
    { name: 'Nylon Cable Ties pack of 100', category: 'Electrical', price: 95, unit: 'pack', minStock: 15 },
    { name: 'Adjustable Wrench 10-Inch', category: 'Hand Tools', price: 349, unit: 'piece', minStock: 5 },
    { name: 'Anti-Rust Spray WD-40 100ml', category: 'Solvents', price: 140, unit: 'can', minStock: 10 }
  ],
  'SALON': [
    { name: 'Prestige Haircut & Hair wash', category: 'Salon Services', price: 250, unit: 'session', minStock: 5 },
    { name: 'Loreal Clay Hair Wax 75g', category: 'Products', price: 299, unit: 'tub', minStock: 8 },
    { name: 'Garnier Men Charcoal Face Wash', category: 'Products', price: 180, unit: 'tube', minStock: 10 },
    { name: 'Streax Hair Serum 100ml', category: 'Products', price: 210, unit: 'bottle', minStock: 6 },
    { name: 'Gillette Shaving Foam 418g', category: 'Products', price: 225, unit: 'can', minStock: 8 },
    { name: 'Organic Facial Massage Therapy', category: 'Salon Services', price: 800, unit: 'session', minStock: 4 },
    { name: 'Herbal Face Mask Sheet 5s', category: 'Products', price: 199, unit: 'box', minStock: 12 },
    { name: 'Eucalyptus Massage Oil 250ml', category: 'Products', price: 320, unit: 'bottle', minStock: 5 },
    { name: 'Beard Grooming Styling Combo', category: 'Salon Services', price: 450, unit: 'session', minStock: 6 },
    { name: 'Nivea Soft Moisturizer 200ml', category: 'Products', price: 290, unit: 'tub', minStock: 8 }
  ],
  'BEAUTY': [
    { name: 'Maybelline Matte Liquid Lipstick', category: 'Cosmetics', price: 499, unit: 'piece', minStock: 8 },
    { name: 'Lakme Eyeconic Kajal Black 2s', category: 'Cosmetics', price: 260, unit: 'pack', minStock: 15 },
    { name: 'Nail Polish Gel Finish (Red)', category: 'Cosmetics', price: 149, unit: 'piece', minStock: 20 },
    { name: 'Lotus Herbals Sunscreen SPF50', category: 'Cosmetics', price: 399, unit: 'tube', minStock: 10 },
    { name: 'Makeup Blender Sponge Trio', category: 'Accessories', price: 180, unit: 'box', minStock: 12 },
    { name: 'Mac Studio Fix Powder Plus', category: 'Cosmetics', price: 2900, unit: 'piece', minStock: 3 },
    { name: 'VLCC Gold Facial Therapy Kit', category: 'Facial Kits', price: 350, unit: 'box', minStock: 10 },
    { name: 'Rose Water Facial Spray 200ml', category: 'Cosmetics', price: 125, unit: 'bottle', minStock: 15 },
    { name: 'Professional Makeup Brush Set', category: 'Accessories', price: 699, unit: 'set', minStock: 5 },
    { name: 'Biosecure Cleansing Milk 200ml', category: 'Cosmetics', price: 240, unit: 'bottle', minStock: 8 }
  ],
  'GYM': [
    { name: 'Whey Protein Isolate 1kg', category: 'Supplements', price: 3499, unit: 'jar', minStock: 5 },
    { name: 'Creatine Monohydrate 250g', category: 'Supplements', price: 699, unit: 'jar', minStock: 8 },
    { name: 'BCAA Workout Recovery Drink', category: 'Supplements', price: 1199, unit: 'jar', minStock: 6 },
    { name: 'Shaker Bottle with Mixer Ball', category: 'Accessories', price: 249, unit: 'piece', minStock: 15 },
    { name: 'Resistance Band Loop Set 5s', category: 'Equipment', price: 499, unit: 'set', minStock: 8 },
    { name: 'Gym Training Gloves (Pair)', category: 'Accessories', price: 349, unit: 'pair', minStock: 10 },
    { name: 'Foam Roller Muscle Massager', category: 'Equipment', price: 599, unit: 'piece', minStock: 4 },
    { name: 'Yoga Blocks High Density Pair', category: 'Equipment', price: 399, unit: 'pair', minStock: 6 },
    { name: 'Microfiber Sweat Towel', category: 'Accessories', price: 149, unit: 'piece', minStock: 15 },
    { name: 'Skipping Rope with Counter', category: 'Equipment', price: 299, unit: 'piece', minStock: 10 }
  ],
  'BOOKS': [
    { name: 'The Psychology of Money', category: 'Finance', price: 299, unit: 'piece', minStock: 10 },
    { name: 'Atomic Habits - James Clear', category: 'Self-Help', price: 450, unit: 'piece', minStock: 12 },
    { name: 'Rich Dad Poor Dad', category: 'Finance', price: 340, unit: 'piece', minStock: 10 },
    { name: 'The Alchemist - Paulo Coelho', category: 'Fiction', price: 250, unit: 'piece', minStock: 8 },
    { name: 'Ikigai - Japanese Secret', category: 'Self-Help', price: 320, unit: 'piece', minStock: 8 },
    { name: 'Word Power Made Easy', category: 'Education', price: 160, unit: 'piece', minStock: 15 },
    { name: 'Sapiens - Yuval Noah Harari', category: 'History', price: 499, unit: 'piece', minStock: 6 },
    { name: 'Man\'s Search for Meaning', category: 'Psychology', price: 280, unit: 'piece', minStock: 8 },
    { name: 'Thinking Fast and Slow', category: 'Psychology', price: 450, unit: 'piece', minStock: 5 },
    { name: 'Wings of Fire - APJ Kalam', category: 'Biography', price: 299, unit: 'piece', minStock: 10 }
  ],
  'STATIONERY': [
    { name: 'Cello Gel Pens Box of 10', category: 'Writing', price: 100, unit: 'box', minStock: 15 },
    { name: 'Hardbound A5 Notebook 200pg', category: 'Paper Goods', price: 125, unit: 'piece', minStock: 20 },
    { name: 'Camel Water Color Cake 24s', category: 'Art Supplies', price: 180, unit: 'box', minStock: 10 },
    { name: 'Faber-Castell Pastel Highlighters', category: 'Writing', price: 140, unit: 'pack', minStock: 12 },
    { name: 'A4 Copier Paper Bundle 500s', category: 'Paper Goods', price: 280, unit: 'bundle', minStock: 15 },
    { name: 'Calculator 12-Digit Desktop', category: 'Office Accessories', price: 499, unit: 'piece', minStock: 8 },
    { name: 'Post-It Sticky Notes Neon', category: 'Paper Goods', price: 90, unit: 'pack', minStock: 15 },
    { name: 'Stapler and Pins Combo Set', category: 'Office Accessories', price: 120, unit: 'set', minStock: 10 },
    { name: 'Scissors Ergonomic Handle', category: 'Office Accessories', price: 75, unit: 'piece', minStock: 12 },
    { name: 'Geometry Box Premium Set', category: 'Art Supplies', price: 160, unit: 'set', minStock: 10 }
  ],
  'JEWELLERY': [
    { name: 'Silver Plated Pendant Necklace', category: 'Jewellery', price: 499, unit: 'piece', minStock: 5 },
    { name: 'Gold Plated Hoop Earrings', category: 'Jewellery', price: 349, unit: 'piece', minStock: 8 },
    { name: 'Adjustable Silver Ring 92.5', category: 'Jewellery', price: 899, unit: 'piece', minStock: 5 },
    { name: 'Traditional Kundan Bangles Set', category: 'Jewellery', price: 1450, unit: 'set', minStock: 3 },
    { name: 'Velvet Jewellery Organizer Box', category: 'Organizers', price: 599, unit: 'piece', minStock: 5 },
    { name: 'Pearl Drop Stud Earrings', category: 'Jewellery', price: 299, unit: 'pair', minStock: 10 },
    { name: 'Aesthetic Anklet Pair Silver', category: 'Jewellery', price: 450, unit: 'pair', minStock: 8 },
    { name: 'Choker Necklace Statement Piece', category: 'Jewellery', price: 1299, unit: 'piece', minStock: 4 },
    { name: 'Anti-Tarnish Cleaning Cloth', category: 'Organizers', price: 120, unit: 'piece', minStock: 15 },
    { name: 'Polishing Compound Cream Tube', category: 'Organizers', price: 240, unit: 'piece', minStock: 8 }
  ],
  'FOOTWEAR': [
    { name: 'Running Sports Shoes (Blue)', category: 'Footwear', price: 1899, unit: 'pair', minStock: 5 },
    { name: 'Casual Canvas Sneakers (White)', category: 'Footwear', price: 1299, unit: 'pair', minStock: 5 },
    { name: 'Leather Formal Oxford Shoes', category: 'Footwear', price: 2499, unit: 'pair', minStock: 4 },
    { name: 'Orthopedic Cushion Slippers', category: 'Footwear', price: 450, unit: 'pair', minStock: 12 },
    { name: 'Anti-Slip Bathroom Slides', category: 'Footwear', price: 299, unit: 'pair', minStock: 15 },
    { name: 'Athletic Crew Socks 3-Pack', category: 'Accessories', price: 199, unit: 'pack', minStock: 15 },
    { name: 'Premium Shoe Horn Long', category: 'Accessories', price: 149, unit: 'piece', minStock: 10 },
    { name: 'Shoe Cleaning Foam Spray', category: 'Accessories', price: 280, unit: 'bottle', minStock: 8 },
    { name: 'Waterproof Shoe Covers Pair', category: 'Accessories', price: 180, unit: 'pair', minStock: 10 },
    { name: 'Replacement Shoe Laces Pack', category: 'Accessories', price: 79, unit: 'pack', minStock: 15 }
  ],
  'FURNITURE': [
    { name: 'Ergonomic Office Chair Mesh', category: 'Chairs', price: 4500, unit: 'piece', minStock: 3 },
    { name: 'Folding Wooden Study Table', category: 'Tables', price: 1899, unit: 'piece', minStock: 4 },
    { name: 'Cushioned Bar Stool (Black)', category: 'Chairs', price: 1250, unit: 'piece', minStock: 5 },
    { name: 'Wall Mount Floating Shelves Set', category: 'Shelves', price: 699, unit: 'set', minStock: 8 },
    { name: 'Multi-Utility Shoe Rack Plastic', category: 'Shelves', price: 899, unit: 'piece', minStock: 5 },
    { name: 'Memory Foam Seat Cushion', category: 'Cushions', price: 599, unit: 'piece', minStock: 8 },
    { name: 'Foldable Metal Laptop Stand', category: 'Accessories', price: 499, unit: 'piece', minStock: 10 },
    { name: 'Anti-Scratch Chair Leg Pads 16s', category: 'Accessories', price: 180, unit: 'pack', minStock: 15 },
    { name: 'Wooden Clothes Hanger Set 10s', category: 'Accessories', price: 349, unit: 'pack', minStock: 12 },
    { name: 'LED Desk Lamp Clamp Type', category: 'Accessories', price: 799, unit: 'piece', minStock: 6 }
  ],
  'PETS': [
    { name: 'Pedigree Dry Dog Food 3kg', category: 'Pet Food', price: 680, unit: 'bag', minStock: 8 },
    { name: 'Whiskas Wet Cat Food 12s', category: 'Pet Food', price: 420, unit: 'box', minStock: 10 },
    { name: 'Premium Bentonite Cat Litter 5kg', category: 'Hygiene', price: 399, unit: 'bag', minStock: 10 },
    { name: 'Chew Dog Toys Rubber Bone', category: 'Toys', price: 180, unit: 'piece', minStock: 15 },
    { name: 'Pet Grooming Brush Slicker', category: 'Hygiene', price: 249, unit: 'piece', minStock: 8 },
    { name: 'Anti-Tick Dog Shampoo 200ml', category: 'Hygiene', price: 299, unit: 'bottle', minStock: 8 },
    { name: 'Stainless Steel Double Pet Bowl', category: 'Accessories', price: 349, unit: 'piece', minStock: 10 },
    { name: 'Adjustable Dog Leash & Collar Set', category: 'Accessories', price: 450, unit: 'set', minStock: 6 },
    { name: 'Catnip Infused Feather Toy', category: 'Toys', price: 99, unit: 'piece', minStock: 15 },
    { name: 'Pet Training Pee Pads 20s', category: 'Hygiene', price: 499, unit: 'box', minStock: 8 }
  ],
  'AUTOMOTIVE': [
    { name: 'Engine Oil Synthetic 4T 1L', category: 'Consumables', price: 550, unit: 'can', minStock: 10 },
    { name: 'Microfiber Cleaning Cloths 5s', category: 'Accessories', price: 249, unit: 'pack', minStock: 15 },
    { name: 'High Pressure Car Wash Shampoo', category: 'Consumables', price: 349, unit: 'bottle', minStock: 10 },
    { name: 'Dashboard Wax Polish Spray', category: 'Consumables', price: 220, unit: 'can', minStock: 8 },
    { name: 'Tubeless Tyre Repair Kit Set', category: 'Tools', price: 299, unit: 'set', minStock: 12 },
    { name: 'Windshield Washer Fluid Concent.', category: 'Consumables', price: 99, unit: 'bottle', minStock: 15 },
    { name: 'Car Air Freshener Gel (Lemon)', category: 'Accessories', price: 180, unit: 'piece', minStock: 20 },
    { name: 'All-Weather Rubber Foot Mats 4s', category: 'Accessories', price: 799, unit: 'set', minStock: 5 },
    { name: 'Battery Jumper Cables 10-Foot', category: 'Tools', price: 699, unit: 'piece', minStock: 4 },
    { name: 'LED Headlight Bulb Pair 60W', category: 'Electrical', price: 1450, unit: 'pair', minStock: 5 }
  ],
  'HOSPITALITY': [
    { name: 'Premium Cotton Bath Towel', category: 'Linen', price: 450, unit: 'piece', minStock: 15 },
    { name: 'Disposable Toiletries Kit 20s', category: 'Guest Supplies', price: 340, unit: 'box', minStock: 15 },
    { name: 'Electric Water Kettle 1.2L', category: 'Appliances', price: 899, unit: 'piece', minStock: 5 },
    { name: 'Room Freshener Spray (Lavender)', category: 'Guest Supplies', price: 180, unit: 'can', minStock: 10 },
    { name: 'Aesthetic Velvet Pillowcases Pair', category: 'Linen', price: 299, unit: 'pair', minStock: 12 },
    { name: 'Terrycloth Hotel Slipper Pair', category: 'Guest Supplies', price: 79, unit: 'pair', minStock: 30 },
    { name: 'Universal Travel Adapter Plug', category: 'Electrical', price: 499, unit: 'piece', minStock: 8 },
    { name: 'LED Night Light Wall Sensor', category: 'Electrical', price: 199, unit: 'piece', minStock: 15 },
    { name: 'Mini Digital Safe Lockbox', category: 'Hardware', price: 2900, unit: 'piece', minStock: 4 },
    { name: 'Single Bed Fitted Cotton Sheet', category: 'Linen', price: 399, unit: 'piece', minStock: 12 }
  ],
  'CLINICAL': [
    { name: 'Digital Infrared Thermometer', category: 'Diagnostic', price: 899, unit: 'piece', minStock: 10 },
    { name: 'Automated BP Monitor Upper Arm', category: 'Diagnostic', price: 1490, unit: 'piece', minStock: 8 },
    { name: 'Pulse Oximeter Fingertip LED', category: 'Diagnostic', price: 499, unit: 'piece', minStock: 10 },
    { name: 'Disposable 3-Ply Face Masks 50s', category: 'Consumables', price: 120, unit: 'box', minStock: 15 },
    { name: 'Alcohol Hand Sanitizer 500ml', category: 'Consumables', price: 145, unit: 'bottle', minStock: 12 },
    { name: 'First Aid Emergency Kit Box', category: 'First Aid', price: 550, unit: 'box', minStock: 5 },
    { name: 'Sterile Gauze Pads pack of 10', category: 'Consumables', price: 60, unit: 'pack', minStock: 20 },
    { name: 'Medical Nitrile Gloves 100s', category: 'Consumables', price: 450, unit: 'box', minStock: 8 },
    { name: 'Antiseptic Disinfectant Liquid 1L', category: 'Consumables', price: 220, unit: 'bottle', minStock: 10 },
    { name: 'Adhesive Surgical Tape roll 2s', category: 'Consumables', price: 80, unit: 'pack', minStock: 15 }
  ],
  'EDUCATION': [
    { name: 'Whiteboard Marker Pen Set 4s', category: 'Teaching Aids', price: 120, unit: 'set', minStock: 12 },
    { name: 'Dry Erase Board Felt Eraser', category: 'Teaching Aids', price: 45, unit: 'piece', minStock: 15 },
    { name: 'Student Progress Report Cards 50s', category: 'Admin Supplies', price: 240, unit: 'pack', minStock: 5 },
    { name: 'Graph Notebooks pack of 5', category: 'Paper Goods', price: 99, unit: 'pack', minStock: 15 },
    { name: 'Mathematical Formula Wall Chart', category: 'Teaching Aids', price: 150, unit: 'piece', minStock: 10 },
    { name: 'A4 Clipboard Folder Plastic', category: 'Admin Supplies', price: 85, unit: 'piece', minStock: 15 },
    { name: 'Aesthetic Pastel Binder Clips Jar', category: 'Admin Supplies', price: 130, unit: 'jar', minStock: 10 },
    { name: 'Printed Assignment Folder Set', category: 'Admin Supplies', price: 180, unit: 'set', minStock: 8 },
    { name: 'Wall Hanging Academic Planner', category: 'Admin Supplies', price: 199, unit: 'piece', minStock: 10 },
    { name: 'Electric Desk Pencil Sharpener', category: 'Admin Supplies', price: 349, unit: 'piece', minStock: 8 }
  ],
  'DAIRY': [
    { name: 'Fresh Buffalo Milk 1L', category: 'Milk Products', price: 72, unit: 'packet', minStock: 20 },
    { name: 'Thick Plain Curd Cup 400g', category: 'Milk Products', price: 45, unit: 'cup', minStock: 15 },
    { name: 'Salted Amul Butter Block 100g', category: 'Milk Products', price: 56, unit: 'block', minStock: 15 },
    { name: 'Cow Ghee Premium Jar 1L', category: 'Ghee & Butter', price: 650, unit: 'jar', minStock: 8 },
    { name: 'Fresh Malai Paneer 500g', category: 'Milk Products', price: 180, unit: 'packet', minStock: 12 },
    { name: 'Sweet Lassi Bottle 250ml', category: 'Beverages', price: 25, unit: 'bottle', minStock: 30 },
    { name: 'Amul Cheese Slices 200g', category: 'Milk Products', price: 130, unit: 'packet', minStock: 15 },
    { name: 'Flavoured Milk Cocoa 200ml', category: 'Beverages', price: 35, unit: 'bottle', minStock: 20 },
    { name: 'Fresh Whipped Cream 250g', category: 'Milk Products', price: 99, unit: 'packet', minStock: 10 },
    { name: 'Condensed Sweetened Milk 400g', category: 'Milk Products', price: 140, unit: 'can', minStock: 10 }
  ],
  'PRODUCE': [
    { name: 'Fresh Red Apples 1kg', category: 'Fruits', price: 180, unit: 'kg', minStock: 10 },
    { name: 'Cavendish Bananas Half Dozen', category: 'Fruits', price: 40, unit: 'pack', minStock: 15 },
    { name: 'Alphonso Mangoes Box 6s', category: 'Fruits', price: 399, unit: 'box', minStock: 5 },
    { name: 'Fresh Potatoes 2kg Net Bag', category: 'Vegetables', price: 60, unit: 'bag', minStock: 15 },
    { name: 'Red Onions 1kg Mesh Bag', category: 'Vegetables', price: 45, unit: 'bag', minStock: 15 },
    { name: 'Organic Red Tomatoes 1kg Bag', category: 'Vegetables', price: 50, unit: 'bag', minStock: 15 },
    { name: 'Fresh Coriander & Mint Combo', category: 'Vegetables', price: 20, unit: 'bundle', minStock: 25 },
    { name: 'Washed Spinach/Palak 250g', category: 'Vegetables', price: 30, unit: 'packet', minStock: 15 },
    { name: 'Peeler & Grater Stainless Steel', category: 'Accessories', price: 120, unit: 'piece', minStock: 8 },
    { name: 'Reusable Mesh Shopping Bags 5s', category: 'Accessories', price: 150, unit: 'set', minStock: 10 }
  ],
  'SWEETS': [
    { name: 'Kaju Katli Premium 500g', category: 'Traditional Sweets', price: 480, unit: 'box', minStock: 10 },
    { name: 'Moti Choor Ladoo 500g', category: 'Traditional Sweets', price: 240, unit: 'box', minStock: 12 },
    { name: 'Gulab Jamun Sweet Tin 1kg', category: 'Traditional Sweets', price: 280, unit: 'tin', minStock: 8 },
    { name: 'Rasgulla Sweet Tin 1kg', category: 'Traditional Sweets', price: 260, unit: 'tin', minStock: 8 },
    { name: 'Premium Kesar Peda 250g', category: 'Traditional Sweets', price: 150, unit: 'box', minStock: 10 },
    { name: 'Assorted Dryfruit Sweet Box', category: 'Traditional Sweets', price: 650, unit: 'box', minStock: 5 },
    { name: 'Hot Jalebi Serving 250g', category: 'Snacks', price: 80, unit: 'portion', minStock: 15 },
    { name: 'Soan Papdi Flaky Sweet 500g', category: 'Traditional Sweets', price: 120, unit: 'box', minStock: 15 },
    { name: 'Pure Silver Foil Decor Sheets 10s', category: 'Decor', price: 199, unit: 'pack', minStock: 10 },
    { name: 'Handcrafted Sweet Gift Packing', category: 'Decor', price: 90, unit: 'piece', minStock: 20 }
  ],
  'BEVERAGES': [
    { name: 'Masala Chai Leaf Premium 250g', category: 'Tea & Coffee', price: 145, unit: 'packet', minStock: 15 },
    { name: 'Filter Coffee Powder Chicory 200g', category: 'Tea & Coffee', price: 190, unit: 'packet', minStock: 12 },
    { name: 'Green Tea Bags Classic 25s', category: 'Tea & Coffee', price: 165, unit: 'box', minStock: 15 },
    { name: 'Chamomile Herbal Tea Loose 100g', category: 'Tea & Coffee', price: 240, unit: 'jar', minStock: 8 },
    { name: 'Instant Espresso Roast 100g', category: 'Tea & Coffee', price: 320, unit: 'jar', minStock: 10 },
    { name: 'Double-Walled Glass Cups Pair', category: 'Cups', price: 450, unit: 'pair', minStock: 6 },
    { name: 'Stainless Steel Milk Frother', category: 'Utensils', price: 299, unit: 'piece', minStock: 10 },
    { name: 'Hazelnut Flavouring Syrup 250ml', category: 'Supplements', price: 180, unit: 'bottle', minStock: 8 },
    { name: 'Organic Brown Sugar Sachets 100s', category: 'Supplements', price: 120, unit: 'pack', minStock: 15 },
    { name: 'Disposable Paper Coffee Cups 50s', category: 'Cups', price: 150, unit: 'pack', minStock: 12 }
  ],
  'DESSERTS': [
    { name: 'Chocolate Fudge Scoop Tub 1L', category: 'Ice Creams', price: 260, unit: 'tub', minStock: 10 },
    { name: 'Alphonso Mango Scoop Tub 1L', category: 'Ice Creams', price: 280, unit: 'tub', minStock: 10 },
    { name: 'Italian Vanilla Bean Gelato Cone', category: 'Gelato', price: 120, unit: 'cone', minStock: 15 },
    { name: 'Strawberry Ripple Ice Cream 1L', category: 'Ice Creams', price: 240, unit: 'tub', minStock: 10 },
    { name: 'Hot Chocolate Fudge Sauce 250g', category: 'Toppings', price: 160, unit: 'bottle', minStock: 8 },
    { name: 'Rainbow Sprinkles Jar 200g', category: 'Toppings', price: 99, unit: 'jar', minStock: 15 },
    { name: 'Waffle Cones Crispy pack of 10', category: 'Utensils', price: 120, unit: 'pack', minStock: 10 },
    { name: 'Ice Cream Scoop Trigger Release', category: 'Utensils', price: 249, unit: 'piece', minStock: 8 },
    { name: 'Mini Wooden Spoons pack of 100', category: 'Utensils', price: 80, unit: 'pack', minStock: 20 },
    { name: 'Insulated Cool Transport Bag', category: 'Accessories', price: 90, unit: 'piece', minStock: 15 }
  ],
  'FASHION': [
    { name: 'Handloom Cotton Ethnic Kurti', category: 'Ethnic Wear', price: 899, unit: 'piece', minStock: 8 },
    { name: 'Designer Silk Saree (Banarasi)', category: 'Ethnic Wear', price: 3499, unit: 'piece', minStock: 3 },
    { name: 'Embroidered Floral Dupatta', category: 'Accessories', price: 299, unit: 'piece', minStock: 12 },
    { name: 'Chiffon Evening Gown Dress', category: 'Western Wear', price: 1899, unit: 'piece', minStock: 4 },
    { name: 'Georgette Designer Anarkali Suit', category: 'Ethnic Wear', price: 2499, unit: 'piece', minStock: 4 },
    { name: 'Adjustable Waist Satin Belt Black', category: 'Accessories', price: 349, unit: 'piece', minStock: 10 },
    { name: 'Beaded Ethnic Handbag Clasp', category: 'Accessories', price: 599, unit: 'piece', minStock: 5 },
    { name: 'Statement Pearl Earring Set', category: 'Accessories', price: 450, unit: 'set', minStock: 8 },
    { name: 'Fabric Stain Remover Roll-On', category: 'Care Goods', price: 180, unit: 'piece', minStock: 15 },
    { name: 'Aesthetic Wooden Velvet Hangers 6s', category: 'Care Goods', price: 299, unit: 'pack', minStock: 12 }
  ],
  'GIFTS': [
    { name: 'Aesthetic Scented Candle Set 3s', category: 'Decor', price: 349, unit: 'set', minStock: 10 },
    { name: 'Personalized Photo Frame Wood', category: 'Decor', price: 290, unit: 'piece', minStock: 15 },
    { name: 'Handcrafted Ceramic Coffee Mug', category: 'Paper Goods', price: 199, unit: 'piece', minStock: 20 },
    { name: 'Cute Teddy Bear Soft Toy 30cm', category: 'Toys', price: 399, unit: 'piece', minStock: 8 },
    { name: 'Pop-Up 3D Birthday Greeting Card', category: 'Paper Goods', price: 120, unit: 'piece', minStock: 25 },
    { name: 'Metallic Wind Chime 6-Tubes', category: 'Decor', price: 450, unit: 'piece', minStock: 8 },
    { name: 'Essential Oil Diffuser Ultrasonic', category: 'Decor', price: 1299, unit: 'piece', minStock: 5 },
    { name: 'Fancy Wrapping Paper Rolls 5s', category: 'Decor', price: 150, unit: 'pack', minStock: 15 },
    { name: 'Decorative Satin Ribbon Roll 50m', category: 'Decor', price: 90, unit: 'piece', minStock: 15 },
    { name: 'Artistic Desk Calendar Perpetual', category: 'Paper Goods', price: 240, unit: 'piece', minStock: 8 }
  ],
  'AGRI': [
    { name: 'Organic Vermicompost Fertilizer 5kg', category: 'Fertilizers', price: 260, unit: 'bag', minStock: 10 },
    { name: 'Neem Oil Pest Control Spray 250ml', category: 'Pest Control', price: 180, unit: 'bottle', minStock: 15 },
    { name: 'Premium Tomato Seeds Pack 100s', category: 'Seeds', price: 45, unit: 'packet', minStock: 20 },
    { name: 'Hand Trowel & Weeder Garden Tool', category: 'Tools', price: 199, unit: 'piece', minStock: 12 },
    { name: 'Drip Irrigation Drip Nozzles 50s', category: 'Irrigation', price: 349, unit: 'set', minStock: 8 },
    { name: 'Coir Pith Block Coco Peat 5kg', category: 'Fertilizers', price: 220, unit: 'block', minStock: 10 },
    { name: 'Gardening Hand Gloves Rubberized', category: 'Tools', price: 120, unit: 'pair', minStock: 15 },
    { name: 'Pressure Spray Bottle Pump 2L', category: 'Tools', price: 299, unit: 'piece', minStock: 10 },
    { name: 'Rooting Hormone Powder 50g', category: 'Fertilizers', price: 150, unit: 'packet', minStock: 15 },
    { name: 'Plastic Seedling Starter Trays 5s', category: 'Tools', price: 180, unit: 'set', minStock: 10 }
  ],
  'OTHER': [
    { name: 'Standard Service Charge Hour', category: 'Services', price: 500, unit: 'hour', minStock: 5 },
    { name: 'Premium Consulting Package', category: 'Services', price: 2500, unit: 'service', minStock: 5 },
    { name: 'Express Delivery Logistics Fee', category: 'Services', price: 150, unit: 'delivery', minStock: 20 },
    { name: 'Utility Materials Pack Basic', category: 'Materials', price: 350, unit: 'pack', minStock: 12 },
    { name: 'On-Demand Resource Access Tick', category: 'Services', price: 99, unit: 'ticket', minStock: 30 },
    { name: 'Ad-Hoc Material Surcharge Code', category: 'Materials', price: 120, unit: 'item', minStock: 10 },
    { name: 'Extended Support SLA Month', category: 'Services', price: 4900, unit: 'month', minStock: 4 },
    { name: 'Emergency On-Site Assistance Visit', category: 'Services', price: 1200, unit: 'visit', minStock: 6 },
    { name: 'Digital Setup Custom Installation', category: 'Services', price: 1500, unit: 'service', minStock: 5 },
    { name: 'Miscellaneous Counter Sale Item', category: 'Materials', price: 50, unit: 'piece', minStock: 15 }
  ]
};

// Map similar business types to our 10 catalogs
export function getCatalogForType(type: string): string {
  const norm = type.toUpperCase();
  if (norm.includes('GROCERY') || norm.includes('SUPERMARKET') || norm.includes('DAIRY') || norm.includes('FRUIT') || norm.includes('VEGETABLE')) return 'GROCERY';
  if (norm.includes('MEDICAL') || norm.includes('PHARMACY') || norm.includes('CLINIC') || norm.includes('HOSPITAL') || norm.includes('CLINICAL')) return 'PHARMACY';
  if (norm.includes('RESTAURANT') || norm.includes('CAFE') || norm.includes('TEA') || norm.includes('COFFEE')) return 'RESTAURANT';
  if (norm.includes('BAKERY') || norm.includes('SWEET') || norm.includes('ICE') || norm.includes('DESSERT')) return 'BAKERY';
  if (norm.includes('CLOTHING') || norm.includes('BOUTIQUE') || norm.includes('FASHION')) return 'CLOTHING';
  if (norm.includes('MOBILE') || norm.includes('PHONE')) return 'MOBILES';
  if (norm.includes('ELECTRONICS')) return 'ELECTRONICS';
  if (norm.includes('HARDWARE')) return 'HARDWARE';
  if (norm.includes('SALON') || norm.includes('SPA') || norm.includes('PARLOUR') || norm.includes('BEAUTY')) return 'SALON';
  if (norm.includes('GYM') || norm.includes('FITNESS')) return 'GYM';
  if (norm.includes('BOOK') || norm.includes('STATIONERY') || norm.includes('TUITION') || norm.includes('EDUCATION')) return 'STATIONERY';
  if (norm.includes('JEWELLERY')) return 'JEWELLERY';
  if (norm.includes('FOOTWEAR')) return 'FOOTWEAR';
  if (norm.includes('FURNITURE')) return 'FURNITURE';
  if (norm.includes('PET')) return 'PETS';
  if (norm.includes('AUTOMOBILE') || norm.includes('VEHICLE')) return 'AUTOMOTIVE';
  if (norm.includes('HOTEL') || norm.includes('LODGE') || norm.includes('HOSPITALITY')) return 'HOSPITALITY';
  if (norm.includes('GIFTS')) return 'GIFTS';
  if (norm.includes('AGRI') || norm.includes('GARDEN') || norm.includes('AGRICULTURAL')) return 'AGRI';
  return 'OTHER';
}

export function getExactStarterProducts(businessType: string): Array<{ name: string; category: string; price: number; unit: string; minStock: number }> {
  const norm = businessType.toUpperCase();
  
  if (norm.includes('GROCERY') || norm.includes('SUPERMARKET')) {
    return [
      { name: 'Rice', category: 'Grocery', price: 65, unit: 'kg', minStock: 20 },
      { name: 'Wheat Flour', category: 'Grocery', price: 45, unit: 'kg', minStock: 15 },
      { name: 'Sugar', category: 'Grocery', price: 42, unit: 'kg', minStock: 15 },
      { name: 'Salt', category: 'Grocery', price: 20, unit: 'packet', minStock: 10 },
      { name: 'Milk', category: 'Grocery', price: 28, unit: 'packet', minStock: 25 },
      { name: 'Eggs', category: 'Grocery', price: 7, unit: 'piece', minStock: 30 },
      { name: 'Cooking Oil', category: 'Grocery', price: 165, unit: 'bottle', minStock: 12 },
      { name: 'Biscuits', category: 'Grocery', price: 20, unit: 'packet', minStock: 20 },
      { name: 'Soap', category: 'Grocery', price: 35, unit: 'piece', minStock: 15 },
      { name: 'Shampoo', category: 'Grocery', price: 120, unit: 'bottle', minStock: 10 }
    ];
  }
  
  if (norm.includes('MEDICAL') || norm.includes('PHARMACY')) {
    return [
      { name: 'Paracetamol', category: 'Medicines', price: 15, unit: 'strip', minStock: 30 },
      { name: 'Vitamin C Tablets', category: 'Medicines', price: 25, unit: 'strip', minStock: 20 },
      { name: 'Bandage', category: 'Wellness', price: 30, unit: 'piece', minStock: 15 },
      { name: 'Cotton', category: 'Wellness', price: 50, unit: 'roll', minStock: 15 },
      { name: 'Hand Sanitizer', category: 'Wellness', price: 95, unit: 'bottle', minStock: 12 },
      { name: 'Face Mask', category: 'Wellness', price: 10, unit: 'piece', minStock: 50 },
      { name: 'ORS', category: 'Medicines', price: 20, unit: 'packet', minStock: 25 },
      { name: 'Thermometer', category: 'Devices', price: 150, unit: 'piece', minStock: 8 },
      { name: 'Pain Relief Spray', category: 'Medicines', price: 145, unit: 'bottle', minStock: 10 },
      { name: 'Antiseptic Lotion', category: 'Medicines', price: 65, unit: 'bottle', minStock: 15 }
    ];
  }
  
  if (norm.includes('ELECTRONICS')) {
    return [
      { name: 'Earphones', category: 'Electronics', price: 299, unit: 'piece', minStock: 8 },
      { name: 'USB Cable', category: 'Accessories', price: 149, unit: 'piece', minStock: 15 },
      { name: 'Charger', category: 'Accessories', price: 349, unit: 'piece', minStock: 12 },
      { name: 'Power Bank', category: 'Electronics', price: 1299, unit: 'piece', minStock: 5 },
      { name: 'Keyboard', category: 'Electronics', price: 499, unit: 'piece', minStock: 8 },
      { name: 'Mouse', category: 'Electronics', price: 299, unit: 'piece', minStock: 10 },
      { name: 'Speaker', category: 'Electronics', price: 999, unit: 'piece', minStock: 5 },
      { name: 'Smart Watch', category: 'Wearables', price: 1999, unit: 'piece', minStock: 4 },
      { name: 'HDMI Cable', category: 'Accessories', price: 199, unit: 'piece', minStock: 10 },
      { name: 'Bluetooth Adapter', category: 'Accessories', price: 249, unit: 'piece', minStock: 8 }
    ];
  }
  
  if (norm.includes('CLOTHING')) {
    return [
      { name: 'T-Shirt', category: 'Apparel', price: 399, unit: 'piece', minStock: 15 },
      { name: 'Jeans', category: 'Apparel', price: 999, unit: 'piece', minStock: 10 },
      { name: 'Shirt', category: 'Apparel', price: 599, unit: 'piece', minStock: 12 },
      { name: 'Hoodie', category: 'Apparel', price: 1199, unit: 'piece', minStock: 8 },
      { name: 'Saree', category: 'Apparel', price: 1499, unit: 'piece', minStock: 6 },
      { name: 'Kurti', category: 'Apparel', price: 699, unit: 'piece', minStock: 10 },
      { name: 'Jacket', category: 'Apparel', price: 1799, unit: 'piece', minStock: 5 },
      { name: 'Shorts', category: 'Apparel', price: 349, unit: 'piece', minStock: 12 },
      { name: 'Socks', category: 'Apparel', price: 99, unit: 'pair', minStock: 20 },
      { name: 'Cap', category: 'Apparel', price: 199, unit: 'piece', minStock: 10 }
    ];
  }
  
  if (norm.includes('BAKERY')) {
    return [
      { name: 'Bread', category: 'Bakery', price: 40, unit: 'loaf', minStock: 15 },
      { name: 'Cake', category: 'Bakery', price: 450, unit: 'piece', minStock: 5 },
      { name: 'Cookies', category: 'Bakery', price: 120, unit: 'pack', minStock: 10 },
      { name: 'Muffins', category: 'Bakery', price: 60, unit: 'piece', minStock: 12 },
      { name: 'Donuts', category: 'Bakery', price: 70, unit: 'piece', minStock: 10 },
      { name: 'Puff', category: 'Bakery', price: 25, unit: 'piece', minStock: 20 },
      { name: 'Bun', category: 'Bakery', price: 15, unit: 'piece', minStock: 25 },
      { name: 'Pastries', category: 'Bakery', price: 80, unit: 'piece', minStock: 12 },
      { name: 'Brown Bread', category: 'Bakery', price: 50, unit: 'loaf', minStock: 10 },
      { name: 'Cupcake', category: 'Bakery', price: 40, unit: 'piece', minStock: 15 }
    ];
  }
  
  if (norm.includes('RESTAURANT')) {
    return [
      { name: 'Veg Biryani', category: 'Food & Beverage', price: 180, unit: 'portion', minStock: 10 },
      { name: 'Chicken Biryani', category: 'Food & Beverage', price: 250, unit: 'portion', minStock: 12 },
      { name: 'Fried Rice', category: 'Food & Beverage', price: 140, unit: 'portion', minStock: 15 },
      { name: 'Noodles', category: 'Food & Beverage', price: 130, unit: 'portion', minStock: 15 },
      { name: 'Pizza', category: 'Food & Beverage', price: 299, unit: 'piece', minStock: 8 },
      { name: 'Burger', category: 'Food & Beverage', price: 99, unit: 'piece', minStock: 12 },
      { name: 'Soft Drink', category: 'Food & Beverage', price: 40, unit: 'bottle', minStock: 30 },
      { name: 'Ice Cream', category: 'Food & Beverage', price: 60, unit: 'cup', minStock: 15 },
      { name: 'Meals', category: 'Food & Beverage', price: 120, unit: 'plate', minStock: 10 },
      { name: 'Sandwich', category: 'Food & Beverage', price: 80, unit: 'piece', minStock: 12 }
    ];
  }
  
  if (norm.includes('CAFÉ') || norm.includes('CAFE')) {
    return [
      { name: 'Coffee', category: 'Beverages', price: 80, unit: 'cup', minStock: 25 },
      { name: 'Tea', category: 'Beverages', price: 40, unit: 'cup', minStock: 30 },
      { name: 'Cappuccino', category: 'Beverages', price: 120, unit: 'cup', minStock: 15 },
      { name: 'Latte', category: 'Beverages', price: 130, unit: 'cup', minStock: 15 },
      { name: 'Brownie', category: 'Desserts', price: 90, unit: 'piece', minStock: 10 },
      { name: 'Sandwich', category: 'Snacks', price: 110, unit: 'piece', minStock: 12 },
      { name: 'French Fries', category: 'Snacks', price: 99, unit: 'portion', minStock: 15 },
      { name: 'Milkshake', category: 'Beverages', price: 140, unit: 'glass', minStock: 10 },
      { name: 'Cookies', category: 'Snacks', price: 50, unit: 'piece', minStock: 20 },
      { name: 'Cold Coffee', category: 'Beverages', price: 120, unit: 'glass', minStock: 15 }
    ];
  }
  
  if (norm.includes('STATIONERY')) {
    return [
      { name: 'Pen', category: 'Stationery', price: 10, unit: 'piece', minStock: 50 },
      { name: 'Pencil', category: 'Stationery', price: 5, unit: 'piece', minStock: 50 },
      { name: 'Notebook', category: 'Stationery', price: 45, unit: 'piece', minStock: 30 },
      { name: 'Eraser', category: 'Stationery', price: 5, unit: 'piece', minStock: 40 },
      { name: 'Marker', category: 'Stationery', price: 25, unit: 'piece', minStock: 20 },
      { name: 'Scale', category: 'Stationery', price: 15, unit: 'piece', minStock: 20 },
      { name: 'Calculator', category: 'Stationery', price: 349, unit: 'piece', minStock: 8 },
      { name: 'Files', category: 'Stationery', price: 40, unit: 'piece', minStock: 15 },
      { name: 'Highlighter', category: 'Stationery', price: 30, unit: 'piece', minStock: 15 },
      { name: 'Stapler', category: 'Stationery', price: 85, unit: 'piece', minStock: 10 }
    ];
  }
  
  if (norm.includes('HARDWARE')) {
    return [
      { name: 'Hammer', category: 'Hardware', price: 199, unit: 'piece', minStock: 8 },
      { name: 'Screwdriver', category: 'Hardware', price: 85, unit: 'piece', minStock: 15 },
      { name: 'Drill Machine', category: 'Hardware', price: 1899, unit: 'piece', minStock: 4 },
      { name: 'Nails', category: 'Hardware', price: 50, unit: 'box', minStock: 20 },
      { name: 'Paint Brush', category: 'Hardware', price: 45, unit: 'piece', minStock: 15 },
      { name: 'Wrench', category: 'Hardware', price: 180, unit: 'piece', minStock: 8 },
      { name: 'PVC Pipe', category: 'Hardware', price: 120, unit: 'piece', minStock: 10 },
      { name: 'Tape Measure', category: 'Hardware', price: 110, unit: 'piece', minStock: 12 },
      { name: 'Cement', category: 'Hardware', price: 450, unit: 'bag', minStock: 8 },
      { name: 'Switch Board', category: 'Hardware', price: 299, unit: 'piece', minStock: 10 }
    ];
  }
  
  if (norm.includes('MOBILE') || norm.includes('PHONE')) {
    return [
      { name: 'iPhone', category: 'Phones', price: 79900, unit: 'piece', minStock: 2 },
      { name: 'Samsung Galaxy', category: 'Phones', price: 34900, unit: 'piece', minStock: 3 },
      { name: 'Vivo', category: 'Phones', price: 18900, unit: 'piece', minStock: 4 },
      { name: 'Oppo', category: 'Phones', price: 17900, unit: 'piece', minStock: 4 },
      { name: 'OnePlus', category: 'Phones', price: 38900, unit: 'piece', minStock: 3 },
      { name: 'Charger', category: 'Accessories', price: 490, unit: 'piece', minStock: 15 },
      { name: 'Screen Guard', category: 'Accessories', price: 150, unit: 'piece', minStock: 25 },
      { name: 'Phone Case', category: 'Accessories', price: 250, unit: 'piece', minStock: 20 },
      { name: 'Earbuds', category: 'Accessories', price: 1490, unit: 'piece', minStock: 8 },
      { name: 'Power Bank', category: 'Accessories', price: 1290, unit: 'piece', minStock: 10 }
    ];
  }
  
  if (norm.includes('COSMETIC')) {
    return [
      { name: 'Face Wash', category: 'Cosmetics', price: 145, unit: 'bottle', minStock: 15 },
      { name: 'Shampoo', category: 'Cosmetics', price: 185, unit: 'bottle', minStock: 15 },
      { name: 'Conditioner', category: 'Cosmetics', price: 220, unit: 'bottle', minStock: 12 },
      { name: 'Lipstick', category: 'Cosmetics', price: 299, unit: 'piece', minStock: 10 },
      { name: 'Perfume', category: 'Cosmetics', price: 599, unit: 'bottle', minStock: 8 },
      { name: 'Moisturizer', category: 'Cosmetics', price: 175, unit: 'bottle', minStock: 15 },
      { name: 'Sunscreen', category: 'Cosmetics', price: 349, unit: 'tube', minStock: 10 },
      { name: 'Soap', category: 'Cosmetics', price: 45, unit: 'piece', minStock: 20 },
      { name: 'Kajal', category: 'Cosmetics', price: 120, unit: 'piece', minStock: 15 },
      { name: 'Face Cream', category: 'Cosmetics', price: 199, unit: 'jar', minStock: 12 }
    ];
  }
  
  if (norm.includes('BOOK')) {
    return [
      { name: 'Notebook', category: 'Books', price: 40, unit: 'piece', minStock: 30 },
      { name: 'Story Book', category: 'Books', price: 125, unit: 'piece', minStock: 15 },
      { name: 'Dictionary', category: 'Books', price: 249, unit: 'piece', minStock: 10 },
      { name: 'Novel', category: 'Books', price: 299, unit: 'piece', minStock: 12 },
      { name: 'Magazine', category: 'Books', price: 80, unit: 'piece', minStock: 20 },
      { name: 'Exam Guide', category: 'Books', price: 350, unit: 'piece', minStock: 8 },
      { name: 'Drawing Book', category: 'Books', price: 60, unit: 'piece', minStock: 15 },
      { name: 'Pen Pack', category: 'Books', price: 50, unit: 'pack', minStock: 25 },
      { name: 'Calculator', category: 'Books', price: 450, unit: 'piece', minStock: 8 },
      { name: 'Sticky Notes', category: 'Books', price: 45, unit: 'pack', minStock: 20 }
    ];
  }
  
  if (norm.includes('FRUIT') || norm.includes('VEGETABLE')) {
    return [
      { name: 'Apple', category: 'Produce', price: 160, unit: 'kg', minStock: 15 },
      { name: 'Banana', category: 'Produce', price: 50, unit: 'dozen', minStock: 20 },
      { name: 'Orange', category: 'Produce', price: 90, unit: 'kg', minStock: 15 },
      { name: 'Tomato', category: 'Produce', price: 40, unit: 'kg', minStock: 25 },
      { name: 'Potato', category: 'Produce', price: 30, unit: 'kg', minStock: 30 },
      { name: 'Onion', category: 'Produce', price: 35, unit: 'kg', minStock: 30 },
      { name: 'Carrot', category: 'Produce', price: 60, unit: 'kg', minStock: 15 },
      { name: 'Mango', category: 'Produce', price: 150, unit: 'kg', minStock: 10 },
      { name: 'Spinach', category: 'Produce', price: 20, unit: 'bunch', minStock: 15 },
      { name: 'Cucumber', category: 'Produce', price: 40, unit: 'kg', minStock: 20 }
    ];
  }
  
  if (norm.includes('FURNITURE')) {
    return [
      { name: 'Chair', category: 'Furniture', price: 1499, unit: 'piece', minStock: 8 },
      { name: 'Table', category: 'Furniture', price: 2499, unit: 'piece', minStock: 6 },
      { name: 'Sofa', category: 'Furniture', price: 12999, unit: 'piece', minStock: 2 },
      { name: 'Bed', category: 'Furniture', price: 14999, unit: 'piece', minStock: 2 },
      { name: 'Cupboard', category: 'Furniture', price: 8999, unit: 'piece', minStock: 3 },
      { name: 'Study Desk', category: 'Furniture', price: 3499, unit: 'piece', minStock: 5 },
      { name: 'Dining Table', category: 'Furniture', price: 9999, unit: 'piece', minStock: 2 },
      { name: 'Shelf', category: 'Furniture', price: 1999, unit: 'piece', minStock: 6 },
      { name: 'Office Chair', category: 'Furniture', price: 4499, unit: 'piece', minStock: 4 },
      { name: 'TV Unit', category: 'Furniture', price: 3999, unit: 'piece', minStock: 4 }
    ];
  }
  
  if (norm.includes('JEWELLERY') || norm.includes('JEWELRY')) {
    return [
      { name: 'Gold Ring', category: 'Jewellery', price: 18500, unit: 'piece', minStock: 2 },
      { name: 'Silver Ring', category: 'Jewellery', price: 1200, unit: 'piece', minStock: 5 },
      { name: 'Necklace', category: 'Jewellery', price: 45000, unit: 'piece', minStock: 2 },
      { name: 'Earrings', category: 'Jewellery', price: 8500, unit: 'pair', minStock: 4 },
      { name: 'Bracelet', category: 'Jewellery', price: 14500, unit: 'piece', minStock: 3 },
      { name: 'Chain', category: 'Jewellery', price: 22000, unit: 'piece', minStock: 3 },
      { name: 'Pendant', category: 'Jewellery', price: 6500, unit: 'piece', minStock: 4 },
      { name: 'Bangles', category: 'Jewellery', price: 28000, unit: 'pair', minStock: 2 },
      { name: 'Anklet', category: 'Jewellery', price: 1900, unit: 'pair', minStock: 5 },
      { name: 'Nose Pin', category: 'Jewellery', price: 2500, unit: 'piece', minStock: 6 }
    ];
  }
  
  if (norm.includes('PET')) {
    return [
      { name: 'Dog Food', category: 'Pet Supplies', price: 450, unit: 'packet', minStock: 10 },
      { name: 'Cat Food', category: 'Pet Supplies', price: 120, unit: 'can', minStock: 15 },
      { name: 'Pet Shampoo', category: 'Pet Supplies', price: 250, unit: 'bottle', minStock: 8 },
      { name: 'Pet Toy', category: 'Pet Supplies', price: 150, unit: 'piece', minStock: 12 },
      { name: 'Collar', category: 'Pet Supplies', price: 180, unit: 'piece', minStock: 10 },
      { name: 'Bird Food', category: 'Pet Supplies', price: 95, unit: 'packet', minStock: 15 },
      { name: 'Fish Food', category: 'Pet Supplies', price: 80, unit: 'bottle', minStock: 20 },
      { name: 'Pet Bed', category: 'Pet Supplies', price: 899, unit: 'piece', minStock: 5 },
      { name: 'Treats', category: 'Pet Supplies', price: 140, unit: 'packet', minStock: 15 },
      { name: 'Pet Bowl', category: 'Pet Supplies', price: 120, unit: 'piece', minStock: 10 }
    ];
  }
  
  if (norm.includes('AUTO') || norm.includes('VEHICLE') || norm.includes('CAR')) {
    return [
      { name: 'Spark Plug', category: 'Auto Parts', price: 120, unit: 'piece', minStock: 15 },
      { name: 'Engine Oil', category: 'Lubricants', price: 450, unit: 'bottle', minStock: 12 },
      { name: 'Brake Pads', category: 'Auto Parts', price: 1200, unit: 'set', minStock: 6 },
      { name: 'Air Filter', category: 'Auto Parts', price: 250, unit: 'piece', minStock: 10 },
      { name: 'Wiper Blades', category: 'Auto Parts', price: 350, unit: 'pair', minStock: 8 },
      { name: 'Car Battery', category: 'Electrical', price: 4500, unit: 'piece', minStock: 3 },
      { name: 'Headlight Bulb', category: 'Electrical', price: 180, unit: 'piece', minStock: 15 },
      { name: 'Coolant', category: 'Lubricants', price: 250, unit: 'bottle', minStock: 10 },
      { name: 'Car Shampoo', category: 'Care', price: 190, unit: 'bottle', minStock: 12 },
      { name: 'Oil Filter', category: 'Auto Parts', price: 180, unit: 'piece', minStock: 15 }
    ];
  }
  
  if (norm.includes('SWEET')) {
    return [
      { name: 'Laddu', category: 'Sweets', price: 200, unit: 'kg', minStock: 15 },
      { name: 'Gulab Jamun', category: 'Sweets', price: 150, unit: 'box', minStock: 12 },
      { name: 'Rasgulla', category: 'Sweets', price: 180, unit: 'box', minStock: 10 },
      { name: 'Mysore Pak', category: 'Sweets', price: 250, unit: 'box', minStock: 10 },
      { name: 'Kaju Katli', category: 'Sweets', price: 450, unit: 'box', minStock: 8 },
      { name: 'Jalebi', category: 'Sweets', price: 120, unit: 'kg', minStock: 12 },
      { name: 'Barfi', category: 'Sweets', price: 220, unit: 'kg', minStock: 10 },
      { name: 'Halwa', category: 'Sweets', price: 160, unit: 'box', minStock: 8 },
      { name: 'Milk Sweet', category: 'Sweets', price: 240, unit: 'kg', minStock: 10 },
      { name: 'Rasmalai', category: 'Sweets', price: 120, unit: 'cup', minStock: 12 }
    ];
  }
  
  return [
    { name: 'Standard Service Charge Hour', category: 'Services', price: 500, unit: 'hour', minStock: 5 },
    { name: 'Premium Consulting Package', category: 'Services', price: 2500, unit: 'service', minStock: 5 },
    { name: 'Express Delivery Logistics Fee', category: 'Services', price: 150, unit: 'delivery', minStock: 20 },
    { name: 'Utility Materials Pack Basic', category: 'Materials', price: 350, unit: 'pack', minStock: 12 },
    { name: 'On-Demand Resource Access Tick', category: 'Services', price: 99, unit: 'ticket', minStock: 30 },
    { name: 'Ad-Hoc Material Surcharge Code', category: 'Materials', price: 120, unit: 'item', minStock: 10 },
    { name: 'Extended Support SLA Month', category: 'Services', price: 4900, unit: 'month', minStock: 4 },
    { name: 'Emergency On-Site Assistance Visit', category: 'Services', price: 1200, unit: 'visit', minStock: 6 },
    { name: 'Digital Setup Custom Installation', category: 'Services', price: 1500, unit: 'service', minStock: 5 },
    { name: 'Miscellaneous Counter Sale Item', category: 'Materials', price: 50, unit: 'piece', minStock: 15 }
  ];
}

export function initializeDatabase(config?: {
  businessType: string;
  businessName: string;
  ownerName: string;
  address: string;
  phone: string;
  gstNumber?: string;
  currency: string;
  language: string;
  employees: number;
  email?: string;
  logo?: string;
  customProducts?: Array<{ name: string; category: string; price: number; unit: string; minStock: number }>;
  userId?: string;
}) {
  console.log('Seeding database with configuration:', config);

  const selectedKey = config ? getCatalogForType(config.businessType) : 'GROCERY';
  const rawProducts = BUSINESS_CATALOGS[selectedKey] || BUSINESS_CATALOGS['GROCERY'];

  // Helper to determine GST rate based on name/category
  const getGstRate = (name: string, cat: string): number => {
    const lower = name.toLowerCase();
    if (cat === 'Pharmacy' || cat === 'Medicines') return 12;
    if (cat === 'Electronics' || cat === 'Mobile Accessories' || cat === 'Phones' || cat === 'Wearables' || cat === 'Accessories' || cat === 'Electrical') return 18;
    if (lower.includes('water') || lower.includes('milk') || lower.includes('curd') || lower.includes('tomato') || lower.includes('potato') || lower.includes('onion') || lower.includes('apple') || lower.includes('banana') || lower.includes('orange') || lower.includes('carrot') || lower.includes('spinach') || lower.includes('cucumber') || lower.includes('mango')) return 0;
    if (lower.includes('rice') || lower.includes('atta') || lower.includes('sugar') || lower.includes('paneer') || lower.includes('ghee') || lower.includes('wheat') || lower.includes('flour')) return 5;
    return 12; // Standard rate
  };

  // Helper to generate a realistic supplier based on category
  const getSupplier = (cat: string): string => {
    return `${cat} Wholesale Distributors India`;
  };

  // Helper to generate future expiry dates for food & pharmaceuticals
  const getExpiryDate = (cat: string): string | undefined => {
    if (['Grocery', 'Pharmacy', 'Medicines', 'Bakery', 'Traditional Sweets', 'Sweets', 'Milk Products', 'Fruits', 'Vegetables', 'Produce', 'Food & Beverage', 'Desserts', 'Snacks'].includes(cat)) {
      const future = new Date();
      // fresh produce expires fast, pharmaceuticals have 1-2 years
      const days = cat === 'Fruits' || cat === 'Vegetables' || cat === 'Produce' ? 7 : cat === 'Pharmacy' || cat === 'Medicines' ? 540 : 180;
      future.setDate(future.getDate() + days);
      return future.toISOString().split('T')[0];
    }
    return undefined;
  };

  // Determine base products list based on customProducts or template catalog
  let baseProductsList: Array<{ name: string; category: string; price: number; unit: string; minStock: number }> = [];

  if (config && config.customProducts && config.customProducts.length > 0) {
    baseProductsList = [...config.customProducts];
  } else if (config && config.businessType) {
    baseProductsList = getExactStarterProducts(config.businessType);
  } else {
    baseProductsList = [...rawProducts];
  }

  // If grocery template is chosen, ensure we inject the exact requested products with correct names and prices
  if (selectedKey === 'GROCERY') {
    const exactGroceryReqs = [
      { name: 'Amul Milk', category: 'Grocery', price: 30, unit: 'packet', minStock: 25 },
      { name: 'Amul Butter', category: 'Grocery', price: 62, unit: 'block', minStock: 15 },
      { name: 'Aashirvaad Atta', category: 'Grocery', price: 420, unit: 'bag', minStock: 10 },
      { name: 'India Gate Rice', category: 'Grocery', price: 950, unit: 'bag', minStock: 8 },
      { name: 'Fortune Oil', category: 'Grocery', price: 180, unit: 'bottle', minStock: 12 },
      { name: 'Maggi', category: 'Grocery', price: 15, unit: 'packet', minStock: 25 },
      { name: 'Parle-G', category: 'Grocery', price: 10, unit: 'packet', minStock: 30 },
      { name: 'Britannia Good Day', category: 'Grocery', price: 35, unit: 'packet', minStock: 20 },
      { name: 'Tata Salt', category: 'Grocery', price: 28, unit: 'packet', minStock: 15 },
      { name: 'Surf Excel', category: 'Grocery', price: 210, unit: 'packet', minStock: 10 },
      { name: 'Colgate', category: 'Grocery', price: 120, unit: 'tube', minStock: 15 }
    ];
    
    // Add exact products to base products list to guarantee they exist with their precise requested name/prices!
    exactGroceryReqs.forEach(req => {
      if (!baseProductsList.some(p => p.name.toLowerCase() === req.name.toLowerCase())) {
        baseProductsList.unshift(req);
      }
    });
  }

  // To meet the requirement of AT LEAST 100 realistic products, let's expand the baseProductsList up to 105 products
  const targetCount = 105;
  const expandedProductsList = [...baseProductsList];
  
  const brands = ['TATA', 'Reliance', 'Organic India', 'Aashirvaad', 'Everest', 'Haldiram', 'Cadbury', 'Nestle', 'Dettol', 'Godrej', 'Himalaya', 'Patanjali', 'Amul', 'Britannia', 'Catch', 'Bambino', 'Parle', 'Surf Excel', 'Saffola', 'MDH', 'Sunfeast', 'MTR', 'Sujata', 'Organic', 'Colgate'];
  const sizes = ['Small Pack', 'Medium Jar', 'Family Pack', 'Combo Duo', 'Value Tub', 'Premium Select', 'Gold Reserve', 'Pocket Edition', 'Eco Pack', 'Super Saver'];
  const weights = ['50g', '100g', '200g', '500g', '1kg', '2kg', '5kg', '50ml', '100ml', '200ml', '500ml', '1L', '5L', 'Pack of 2', 'Pack of 4', 'Single Strip'];

  let safetyCount = 0;
  while (expandedProductsList.length < targetCount && safetyCount < 2000) {
    safetyCount++;
    const sourceProd = baseProductsList[Math.floor(Math.random() * baseProductsList.length)];
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const randomWeight = weights[Math.floor(Math.random() * weights.length)];
    
    // Create variation name
    let cleanedName = sourceProd.name
      .replace(/\d+(kg|g|l|ml|s)/gi, '')
      .replace(/\s-Pack/g, '')
      .replace(/\(.*\)/g, '')
      .replace(/Amul|Tata|Colgate|Fortune|Maggi|Parle-G|Britannia|Surf Excel|Aashirvaad|India Gate/gi, '')
      .trim();
    
    let varName = `${randomBrand} ${cleanedName} ${randomWeight} (${randomSize})`;
    
    if (!expandedProductsList.some(p => p.name.toLowerCase() === varName.toLowerCase())) {
      // Adjust price slightly based on weight variation so it is realistic
      let priceMultiplier = 1;
      if (randomWeight.includes('kg') || randomWeight.includes('L')) {
        const val = parseInt(randomWeight) || 1;
        priceMultiplier = val > 0 ? val * 0.85 : 1.5;
      } else if (randomWeight.includes('500g') || randomWeight.includes('500ml')) {
        priceMultiplier = 0.55;
      } else if (randomWeight.includes('200g') || randomWeight.includes('200ml')) {
        priceMultiplier = 0.35;
      } else if (randomWeight.includes('50g') || randomWeight.includes('50ml') || randomWeight.includes('100g') || randomWeight.includes('100ml')) {
        priceMultiplier = 0.22;
      } else if (randomWeight.includes('Pack')) {
        priceMultiplier = 1.75;
      }
      
      const price = Math.max(10, Math.round(sourceProd.price * priceMultiplier));
      expandedProductsList.push({
        name: varName,
        category: sourceProd.category,
        price,
        unit: sourceProd.unit || 'piece',
        minStock: sourceProd.minStock || 5
      });
    }
  }

  // 1. Generate Products tailored to this business
  const products: Product[] = expandedProductsList.map((p, idx) => {
    // Make 30% of products low stock to create interesting diagnostics immediately!
    const isLow = idx % 3 === 0;
    const quantity = isLow ? Math.floor(Math.random() * (p.minStock - 1)) + 1 : Math.floor(Math.random() * 40) + p.minStock + 12;
    
    const buyingPrice = Math.round(p.price * 0.65);
    const sellingPrice = p.price;
    const profitMargin = 35; // 35% margin
    const gst = getGstRate(p.name, p.category);
    
    const suffix = String(1000 + idx).substring(1);
    const barcode = `890${suffix}${Math.floor(100000000 + Math.random() * 900000000)}`;
    const sku = `VM-${selectedKey.substring(0, 3)}-${100 + idx}`;
    const qrCode = `VM-QR-${sku}`;

    return {
      id: `p${idx + 1}`,
      name: p.name,
      category: p.category,
      barcode,
      qrCode,
      sku,
      quantity,
      buyingPrice,
      sellingPrice,
      profitMargin,
      gst,
      supplier: getSupplier(p.category),
      expiryDate: getExpiryDate(p.category),
      unit: p.unit,
      status: quantity === 0 ? 'OUT_OF_STOCK' : quantity <= p.minStock ? 'LOW_STOCK' : 'IN_STOCK',
      minStock: p.minStock
    };
  });

  // 2. Generate 50 Customers
  const customers: Customer[] = [];
  for (let i = 1; i <= 60; i++) {
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    let lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    if (customers.some(c => c.name === `${fName} ${lName}`)) {
      lName = LAST_NAMES[(LAST_NAMES.indexOf(lName) + 1) % LAST_NAMES.length];
    }
    
    const visitCount = Math.floor(Math.random() * 12) + 1;
    const totalPurchases = Math.floor(visitCount * (Math.random() * 800 + 150));
    const isInactive = Math.random() < 0.20; // 20% inactive
    const daysAgo = isInactive ? Math.floor(Math.random() * 60) + 46 : Math.floor(Math.random() * 45);
    const lastVisit = randomDate(daysAgo);

    customers.push({
      id: `c${i}`,
      name: `${fName} ${lName}`,
      phone: generatePhone(),
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@gmail.com`,
      lastVisit,
      totalPurchases: Math.round(totalPurchases),
      status: isInactive ? 'INACTIVE' : 'ACTIVE',
      visitCount
    });
  }

  // Ensure core customers exist for standard AI tests
  const ownerName = config ? config.ownerName : 'sampath';
  const coreUsers = [
    { name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.kumar@gmail.com', lastVisit: randomDate(50), totalPurchases: 12500, status: 'INACTIVE', visitCount: 14 },
    { name: 'Priya Patel', phone: '+91 98123 45678', email: 'priya.patel@gmail.com', lastVisit: randomDate(5), totalPurchases: 24500, status: 'ACTIVE', visitCount: 22 },
    { name: 'Amit Sharma', phone: '+91 97654 32109', email: 'amit.sharma@gmail.com', lastVisit: randomDate(48), totalPurchases: 8900, status: 'INACTIVE', visitCount: 8 },
    { name: 'Sunita Rao', phone: '+91 99887 76655', email: 'sunita.rao@gmail.com', lastVisit: randomDate(2), totalPurchases: 18600, status: 'ACTIVE', visitCount: 15 }
  ];

  coreUsers.forEach((user, idx) => {
    customers[idx] = {
      id: `c_core_${idx + 1}`,
      name: user.name,
      phone: user.phone,
      email: user.email,
      lastVisit: user.lastVisit,
      totalPurchases: user.totalPurchases,
      status: user.status as 'ACTIVE' | 'INACTIVE',
      visitCount: user.visitCount
    };
  });

  // 3. Generate 70 historical sales ledger over the last 30 days using *only* products of this business!
  const sales: Sale[] = [];
  const invoices: Invoice[] = [];
  
  for (let i = 1; i <= 75; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.min(products.length, Math.floor(Math.random() * 3) + 1);
    const selectedProducts: any[] = [];
    let subtotal = 0;
    let totalTax = 0;

    // Pick unique products
    const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
    for (let k = 0; k < itemCount; k++) {
      const prod = shuffledProducts[k];
      const qty = Math.floor(Math.random() * 2) + 1;
      const total = qty * prod.sellingPrice;
      const gstAmt = Math.round(total * (prod.gst / 100));
      selectedProducts.push({
        productId: prod.id,
        name: prod.name,
        quantity: qty,
        price: prod.sellingPrice,
        total,
        gstRate: prod.gst,
        gstAmount: gstAmt
      });
      subtotal += total;
      totalTax += gstAmt;
    }

    const total = subtotal + totalTax;
    
    const daysAgo = Math.floor(Math.random() * 30);
    const sDate = randomDate(daysAgo);
    const invoiceNum = `VM-${1000 + i}`;

    const paymentMethods: Array<'CASH' | 'CARD' | 'UPI' | 'DUE'> = ['UPI', 'CASH', 'UPI', 'CARD', 'DUE'];
    const pm = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    sales.push({
      id: `s${i}`,
      invoiceNumber: invoiceNum,
      customerId: customer.id,
      customerName: customer.name,
      date: sDate,
      products: selectedProducts,
      subtotal,
      tax: totalTax,
      total,
      paymentMethod: pm === 'DUE' ? 'DUE' : pm
    });

    invoices.push({
      id: `inv${i}`,
      invoiceNumber: invoiceNum,
      customerName: customer.name,
      customerPhone: customer.phone,
      date: sDate,
      products: selectedProducts,
      subtotal,
      tax: totalTax,
      total,
      status: pm === 'DUE' ? 'UNPAID' : 'PAID'
    });
  }

  // Sort them so recent sales are indeed first
  sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Set default metadata
  const defaultMeta = {
    businessType: config ? config.businessType : 'Grocery Store / Supermarket',
    businessName: config ? config.businessName : 'VyaparaMitra Retail',
    ownerName: ownerName,
    address: config ? config.address : 'Plot 42, HSR Layout, Bengaluru, Karnataka, India',
    phone: config ? config.phone : '+91 99999 99999',
    gstNumber: config ? config.gstNumber : '29AAABP4211G1Z3',
    currency: config ? config.currency : 'INR',
    language: config ? config.language : 'English',
    employees: config ? config.employees : 5,
    email: config && config.email ? config.email : 'owner@vyaparamitra.com',
    logo: config && config.logo ? config.logo : 'icon_blue',
    setupCompleted: !!config
  };

  // Seed default users for authentication
  const defaultUsers = [
    {
      id: 'u_owner',
      username: 'owner',
      passwordHash: '8681e1866388ffc736551b14cb6982f6e9b8602b667eef090d8502f0fc9e66ff', // pbkdf2 of 'password123' with salt 'demo_salt'
      salt: 'demo_salt',
      name: ownerName + ' (Owner)',
      role: 'Business Owner',
      email: config ? (config as any).email : 'owner@vyaparamitra.com'
    },
    {
      id: 'u_manager',
      username: 'manager',
      passwordHash: '8681e1866388ffc736551b14cb6982f6e9b8602b667eef090d8502f0fc9e66ff',
      salt: 'demo_salt',
      name: 'Karan Singh',
      role: 'Manager',
      email: 'manager@vyaparamitra.com'
    },
    {
      id: 'u_employee',
      username: 'employee',
      passwordHash: '8681e1866388ffc736551b14cb6982f6e9b8602b667eef090d8502f0fc9e66ff',
      salt: 'demo_salt',
      name: 'Rahul Verma',
      role: 'Employee',
      email: 'employee@vyaparamitra.com'
    }
  ];

  // If config has userId, let's load current database instead of wiping everything!
  const targetUserId = config?.userId;
  if (targetUserId) {
    let currentDb: any;
    try {
      if (fs.existsSync(DB_FILE)) {
        currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      } else {
        currentDb = { products: [], customers: [], sales: [], invoices: [], users: [], metadataList: [] };
      }
    } catch {
      currentDb = { products: [], customers: [], sales: [], invoices: [], users: [], metadataList: [] };
    }

    if (!currentDb.products) currentDb.products = [];
    if (!currentDb.customers) currentDb.customers = [];
    if (!currentDb.sales) currentDb.sales = [];
    if (!currentDb.invoices) currentDb.invoices = [];
    if (!currentDb.metadataList) currentDb.metadataList = [];
    if (!currentDb.users) currentDb.users = [];

    // Filter out old entries for this specific userId
    const filterOutUser = (item: any) => (item.userId || 'u_owner') !== targetUserId;
    currentDb.products = currentDb.products.filter(filterOutUser);
    currentDb.customers = currentDb.customers.filter(filterOutUser);
    currentDb.sales = currentDb.sales.filter(filterOutUser);
    currentDb.invoices = currentDb.invoices.filter(filterOutUser);
    currentDb.metadataList = currentDb.metadataList.filter((m: any) => (m.userId || 'u_owner') !== targetUserId);

    // Assign userId to all newly generated entities
    const userProducts = products.map((p: any) => ({ ...p, userId: targetUserId }));
    const userCustomers = customers.map((c: any) => ({ ...c, userId: targetUserId }));
    const userSales = sales.map((s: any) => ({ ...s, userId: targetUserId }));
    const userInvoices = invoices.map((i: any) => ({ ...i, userId: targetUserId }));

    // Append to existing database
    currentDb.products.unshift(...userProducts);
    currentDb.customers.unshift(...userCustomers);
    currentDb.sales.unshift(...userSales);
    currentDb.invoices.unshift(...userInvoices);

    // Save user metadata
    const userMeta = {
      businessType: config.businessType,
      businessName: config.businessName,
      ownerName: config.ownerName || 'sampath',
      address: config.address || 'HSR Layout, Bengaluru',
      phone: config.phone || '+91 99999 99999',
      gstNumber: config.gstNumber || '',
      currency: config.currency || 'INR',
      language: config.language || 'English',
      employees: config.employees || 5,
      email: config.email || '',
      logo: config.logo || 'icon_blue',
      setupCompleted: true,
      userId: targetUserId
    };
    currentDb.metadataList.push(userMeta);

    // Save back to file
    fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), 'utf-8');
    console.log(`User-specific database seeded successfully for userId: ${targetUserId}`);
    return currentDb;
  }

  const dataStore = {
    products,
    customers,
    sales,
    invoices,
    users: defaultUsers,
    metadata: defaultMeta,
    metadataList: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(dataStore, null, 2), 'utf-8');
  console.log(`Database seeded successfully for industry: ${defaultMeta.businessType}`);
  return dataStore;
}

export function loadDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initializeDatabase();
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Check back compatibility for users
    if (!parsed.users) {
      parsed.users = [
        {
          id: 'u_owner',
          username: 'owner',
          passwordHash: '8681e1866388ffc736551b14cb6982f6e9b8602b667eef090d8502f0fc9e66ff',
          salt: 'demo_salt',
          name: (parsed.metadata?.ownerName || 'Sampath') + ' (Owner)',
          role: 'Business Owner',
          email: 'owner@vyaparamitra.com'
        },
        {
          id: 'u_manager',
          username: 'manager',
          passwordHash: '8681e1866388ffc736551b14cb6982f6e9b8602b667eef090d8502f0fc9e66ff',
          salt: 'demo_salt',
          name: 'Karan Singh',
          role: 'Manager',
          email: 'manager@vyaparamitra.com'
        },
        {
          id: 'u_employee',
          username: 'employee',
          passwordHash: '8681e1866388ffc736551b14cb6982f6e9b8602b667eef090d8502f0fc9e66ff',
          salt: 'demo_salt',
          name: 'Rahul Verma',
          role: 'Employee',
          email: 'employee@vyaparamitra.com'
        }
      ];
      saveDatabase(parsed);
    }

    // Backward compatibility for metadata
    if (!parsed.metadata) {
      parsed.metadata = {
        businessType: 'Grocery Store / Supermarket',
        businessName: 'VyaparaMitra Retail',
        ownerName: 'sampath',
        address: 'Plot 42, HSR Layout, Bengaluru, Karnataka, India',
        phone: '+91 99999 99999',
        gstNumber: '29AAABP4211G1Z3',
        currency: 'INR',
        language: 'English',
        employees: 5,
        setupCompleted: false
      };
      saveDatabase(parsed);
    }
    if (!parsed.metadataList) {
      parsed.metadataList = [];
      saveDatabase(parsed);
    }
    return parsed;
  } catch (error) {
    console.error('Error loading database, reinitializing...', error);
    return initializeDatabase();
  }
}

export function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}
