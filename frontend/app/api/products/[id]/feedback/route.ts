import { NextRequest, NextResponse } from "next/server";
import { getFeedbacks, createFeedback } from "@/lib/server/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const feedbacks = await getFeedbacks(id);
    return NextResponse.json({
      success: true,
      feedbacks,
      data: feedbacks,
      total: feedbacks.length,
    });
  } catch (error: any) {
    console.error("GET /api/products/[id]/feedback error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve product feedback." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
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

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { success: false, message: "Feedback comment text is required." },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be a numeric score between 1 and 5." },
        { status: 400 }
      );
    }

    const saved = await createFeedback({
      product_id: id,
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
    console.error("POST /api/products/[id]/feedback error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit product feedback." },
      { status: 500 }
    );
  }
}
