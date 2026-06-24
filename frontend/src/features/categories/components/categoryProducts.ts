// Mock product data keyed by category id
// Images sourced from Unsplash (free to use, attribution via link)
export interface Product {
  id: string;
  name: string;
  price: number;
  unitOfMeasure: string;
  tax: number;
  description: string;
  image: string | null; // URL or base64 data URL or null (shows letter avatar)
  status: "Active" | "Inactive";
}

export const PRODUCTS_BY_CATEGORY: Record<string, Product[]> = {
  "1": [ // Espresso
    { id: "p1",  name: "Espresso Shot",    price: 3.50, unitOfMeasure: "per piece", tax: 5, description: "Double shot of rich espresso.",                  image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=200&h=200&fit=crop", status: "Active" },
    { id: "p2",  name: "Flat White",       price: 4.00, unitOfMeasure: "per piece", tax: 5, description: "Espresso with steamed micro-foam milk.",          image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=200&h=200&fit=crop", status: "Active" },
    { id: "p3",  name: "Cappuccino",       price: 4.50, unitOfMeasure: "per piece", tax: 5, description: "Espresso with thick foam and steamed milk.",      image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=200&h=200&fit=crop", status: "Active" },
    { id: "p4",  name: "Americano",        price: 3.80, unitOfMeasure: "per piece", tax: 5, description: "Espresso diluted with hot water.",                image: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=200&h=200&fit=crop", status: "Active" },
    { id: "p5",  name: "Latte",            price: 4.20, unitOfMeasure: "per piece", tax: 5, description: "Espresso with generous steamed milk.",            image: "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=200&h=200&fit=crop", status: "Active" },
    { id: "p6",  name: "Macchiato",        price: 3.90, unitOfMeasure: "per piece", tax: 5, description: "Espresso marked with a dash of milk foam.",       image: "https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=200&h=200&fit=crop", status: "Active" },
    { id: "p7",  name: "Cortado",          price: 4.10, unitOfMeasure: "per piece", tax: 5, description: "Equal parts espresso and warm milk.",             image: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=200&h=200&fit=crop", status: "Active" },
    { id: "p8",  name: "Ristretto",        price: 3.60, unitOfMeasure: "per piece", tax: 5, description: "Short, concentrated espresso shot.",              image: "https://images.unsplash.com/photo-1580933073521-dc49ac0d4e6a?w=200&h=200&fit=crop", status: "Inactive" },
  ],
  "2": [ // Cold Brew
    { id: "p9",  name: "Cold Brew Classic",price: 5.00, unitOfMeasure: "per piece", tax: 5, description: "12-hour cold-steeped smooth coffee.",             image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop", status: "Active" },
    { id: "p10", name: "Nitro Cold Brew",  price: 5.50, unitOfMeasure: "per piece", tax: 5, description: "Cold brew infused with nitrogen gas.",            image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop", status: "Active" },
    { id: "p11", name: "Vanilla Cold Brew",price: 5.80, unitOfMeasure: "per piece", tax: 5, description: "Cold brew with vanilla sweet cream.",             image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&h=200&fit=crop", status: "Active" },
    { id: "p12", name: "Cold Brew Float",  price: 6.00, unitOfMeasure: "per piece", tax: 5, description: "Cold brew topped with ice cream.",                image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=200&h=200&fit=crop", status: "Active" },
    { id: "p13", name: "Cold Brew Tonic",  price: 5.50, unitOfMeasure: "per piece", tax: 5, description: "Cold brew over tonic water.",                     image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop", status: "Inactive" },
  ],
  "3": [ // Pastries
    { id: "p14", name: "Croissant",        price: 3.00, unitOfMeasure: "per piece", tax: 5, description: "Buttery, flaky French croissant.",                image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop", status: "Active" },
    { id: "p15", name: "Blueberry Muffin", price: 2.80, unitOfMeasure: "per piece", tax: 5, description: "Moist muffin with fresh blueberries.",            image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=200&h=200&fit=crop", status: "Active" },
    { id: "p16", name: "Almond Croissant", price: 3.50, unitOfMeasure: "per piece", tax: 5, description: "Croissant filled with almond cream.",             image: "https://images.unsplash.com/photo-1568051243858-533a607809a5?w=200&h=200&fit=crop", status: "Active" },
    { id: "p17", name: "Cinnamon Roll",    price: 3.20, unitOfMeasure: "per piece", tax: 5, description: "Soft roll with cinnamon sugar glaze.",            image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=200&h=200&fit=crop", status: "Active" },
    { id: "p18", name: "Banana Bread",     price: 3.00, unitOfMeasure: "per piece", tax: 5, description: "Moist homemade banana bread slice.",              image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200&h=200&fit=crop", status: "Active" },
    { id: "p19", name: "Pain au Chocolat", price: 3.50, unitOfMeasure: "per piece", tax: 5, description: "Croissant dough with dark chocolate.",            image: "https://images.unsplash.com/photo-1612978674174-666fe2c36a13?w=200&h=200&fit=crop", status: "Active" },
    { id: "p20", name: "Scone",            price: 2.50, unitOfMeasure: "per piece", tax: 5, description: "Classic British scone with jam.",                 image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop", status: "Active" },
    { id: "p21", name: "Brownie",          price: 3.00, unitOfMeasure: "per piece", tax: 5, description: "Rich chocolate fudge brownie.",                   image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop", status: "Active" },
    { id: "p22", name: "Lemon Tart",       price: 3.80, unitOfMeasure: "per piece", tax: 5, description: "Tangy lemon curd in a buttery shell.",            image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=200&h=200&fit=crop", status: "Inactive" },
    { id: "p23", name: "Eclair",           price: 4.00, unitOfMeasure: "per piece", tax: 5, description: "Choux pastry filled with custard.",               image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200&h=200&fit=crop", status: "Active" },
    { id: "p24", name: "Kouign Amann",     price: 4.20, unitOfMeasure: "per piece", tax: 5, description: "Caramelised Breton butter cake.",                 image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=200&h=200&fit=crop", status: "Active" },
  ],
  "4": [ // Sandwiches
    { id: "p25", name: "Club Sandwich",    price: 7.00, unitOfMeasure: "per piece", tax: 8, description: "Classic triple-decker club sandwich.",            image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop", status: "Active" },
    { id: "p26", name: "BLT",              price: 6.50, unitOfMeasure: "per piece", tax: 8, description: "Bacon, lettuce, tomato on toasted bread.",        image: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=200&h=200&fit=crop", status: "Active" },
    { id: "p27", name: "Avocado Toast",    price: 6.00, unitOfMeasure: "per piece", tax: 8, description: "Smashed avo on sourdough.",                       image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=200&h=200&fit=crop", status: "Active" },
    { id: "p28", name: "Grilled Cheese",   price: 5.50, unitOfMeasure: "per piece", tax: 8, description: "Classic melted cheese sandwich.",                 image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=200&h=200&fit=crop", status: "Active" },
    { id: "p29", name: "Tuna Melt",        price: 7.00, unitOfMeasure: "per piece", tax: 8, description: "Tuna salad with melted cheddar.",                 image: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=200&h=200&fit=crop", status: "Active" },
    { id: "p30", name: "Veggie Wrap",      price: 6.80, unitOfMeasure: "per piece", tax: 8, description: "Fresh veggies in a whole-wheat wrap.",            image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&h=200&fit=crop", status: "Active" },
    { id: "p31", name: "Turkey Sub",       price: 7.50, unitOfMeasure: "per piece", tax: 8, description: "Sliced turkey with mustard and pickles.",         image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&h=200&fit=crop", status: "Inactive" },
  ],
  "5": [ // Tea
    { id: "p32", name: "Matcha Latte",     price: 4.80, unitOfMeasure: "per piece", tax: 5, description: "Ceremonial matcha with steamed milk.",            image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&h=200&fit=crop", status: "Active" },
    { id: "p33", name: "Chai Latte",       price: 4.20, unitOfMeasure: "per piece", tax: 5, description: "Spiced masala chai with frothy milk.",            image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop", status: "Active" },
    { id: "p34", name: "Earl Grey",        price: 3.50, unitOfMeasure: "per piece", tax: 5, description: "Classic bergamot black tea.",                     image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop", status: "Active" },
    { id: "p35", name: "Green Tea",        price: 3.20, unitOfMeasure: "per piece", tax: 5, description: "Delicate Japanese sencha green tea.",             image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200&h=200&fit=crop", status: "Active" },
    { id: "p36", name: "Chamomile",        price: 3.00, unitOfMeasure: "per piece", tax: 5, description: "Soothing herbal chamomile tea.",                  image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop", status: "Active" },
    { id: "p37", name: "Iced Matcha",      price: 5.00, unitOfMeasure: "per piece", tax: 5, description: "Cold matcha latte over ice.",                     image: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?w=200&h=200&fit=crop", status: "Active" },
  ],
  "6": [ // Drinks
    { id: "p38", name: "Lemonade",         price: 3.80, unitOfMeasure: "per piece", tax: 5, description: "Freshly squeezed lemonade.",                      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop", status: "Active" },
    { id: "p39", name: "Orange Juice",     price: 4.00, unitOfMeasure: "per piece", tax: 5, description: "Freshly pressed orange juice.",                   image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=200&fit=crop", status: "Active" },
    { id: "p40", name: "Sparkling Water",  price: 2.50, unitOfMeasure: "per piece", tax: 5, description: "Chilled sparkling mineral water.",                image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=200&h=200&fit=crop", status: "Active" },
    { id: "p41", name: "Iced Tea",         price: 3.50, unitOfMeasure: "per piece", tax: 5, description: "Sweet brewed iced tea.",                          image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop", status: "Active" },
    { id: "p42", name: "Smoothie",         price: 5.50, unitOfMeasure: "per piece", tax: 5, description: "Blended fresh fruit smoothie.",                   image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&h=200&fit=crop", status: "Active" },
    { id: "p43", name: "Hot Chocolate",    price: 4.50, unitOfMeasure: "per piece", tax: 5, description: "Rich Belgian hot chocolate.",                     image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=200&h=200&fit=crop", status: "Active" },
    { id: "p44", name: "Apple Juice",      price: 3.50, unitOfMeasure: "per piece", tax: 5, description: "Chilled pressed apple juice.",                    image: "https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=200&h=200&fit=crop", status: "Active" },
    { id: "p45", name: "Mango Lassi",      price: 5.00, unitOfMeasure: "per piece", tax: 5, description: "Creamy yogurt and mango blend.",                  image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200&h=200&fit=crop", status: "Inactive" },
    { id: "p46", name: "Sparkling Lemon",  price: 4.00, unitOfMeasure: "per piece", tax: 5, description: "Lemonade with sparkling water.",                  image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&h=200&fit=crop", status: "Active" },
  ],
  "7": [ // Snacks
    { id: "p47", name: "Granola Bar",      price: 2.50, unitOfMeasure: "per piece", tax: 5, description: "Oat and honey granola bar.",                      image: "https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=200&h=200&fit=crop", status: "Active" },
    { id: "p48", name: "Trail Mix",        price: 3.00, unitOfMeasure: "per piece", tax: 5, description: "Mixed nuts and dried fruit.",                     image: "https://images.unsplash.com/photo-1604423043492-41b66c27e29e?w=200&h=200&fit=crop", status: "Active" },
    { id: "p49", name: "Yogurt Parfait",   price: 4.50, unitOfMeasure: "per piece", tax: 5, description: "Greek yogurt with berries and granola.",          image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop", status: "Active" },
    { id: "p50", name: "Rice Crackers",    price: 2.00, unitOfMeasure: "per piece", tax: 5, description: "Lightly salted rice crackers.",                   image: "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=200&h=200&fit=crop", status: "Active" },
  ],
  "8": [ // Seasonal
    { id: "p51", name: "Pumpkin Spice Latte", price: 5.50, unitOfMeasure: "per piece", tax: 5, description: "Fall classic with pumpkin and spice.",         image: "https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=200&h=200&fit=crop", status: "Active" },
    { id: "p52", name: "Peppermint Mocha",    price: 5.80, unitOfMeasure: "per piece", tax: 5, description: "Espresso with peppermint and chocolate.",      image: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=200&h=200&fit=crop", status: "Active" },
    { id: "p53", name: "Gingerbread Latte",   price: 5.50, unitOfMeasure: "per piece", tax: 5, description: "Warm spiced gingerbread latte.",               image: "https://images.unsplash.com/photo-1607283442723-2f78fa4be7b5?w=200&h=200&fit=crop", status: "Active" },
  ],
};
