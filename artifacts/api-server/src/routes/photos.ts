import { Router, type IRouter } from "express";
import multer from "multer";
import { db, photos, insertPhotoSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { uploadPhoto, deletePhoto } from "../lib/supabaseStorage";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.use(isAuthenticated);

// GET /api/photos?clientId=...
router.get("/photos", async (req, res, next) => {
  try {
    const clientId = typeof req.query["clientId"] === "string" ? req.query["clientId"] : undefined;
    const rows = clientId
      ? await db.select().from(photos).where(eq(photos.clientId, clientId)).orderBy(desc(photos.uploadedAt))
      : await db.select().from(photos).orderBy(desc(photos.uploadedAt));
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// POST /api/photos/upload — multipart upload, stores file in Supabase Storage
router.post("/photos/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file provided. Send file as multipart field 'file'." });
      return;
    }

    const publicUrl = await uploadPhoto(req.file.buffer, req.file.originalname, req.file.mimetype);

    const parsed = insertPhotoSchema.safeParse({
      clientId: req.body.clientId,
      photoUrl: publicUrl,
      mealType: req.body.mealType ?? "other",
      remarks: req.body.remarks ?? null,
      dietPlanId: req.body.dietPlanId ?? null,
      dayNumber: req.body.dayNumber ? Number(req.body.dayNumber) : null,
      isOnTime: req.body.isOnTime !== undefined ? req.body.isOnTime === "true" : true,
    });

    if (!parsed.success) {
      res.status(400).json({ message: "Invalid fields", issues: parsed.error.issues });
      return;
    }

    const [row] = await db.insert(photos).values(parsed.data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

// POST /api/photos — save by URL only (no file upload)
router.post("/photos", async (req, res, next) => {
  try {
    const data = insertPhotoSchema.parse(req.body);
    const [row] = await db.insert(photos).values(data).returning();
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/photos/:id — removes from DB and Supabase Storage
router.delete("/photos/:id", async (req, res, next) => {
  try {
    const [row] = await db.delete(photos).where(eq(photos.id, req.params.id)).returning();
    if (!row) {
      res.status(404).json({ message: "Photo not found" });
      return;
    }
    // Best-effort delete from storage
    if (row.photoUrl) {
      deletePhoto(row.photoUrl).catch(() => {});
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
