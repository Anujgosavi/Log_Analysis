import connectDB from "@/lib/mongodb";
import Order1 from "@/models/Order1";
import logger from "@/lib/logger";

export async function GET() {
  try {
    logger.info("GET /api/orders - Fetching all orders");
    await connectDB();
    const orders = await Order1.find().sort({ createdAt: -1 }).lean();
    logger.info(`GET /api/orders - Successfully fetched ${orders.length} orders`);
    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logger.error("GET /api/orders - Error fetching orders:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req: Request) {
  try {
    logger.info("POST /api/orders - Creating new order");
    await connectDB();
    const body = await req.json();

    // ✅ Updated validation for your frontend payload
    if (
      !body ||
      !body.customerName ||
      !body.address ||
      !Array.isArray(body.items) ||
      typeof body.totalAmount !== "number"
    ) {
      logger.warn("POST /api/orders - Invalid payload received");
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Match your model structure
    const order = await Order1.create({
      customerName: body.customerName,
      address: body.address,
      items: body.items,
      totalAmount: body.totalAmount,
      status: body.status || "pending",
    });

    logger.info(`POST /api/orders - Order created successfully with ID: ${order._id}`);
    return new Response(JSON.stringify(order), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logger.error("POST /api/orders - Error creating order:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
