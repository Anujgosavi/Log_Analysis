import connectDB from "@/lib/mongodb";
import Food from "@/models/Food";
import { FOOD_ITEMS } from "@/lib/dummy-data";
import logger from "@/lib/logger";

export async function GET() {
  try {
    logger.info("GET /api/foods - Fetching all foods");
    await connectDB();

    const count = await Food.countDocuments();
    if (count === 0) {
      logger.info("GET /api/foods - Database empty, seeding with dummy data");
      await Food.insertMany(
        FOOD_ITEMS.map((f) => ({
          name: f.name,
          category: f.category,
          description: f.description,
          price: f.price,
          rating: f.rating,
          image: f.image,
        }))
      );
      logger.info(`GET /api/foods - Seeded ${FOOD_ITEMS.length} food items`);
    }

    const foods = await Food.find().lean();
    logger.info(`GET /api/foods - Successfully fetched ${foods.length} foods`);
    return new Response(JSON.stringify(foods), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logger.error("GET /api/foods - Error fetching foods:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


