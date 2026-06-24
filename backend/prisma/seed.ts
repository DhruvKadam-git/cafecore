import { PrismaClient, UserRole, UserStatus, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Weighted hours to simulate realistic cafe traffic peaks
// Morning peak: 8 AM - 10 AM
// Lunch peak: 12 PM - 2 PM
// Afternoon coffee rush: 3 PM - 4:30 PM
// Dinner peak: 6:30 PM - 8:30 PM
const HOUR_DISTRIBUTION = [
  8, 8, 9, 9, 9, 10, 10, 10,
  11, 11,
  12, 12, 12, 12, 13, 13, 13, 13, 14, 14,
  15, 15, 16, 16, 16, 17, 17,
  18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 21
];

// Names for generating repeat customers
const CUSTOMERS_POOL = [
  { name: 'John Doe', email: 'john.doe@gmail.com', phone: '9876543210' },
  { name: 'Jane Smith', email: 'jane.smith@yahoo.com', phone: '9876543211' },
  { name: 'Robert Johnson', email: 'robert.j@outlook.com', phone: '9876543212' },
  { name: 'Emily Davis', email: 'emily.d@gmail.com', phone: '9876543213' },
  { name: 'Michael Brown', email: 'mbrown@gmail.com', phone: '9876543214' },
  { name: 'Linda Wilson', email: 'linda.w@hotmail.com', phone: '9876543215' },
  { name: 'William Taylor', email: 'william.t@gmail.com', phone: '9876543216' },
  { name: 'Elizabeth Thomas', email: 'ethomas@gmail.com', phone: '9876543217' },
  { name: 'David Moore', email: 'david.moore@gmail.com', phone: '9876543218' },
  { name: 'Barbara Martin', email: 'bmartin@gmail.com', phone: '9876543219' },
  { name: 'Richard Jackson', email: 'rjackson@gmail.com', phone: '9876543220' },
  { name: 'Susan Anderson', email: 'susan.a@gmail.com', phone: '9876543221' },
  { name: 'Joseph Taylor', email: 'jtaylor@gmail.com', phone: '9876543222' },
  { name: 'Jessica Taylor', email: 'jess.t@gmail.com', phone: '9876543223' },
  { name: 'Thomas White', email: 'twhite@gmail.com', phone: '9876543224' },
  { name: 'Sarah Harris', email: 'sarah.h@gmail.com', phone: '9876543225' },
  { name: 'Charles Martin', email: 'cmartin@gmail.com', phone: '9876543226' },
  { name: 'Karen Clark', email: 'kclark@gmail.com', phone: '9876543227' },
  { name: 'Christopher Lewis', email: 'clewis@gmail.com', phone: '9876543228' },
  { name: 'Nancy Robinson', email: 'nrobinson@gmail.com', phone: '9876543229' },
  { name: 'Daniel Walker', email: 'dwalker@gmail.com', phone: '9876543230' },
  { name: 'Lisa Young', email: 'lyoung@gmail.com', phone: '9876543231' },
  { name: 'Matthew Allen', email: 'mallen@gmail.com', phone: '9876543232' },
  { name: 'Betty King', email: 'bking@gmail.com', phone: '9876543233' },
  { name: 'Anthony Wright', email: 'awright@gmail.com', phone: '9876543234' },
  { name: 'Margaret Scott', email: 'mscott@gmail.com', phone: '9876543235' },
  { name: 'Mark Green', email: 'mgreen@gmail.com', phone: '9876543236' },
  { name: 'Sandra Baker', email: 'sbaker@gmail.com', phone: '9876543237' },
  { name: 'Donald Adams', email: 'dadams@gmail.com', phone: '9876543238' },
  { name: 'Ashley Nelson', email: 'anelson@gmail.com', phone: '9876543239' },
  { name: 'Paul Carter', email: 'pcarter@gmail.com', phone: '9876543240' },
  { name: 'Kimberly Mitchell', email: 'kmitchell@gmail.com', phone: '9876543241' },
  { name: 'Steven Perez', email: 'sperez@gmail.com', phone: '9876543242' },
  { name: 'Emily Roberts', email: 'eroberts@gmail.com', phone: '9876543243' },
  { name: 'Andrew Turner', email: 'aturner@gmail.com', phone: '9876543244' },
  { name: 'Donna Phillips', email: 'dphillips@gmail.com', phone: '9876543245' },
  { name: 'Joshua Campbell', email: 'jcampbell@gmail.com', phone: '9876543246' },
  { name: 'Michelle Parker', email: 'mparker@gmail.com', phone: '9876543247' },
  { name: 'Kevin Evans', email: 'kevins@gmail.com', phone: '9876543248' },
  { name: 'Sarah Edwards', email: 'sedwards@gmail.com', phone: '9876543249' }
];

async function main() {
  console.log('🌱 Starting database clean up...');
  
  // Clean tables in reverse order of foreign key dependencies
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.table.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Clean up complete. Seeding users...');

  // Create Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const employeePasswordHash = await bcrypt.hash('Employee@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cafe.com',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: 'employee@cafe.com',
      name: 'Employee User',
      passwordHash: employeePasswordHash,
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Users seeded. Seeding Infrastructure (Floors & Tables)...');

  // Create Floors
  const floorG = await prisma.floor.create({
    data: { name: 'Ground Floor', floorNumber: 0, description: 'Main dining hall and counter' },
  });
  const floor1 = await prisma.floor.create({
    data: { name: 'First Floor', floorNumber: 1, description: 'Cozy seating area and balcony' },
  });

  // Create Tables
  const tables: any[] = [];
  const gTableConfigs = [
    { name: 'Table 1', capacity: 2 },
    { name: 'Table 2', capacity: 2 },
    { name: 'Table 3', capacity: 4 },
    { name: 'Table 4', capacity: 4 },
    { name: 'Table 5', capacity: 6 },
    { name: 'Table 6', capacity: 2 },
    { name: 'Table 7', capacity: 4 },
    { name: 'Table 8', capacity: 8 },
  ];
  const fTableConfigs = [
    { name: 'Table 9', capacity: 2 },
    { name: 'Table 10', capacity: 2 },
    { name: 'Table 11', capacity: 4 },
    { name: 'Table 12', capacity: 4 },
    { name: 'Table 13', capacity: 6 },
    { name: 'Table 14', capacity: 2 },
    { name: 'Table 15', capacity: 4 },
    { name: 'Table 16', capacity: 6 },
  ];

  for (const config of gTableConfigs) {
    const t = await prisma.table.create({
      data: { ...config, floorId: floorG.id, status: 'available' },
    });
    tables.push(t);
  }

  for (const config of fTableConfigs) {
    const t = await prisma.table.create({
      data: { ...config, floorId: floor1.id, status: 'available' },
    });
    tables.push(t);
  }

  console.log('✅ Infrastructure seeded. Seeding Categories & Products...');

  // Create Categories
  const categoriesData = [
    { name: 'Coffee', description: 'Hot and cold brewed coffee beverages' },
    { name: 'Tea & Chai', description: 'Premium selection of hot teas and classic chai' },
    { name: 'Bakery', description: 'Freshly baked croissants, muffins, and cookies' },
    { name: 'Sandwiches & Wraps', description: 'Freshly prepared wraps and sandwiches' },
    { name: 'Desserts', description: 'Sweet treats, pastries, and cakes' },
    { name: 'Cold Beverages', description: 'Shakes, iced drinks, and juices' },
  ];

  const categoriesMap: { [key: string]: string } = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    categoriesMap[cat.name] = c.id;
  }

  // Create Products
  const productsData = [
    // Coffee
    { name: 'Espresso', price: 2.50, categoryName: 'Coffee', description: 'Rich and concentrated shot of coffee' },
    { name: 'Caffe Latte', price: 4.20, categoryName: 'Coffee', description: 'Espresso with steamed milk and a light layer of foam' },
    { name: 'Cappuccino', price: 4.20, categoryName: 'Coffee', description: 'Espresso, steamed milk, and wet milk foam' },
    { name: 'Americano', price: 3.20, categoryName: 'Coffee', description: 'Espresso shots topped with hot water' },
    { name: 'Caramel Macchiato', price: 4.80, categoryName: 'Coffee', description: 'Espresso with vanilla syrup, milk, and caramel drizzle' },
    { name: 'Mocha', price: 4.70, categoryName: 'Coffee', description: 'Espresso, chocolate syrup, and steamed milk' },

    // Tea
    { name: 'Masala Chai', price: 3.50, categoryName: 'Tea & Chai', description: 'Brewed black tea with spiced milk and sugar' },
    { name: 'Matcha Latte', price: 4.90, categoryName: 'Tea & Chai', description: 'Pure Japanese matcha green tea whisked with milk' },
    { name: 'Green Tea', price: 3.00, categoryName: 'Tea & Chai', description: 'Delicate and refreshing steamed green tea leaves' },
    { name: 'Earl Grey Tea', price: 3.20, categoryName: 'Tea & Chai', description: 'Black tea scented with oil of bergamot' },

    // Bakery
    { name: 'Butter Croissant', price: 3.00, categoryName: 'Bakery', description: 'Flaky and buttery classic French pastry' },
    { name: 'Chocolate Croissant', price: 3.50, categoryName: 'Bakery', description: 'Butter croissant stuffed with rich chocolate' },
    { name: 'Blueberry Muffin', price: 3.20, categoryName: 'Bakery', description: 'Moist muffin loaded with fresh blueberries' },
    { name: 'Chocolate Chip Cookie', price: 2.50, categoryName: 'Bakery', description: 'Chewy, freshly baked cookie with chocolate chips' },

    // Sandwiches
    { name: 'Caprese Sandwich', price: 7.90, categoryName: 'Sandwiches & Wraps', description: 'Mozzarella, tomato, pesto, and balsamic glaze on ciabatta' },
    { name: 'Chicken Club Sandwich', price: 8.50, categoryName: 'Sandwiches & Wraps', description: 'Grilled chicken, bacon, lettuce, tomato, and mayo' },
    { name: 'Avocado Toast', price: 7.20, categoryName: 'Sandwiches & Wraps', description: 'Smashed avocado, cherry tomatoes, and feta on sourdough' },
    { name: 'Paneer Tikka Wrap', price: 7.80, categoryName: 'Sandwiches & Wraps', description: 'Spiced paneer, veggies, and mint chutney wrapped in tortilla' },

    // Desserts
    { name: 'New York Cheesecake', price: 5.50, categoryName: 'Desserts', description: 'Creamy and dense classic cheesecake' },
    { name: 'Tiramisu slice', price: 5.80, categoryName: 'Desserts', description: 'Espresso-soaked ladyfingers with mascarpone cream' },
    { name: 'Chocolate Fudge Cake', price: 5.20, categoryName: 'Desserts', description: 'Rich and moist triple chocolate fudge cake' },

    // Cold Beverages
    { name: 'Iced Peach Tea', price: 3.80, categoryName: 'Cold Beverages', description: 'Sweetened iced tea flavored with fresh peaches' },
    { name: 'Cold Brew Coffee', price: 4.00, categoryName: 'Cold Beverages', description: 'Slow-steeped iced coffee' },
    { name: 'Mango Smoothie', price: 5.00, categoryName: 'Cold Beverages', description: 'Blended fresh mangoes, yogurt, and honey' },
    { name: 'Chocolate Milkshake', price: 4.80, categoryName: 'Cold Beverages', description: 'Thick and creamy classic chocolate milkshake' },
  ];

  const products: any[] = [];
  for (const prod of productsData) {
    const p = await prisma.product.create({
      data: {
        name: prod.name,
        price: prod.price,
        description: prod.description,
        categoryId: categoriesMap[prod.categoryName],
      },
    });
    products.push(p);
  }

  console.log('✅ Menu seeded. Seeding Customers...');

  const customers: any[] = [];
  for (const cust of CUSTOMERS_POOL) {
    const c = await prisma.customer.create({ data: cust });
    customers.push(c);
  }

  console.log('✅ Customers seeded. Seeding Coupons & Promotions...');

  // Coupons
  const couponWelcome = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      description: '10% off for new customers',
      discountPercentage: 10,
      minOrderAmount: 10,
      expiryDate: new Date('2027-12-31'),
      maxUsageCount: 1000,
    },
  });

  const couponWeekend = await prisma.coupon.create({
    data: {
      code: 'WEEKEND15',
      description: '15% off weekend orders',
      discountPercentage: 15,
      minOrderAmount: 20,
      expiryDate: new Date('2027-12-31'),
      maxUsageCount: 500,
    },
  });

  console.log('✅ Infrastructure/Base Setup Done. Starting transactional historical seed generation...');

  // Start Date: exactly 1 year ago (365 days ago)
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 365);

  console.log(`Generating orders from ${startDate.toDateString()} to ${today.toDateString()}...`);

  // We loop day-by-day to generate sessions and orders
  let currentDay = new Date(startDate);
  let orderCounter = 0;
  let dayCounter = 0;

  // Pre-fetch some product categories to support contextual breakfast/lunch/dinner orders
  const breakfastProducts = products.filter(p => 
    p.categoryId === categoriesMap['Coffee'] || p.categoryId === categoriesMap['Tea & Chai'] || p.categoryId === categoriesMap['Bakery']
  );
  const lunchDinnerProducts = products.filter(p => 
    p.categoryId === categoriesMap['Sandwiches & Wraps'] || p.categoryId === categoriesMap['Cold Beverages'] || p.categoryId === categoriesMap['Desserts']
  );

  while (currentDay <= today) {
    // Generate daily session for employee
    const sessionStart = new Date(currentDay);
    sessionStart.setHours(7, 30, 0, 0); // shift starts at 7:30 AM
    
    const sessionEnd = new Date(currentDay);
    sessionEnd.setHours(22, 0, 0, 0); // shift ends at 10:00 PM

    const session = await prisma.session.create({
      data: {
        userId: employee.id,
        description: `Daily Shift - ${currentDay.toISOString().split('T')[0]}`,
        status: 'closed',
        createdAt: sessionStart,
        closedAt: sessionEnd,
      },
    });

    const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 5 || currentDay.getDay() === 6; // Fri, Sat, Sun
    
    // Set base order counts: weekdays (12-18), weekends (22-30)
    let minOrders = isWeekend ? 22 : 12;
    let maxOrders = isWeekend ? 30 : 18;

    // Apply seasonal adjustments
    const month = currentDay.getMonth(); // 0 is January, 11 is December
    if (month === 11 || month === 0) { // Dec, Jan (Holiday Season) -> Increase traffic
      minOrders = Math.floor(minOrders * 1.25);
      maxOrders = Math.floor(maxOrders * 1.25);
    } else if (month === 5 || month === 6) { // June, July (Summer) -> Increase slightly
      minOrders = Math.floor(minOrders * 1.1);
      maxOrders = Math.floor(maxOrders * 1.1);
    }

    const dailyOrderCount = Math.floor(Math.random() * (maxOrders - minOrders + 1)) + minOrders;

    // Generate orders for the day
    for (let o = 0; o < dailyOrderCount; o++) {
      // Pick hour using our peak distribution
      const hour = HOUR_DISTRIBUTION[Math.floor(Math.random() * HOUR_DISTRIBUTION.length)];
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);

      const orderTime = new Date(currentDay);
      orderTime.setHours(hour, minute, second, 0);

      // Determine customer (60% regular, 40% walk-in)
      let customerId: string | null = null;
      if (Math.random() < 0.6) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        customerId = randomCustomer.id;
      }

      // Determine order type: dine-in (75%) vs takeaway (25%)
      let tableId: string | null = null;
      if (Math.random() < 0.75) {
        const randomTable = tables[Math.floor(Math.random() * tables.length)];
        tableId = randomTable.id;
      }

      // Select products based on time of day
      let menuSubset = products;
      if (hour <= 11) {
        menuSubset = breakfastProducts; // morning coffee + bakery
      } else if (hour >= 12 && hour <= 14 || hour >= 18) {
        menuSubset = lunchDinnerProducts; // lunch & dinner sandwiches
      }

      // Determine number of items in order (1 to 4)
      const numItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts: any[] = [];
      const usedProductIds = new Set<string>();

      while (selectedProducts.length < numItems) {
        const p = menuSubset[Math.floor(Math.random() * menuSubset.length)];
        if (!usedProductIds.has(p.id)) {
          selectedProducts.push(p);
          usedProductIds.add(p.id);
        }
      }

      // Order status distribution: 96% completed, 4% cancelled
      const isCancelled = Math.random() < 0.04;
      const status = isCancelled ? OrderStatus.CANCELLED : OrderStatus.COMPLETED;

      // Map out the order items data
      let subtotal = 0;
      const orderItemsData = selectedProducts.map(p => {
        const qty = Math.random() < 0.15 ? 2 : 1; // 15% chance of quantity 2, else 1
        const price = p.price;
        subtotal += price * qty;
        return {
          productId: p.id,
          quantity: qty,
          unitPrice: price,
          createdAt: orderTime,
        };
      });

      // Apply coupon or discount logic (15% chance of coupon application)
      let finalAmount = subtotal;
      let appliedCouponCode = '';

      if (!isCancelled && Math.random() < 0.15) {
        if (isWeekend && subtotal >= couponWeekend.minOrderAmount!) {
          finalAmount = subtotal * (1 - couponWeekend.discountPercentage / 100);
          appliedCouponCode = couponWeekend.code;
        } else if (subtotal >= couponWelcome.minOrderAmount!) {
          finalAmount = subtotal * (1 - couponWelcome.discountPercentage / 100);
          appliedCouponCode = couponWelcome.code;
        }
      }

      // Create Order, OrderItems, and Payment inside nested transaction
      const paymentMethod = [
        PaymentMethod.UPI,
        PaymentMethod.CARD,
        PaymentMethod.CASH,
        PaymentMethod.WALLET
      ][Math.floor(Math.random() * 4)];

      const paymentStatus = isCancelled 
        ? (Math.random() < 0.5 ? PaymentStatus.FAILED : PaymentStatus.REFUNDED)
        : PaymentStatus.COMPLETED;

      await prisma.order.create({
        data: {
          customerId,
          tableId,
          status,
          notes: appliedCouponCode ? `Applied coupon ${appliedCouponCode}` : null,
          createdAt: orderTime,
          updatedAt: orderTime,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              amount: parseFloat(finalAmount.toFixed(2)),
              method: paymentMethod,
              status: paymentStatus,
              createdAt: orderTime,
              updatedAt: orderTime,
            },
          },
        },
      });

      orderCounter++;
    }

    dayCounter++;
    if (dayCounter % 30 === 0) {
      console.log(`Generated ${orderCounter} orders spanning ${dayCounter} days...`);
    }

    // Move to next day
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Update coupon usage count to reflect the seeds
  await prisma.coupon.update({
    where: { code: couponWelcome.code },
    data: { currentUsageCount: Math.floor(orderCounter * 0.08) },
  });
  await prisma.coupon.update({
    where: { code: couponWeekend.code },
    data: { currentUsageCount: Math.floor(orderCounter * 0.05) },
  });

  console.log(`🌱 Seeding complete! Total generated:`);
  console.log(`- ${dayCounter} days of timeline`);
  console.log(`- ${orderCounter} unique orders with complete items and payments`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
