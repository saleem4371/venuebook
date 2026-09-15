import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "support_call_requests.json");

let memoryStore = [];

function readRequests() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  return memoryStore;
}

function writeRequests(records) {
  memoryStore = records;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
  } catch (_) {}
}

export function createSupportCallRecord({
  userId,
  requesterType,
  name,
  phone,
  email,
  description,
  status = "PENDING",
}) {
  const current = readRequests();
  const timestamp = new Date().toISOString();
  const id = `SCR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const record = {
    id,
    userId: userId || null,
    requesterType: requesterType === "VENDOR" ? "VENDOR" : "CUSTOMER",
    name: name?.trim() || "",
    phone: phone?.trim() || "",
    email: email?.trim().toLowerCase() || "",
    description: description?.trim() || "",
    status,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  writeRequests([record, ...current]);
  return record;
}

export function getSupportCallRequests() {
  return readRequests();
}
