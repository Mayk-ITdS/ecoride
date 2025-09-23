import { Router } from "express";
import EmployeeController from "../controllers/EmployeeController.js";

export default function makeReviewRouter(passengerNotes) {
  const r = Router();
  r.get("/", EmployeeController.getPublicTestimonials(passengerNotes));
  r.get("/pending", EmployeeController.getPendingReviews(passengerNotes));
  r.post("/:id/approve", EmployeeController.approveReview(passengerNotes));
  r.post("/:id/reject", EmployeeController.rejectReview(passengerNotes));
  return r;
}
