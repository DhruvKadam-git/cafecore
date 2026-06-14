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
  await prisma.restaurantTable.deleteMany();
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
    data: { name: 'Ground Floor', sortOrder: 0 },
  });
  const floor1 = await prisma.floor.create({
    data: { name: 'First Floor', sortOrder: 1 },
  });

  // Create Tables
  const tables: any[] = [];
  const gTableConfigs = [
    { name: 'T1', capacity: 2 },
    { name: 'T2', capacity: 2 },
    { name: 'T3', capacity: 4 },
    { name: 'T4', capacity: 4 },
    { name: 'T5', capacity: 6 },
    { name: 'T6', capacity: 2 },
    { name: 'T7', capacity: 4 },
    { name: 'T8', capacity: 8 },
  ];
  const fTableConfigs = [
    { name: 'T9', capacity: 2 },
    { name: 'T10', capacity: 2 },
    { name: 'T11', capacity: 4 },
    { name: 'T12', capacity: 4 },
    { name: 'T13', capacity: 6 },
    { name: 'T14', capacity: 2 },
    { name: 'T15', capacity: 4 },
    { name: 'T16', capacity: 6 },
  ];

  for (const config of gTableConfigs) {
    const t = await prisma.restaurantTable.create({
      data: { tableNumber: config.name, seats: config.capacity, floorId: floorG.id, status: 'AVAILABLE' },
    });
    tables.push(t);
  }

  for (const config of fTableConfigs) {
    const t = await prisma.restaurantTable.create({
      data: { tableNumber: config.name, seats: config.capacity, floorId: floor1.id, status: 'AVAILABLE' },
    });
    tables.push(t);
  }

  console.log('✅ Infrastructure seeded. Seeding Categories & Products...');

  // Create Categories
  const categoriesData = [
    { name: 'Coffee' },
    { name: 'Tea & Chai' },
    { name: 'Bakery' },
    { name: 'Sandwiches & Wraps' },
    { name: 'Desserts' },
    { name: 'Cold Beverages' },
  ];

  const categoriesMap: { [key: string]: string } = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    categoriesMap[cat.name] = c.id;
  }

  // Create Products
  const productsData = [
    // Coffee
    { name: 'Espresso', price: 2.50, categoryName: 'Coffee', description: 'Rich and concentrated shot of coffee', imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop' },
    { name: 'Caffe Latte', price: 4.20, categoryName: 'Coffee', description: 'Espresso with steamed milk and a light layer of foam', imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?w=400&h=400&fit=crop' },
    { name: 'Cappuccino', price: 4.20, categoryName: 'Coffee', description: 'Espresso, steamed milk, and wet milk foam', imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop' },
    { name: 'Americano', price: 3.20, categoryName: 'Coffee', description: 'Espresso shots topped with hot water', imageUrl: 'https://images.unsplash.com/photo-1551030173-1d9694761516?w=400&h=400&fit=crop' },
    { name: 'Caramel Macchiato', price: 4.80, categoryName: 'Coffee', description: 'Espresso with vanilla syrup, milk, and caramel drizzle', imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=400&h=400&fit=crop' },
    { name: 'Mocha', price: 4.70, categoryName: 'Coffee', description: 'Espresso, chocolate syrup, and steamed milk', imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=400&fit=crop' },

    // Tea
    { name: 'Masala Chai', price: 3.50, categoryName: 'Tea & Chai', description: 'Brewed black tea with spiced milk and sugar', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=400&fit=crop' },
    { name: 'Matcha Latte', price: 4.90, categoryName: 'Tea & Chai', description: 'Pure Japanese matcha green tea whisked with milk', imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=400&fit=crop' },
    { name: 'Green Tea', price: 3.00, categoryName: 'Tea & Chai', description: 'Delicate and refreshing steamed green tea leaves', imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=400&fit=crop' },
    { name: 'Earl Grey Tea', price: 3.20, categoryName: 'Tea & Chai', description: 'Black tea scented with oil of bergamot', imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=400&fit=crop' },

    // Bakery
    { name: 'Butter Croissant', price: 3.00, categoryName: 'Bakery', description: 'Flaky and buttery classic French pastry', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop' },
    { name: 'Chocolate Croissant', price: 3.50, categoryName: 'Bakery', description: 'Butter croissant stuffed with rich chocolate', imageUrl: 'https://images.unsplash.com/photo-1612978674174-666fe2c36a13?w=400&h=400&fit=crop' },
    { name: 'Blueberry Muffin', price: 3.20, categoryName: 'Bakery', description: 'Moist muffin loaded with fresh blueberries', imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop' },
    { name: 'Chocolate Chip Cookie', price: 2.50, categoryName: 'Bakery', description: 'Chewy, freshly baked cookie with chocolate chips', imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop' },

    // Sandwiches
    { name: 'Caprese Sandwich', price: 7.90, categoryName: 'Sandwiches & Wraps', description: 'Mozzarella, tomato, pesto, and balsamic glaze on ciabatta', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop' },
    { name: 'Chicken Club Sandwich', price: 8.50, categoryName: 'Sandwiches & Wraps', description: 'Grilled chicken, bacon, lettuce, tomato, and mayo', imageUrl: 'https://images.unsplash.com/photo-1567234669013-216f9fa26c36?w=400&h=400&fit=crop' },
    { name: 'Avocado Toast', price: 7.20, categoryName: 'Sandwiches & Wraps', description: 'Smashed avocado, cherry tomatoes, and feta on sourdough', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&h=400&fit=crop' },
    { name: 'Paneer Tikka Wrap', price: 7.80, categoryName: 'Sandwiches & Wraps', description: 'Spiced paneer, veggies, and mint chutney wrapped in tortilla', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop' },

    // Desserts
    { name: 'New York Cheesecake', price: 5.50, categoryName: 'Desserts', description: 'Creamy and dense classic cheesecake', imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop' },
    { name: 'Tiramisu slice', price: 5.80, categoryName: 'Desserts', description: 'Espresso-soaked ladyfingers with mascarpone cream', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop' },
    { name: 'Chocolate Fudge Cake', price: 5.20, categoryName: 'Desserts', description: 'Rich and moist triple chocolate fudge cake', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop' },

    // Cold Beverages
    { name: 'Iced Peach Tea', price: 3.80, categoryName: 'Cold Beverages', description: 'Sweetened iced tea flavored with fresh peaches', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop' },
    { name: 'Cold Brew Coffee', price: 4.00, categoryName: 'Cold Beverages', description: 'Slow-steeped iced coffee', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop' },
    { name: 'Mango Smoothie', price: 5.00, categoryName: 'Cold Beverages', description: 'Blended fresh mangoes, yogurt, and honey', imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop' },
    { name: 'Chocolate Milkshake', price: 4.80, categoryName: 'Cold Beverages', description: 'Thick and creamy classic chocolate milkshake', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop' },
  ];

  const products: any[] = [];
  for (const prod of productsData) {
    const p = await prisma.product.create({
      data: {
        name: prod.name,
        price: prod.price,
        description: prod.description,
        categoryId: categoriesMap[prod.categoryName],
        taxRate: 5.00,
        imageUrl: prod.imageUrl,
      },
    });
    products.push(p);
  }

  console.log('✅ Menu seeded. Seeding Customers...');

  const customers: any[] = [];
  for (const cust of CUSTOMERS_POOL) {
    const c = await prisma.customer.create({ 
      data: {
        name: cust.name,
        email: cust.email,
        phoneNumber: cust.phone,
      } 
    });
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
  today.setHours(0, 0, 0, 0);
  const startDate = new Date();
  startDate.setDate(today.getDate() - 365);
  startDate.setHours(0, 0, 0, 0);

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

  while (currentDay < today) {
    // Generate daily session for employee
    const sessionStart = new Date(currentDay);
    sessionStart.setHours(7, 30, 0, 0); // shift starts at 7:30 AM
    
    const sessionEnd = new Date(currentDay);
    sessionEnd.setHours(22, 0, 0, 0); // shift ends at 10:00 PM

    const session = await prisma.session.create({
      data: {
        openedByUserId: employee.id,
        status: 'CLOSED',
        createdAt: sessionStart,
        closedAt: sessionEnd,
        openedAt: sessionStart,
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

      // Determine table
      const randomTable = tables[Math.floor(Math.random() * tables.length)];
      const tableId = randomTable.id;

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
      let taxTotal = 0;
      const orderItemsData = selectedProducts.map(p => {
        const qty = Math.random() < 0.15 ? 2 : 1; // 15% chance of quantity 2, else 1
        const price = p.price;
        const taxRate = 5.00;
        const lineSubtotal = price * qty;
        const lineTax = (lineSubtotal * taxRate) / 100;
        const lineTotal = lineSubtotal + lineTax;

        subtotal += lineSubtotal;
        taxTotal += lineTax;

        return {
          productId: p.id,
          productNameSnapshot: p.name,
          unitPriceSnapshot: price,
          taxRateSnapshot: taxRate,
          quantity: qty,
          lineSubtotal,
          lineTax,
          lineDiscount: 0,
          lineTotal,
        };
      });

      // Apply coupon or discount logic (15% chance of coupon application)
      let discountTotal = 0;
      let appliedCouponCode = '';

      if (!isCancelled && Math.random() < 0.15) {
        if (isWeekend && subtotal >= couponWeekend.minOrderAmount!) {
          discountTotal = subtotal * (couponWeekend.discountPercentage / 100);
          appliedCouponCode = couponWeekend.code;
        } else if (subtotal >= couponWelcome.minOrderAmount!) {
          discountTotal = subtotal * (couponWelcome.discountPercentage / 100);
          appliedCouponCode = couponWelcome.code;
        }
      }

      const grandTotal = subtotal + taxTotal - discountTotal;

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
          orderNumber: `ORD-${currentDay.toISOString().split('T')[0].replace(/-/g, '')}-${orderCounter}`,
          sessionId: session.id,
          tableId,
          customerId: customerId || undefined,
          createdByUserId: employee.id,
          status,
          subtotal,
          taxTotal,
          discountTotal,
          grandTotal,
          notes: appliedCouponCode ? `Applied coupon ${appliedCouponCode}` : null,
          createdAt: orderTime,
          updatedAt: orderTime,
          orderItems: {
            create: orderItemsData,
          },
          payments: {
            create: {
              amount: parseFloat(grandTotal.toFixed(2)),
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
