import { describe, it, expect } from "vitest";
import en from "@/data/education.en.json";
import de from "@/data/education.de.json";
import fr from "@/data/education.fr.json";
import ar from "@/data/education.ar.json";
import pl from "@/data/education.pl.json";
import ru from "@/data/education.ru.json";
import tr from "@/data/education.tr.json";

const requiredKeys = [
  "married_at_birth",
  "paternity_ack",
  "blocked_contact",
  "joint_declaration",
  "court_order",
  "distance_km",
  "mediation_tried",
  "parental_agreement_possible",
];

const educationFiles = [
  { name: "EN", data: en },
  { name: "DE", data: de },
  { name: "FR", data: fr },
  { name: "AR", data: ar },
  { name: "PL", data: pl },
  { name: "RU", data: ru },
  { name: "TR", data: tr },
];

describe("education content keys", () => {
  educationFiles.forEach(({ name, data }) => {
    it(`${name} contains required keys`, () => {
      for (const k of requiredKeys) {
        expect((data as Record<string, unknown>)[k]).toBeTruthy();
      }
    });
  });
});
