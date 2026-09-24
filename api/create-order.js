const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// STYLE WEAR sale prices — server controlled
const PRODUCTS = [
  ["Classic Black T-Shirt", 649],
  ["Premium White Shirt", 1299],
  ["Blue Denim Jeans", 1374],
  ["Casual Hoodie", 1649],
  ["Black Denim Jacket", 2000],
  ["Cotton Polo T-Shirt", 974],
  ["Slim Fit Trousers", 1209],
  ["Festive Kurta", 1300],
  ["Premium Blazer", 4000],
  ["Designer Sherwani", 5250],
  ["Premium Leather Jacket", 7530],
  ["Luxury Winter Coat", 4375],

  ["Floral Summer Dress", 1374],
  ["Elegant Kurti", 1299],
  ["Designer Saree", 2500],
  ["Party Wear Suit", 2700],
  ["Casual Top", 844],
  ["Wide Leg Jeans", 1374],
  ["Winter Jacket", 2000],
  ["Embroidered Anarkali", 3200],
  ["Designer Lehenga", 7530],
  ["Premium Bridal Gown", 6300],
  ["Silk Designer Saree", 4000],
  ["Luxury Party Dress", 3200],

  ["Boys Graphic T-Shirt", 519],
  ["Girls Summer Dress", 779],
  ["Kids Denim Jeans", 779],
  ["Boys Kurta Set", 1099],
  ["Girls Party Frock", 1250],
  ["Kids Hoodie", 959],
  ["School Style Shirt", 649],
  ["Kids Winter Jacket", 1350],
  ["Premium Party Suit", 2000],
  ["Designer Kids Ethnic Set", 1800],

  ["Urban Sneakers", 1649],
  ["Classic White Sneakers", 1499],
  ["Men Formal Shoes", 2000],
  ["Women Heels", 1649],
  ["Women Casual Flats", 1169],
  ["Kids Sports Shoes", 959],
  ["Premium Running Shoes", 2250],
  ["Leather Loafers", 1924],

  ["Classic Backpack", 1299],
  ["Fashion Handbag", 1649],
  ["Premium Sunglasses", 1250],
  ["Classic Cap", 519],
  ["Leather Belt", 779],
  ["Fashion Watch", 2000],
  ["Premium Wallet", 1099],
  ["Travel Duffle Bag", 2250],
  ["Winter Scarf", 649]
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const items = Array.isArray(req.body?.items)
      ? req.body.items
      : [];

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const id = Number(item.id);
      const quantity = Number(item.quantity || 1);

      if (
        !Number.isInteger(id) ||
        !PRODUCTS[id] ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity"
        });
      }

      const [name, price] = PRODUCTS[id];

      total += price * quantity;

      orderItems.push({
        id,
        name,
        price,
        quantity
      });
    }

    // Razorpay uses paise
    const amount = total * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `SW-${Date.now()}`,
      payment_capture: 1,
      notes: {
        store: "STYLE WEAR"
      }
    });

    return res.status(200).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      items: orderItems
    });

  } catch (error) {
    console.error("Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order"
    });
  }
};