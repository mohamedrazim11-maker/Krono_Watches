import { NextRequest, NextResponse } from "next/server";
import { getFeedbacks, createFeedback } from "@/lib/server/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || searchParams.get("product_id") || undefined;

    const feedbacks = await getFeedbacks(productId);
    return NextResponse.json({
      success: true,
      feedbacks,
      data: feedbacks,
      total: feedbacks.length,
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve feedback." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product_id,
      productId,
      author,
      rating,
      title,
      comment,
      image_url,
      imageUrl,
      recommend,
      verified_buyer,
      verifiedBuyer,
      user_id,
      userId,
    } = body;

    const targetProductId = product_id || productId;
    if (!targetProductId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { success: false, message: "Feedback comment text is required." },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const saved = await createFeedback({
      product_id: targetProductId,
      author: (author || "").trim() || "Verified Collector",
      rating: numericRating,
      title: (title || "").trim() || "Verified Customer Review",
      comment: comment.trim(),
      image_url: image_url || imageUrl || null,
      recommend: recommend === "no" ? "no" : "yes",
      verified_buyer: verified_buyer !== false && verifiedBuyer !== false,
      user_id: user_id || userId || null,
    });

    return NextResponse.json({
      success: true,
      feedback: saved,
      data: saved,
      message: "Feedback submitted and stored successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
