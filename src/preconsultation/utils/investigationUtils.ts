import { InvestigationItem, MedicationItem } from "../types";

/**
 * Parses numeric value from a string (handles decimals, commas, removes units)
 */
export function extractNumericValue(val: string | number | undefined): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === "number") return isNaN(val) ? null : val;

  const str = String(val).trim();
  // Match first floating point number in string
  const match = str.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Extracts and separates clean value and unit from messy OCR string
 */
export function cleanValueAndUnit(rawValue: string, rawUnit?: string): { value: string; unit: string } {
  let val = String(rawValue || "").trim();
  let unit = String(rawUnit || "").trim();

  // If unit is already specified, check if val also contains unit
  if (!unit) {
    const knownUnits = [
      "mg/dL",
      "mg/dl",
      "g/dL",
      "g/dl",
      "mmol/L",
      "mEq/L",
      "mEq/l",
      "U/L",
      "u/L",
      "IU/L",
      "IU/mL",
      "ng/mL",
      "pg/mL",
      "mcg/dL",
      "mcg/mL",
      "%",
      "bpm",
      "ms",
      "mmHg",
      "mm Hg",
      "cells/mcL",
      "/cumm",
      "x10^3/uL",
      "x10^6/uL",
    ];

    for (const u of knownUnits) {
      const regex = new RegExp(`\\s*${u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
      if (regex.test(val)) {
        val = val.replace(regex, "").trim();
        unit = u;
        break;
      }
    }
  } else {
    // If unit is present in val, strip it from val
    const regex = new RegExp(`\\s*${unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
    val = val.replace(regex, "").trim();
  }

  return { value: val, unit };
}

export interface ReferenceRangeBounds {
  type: "interval" | "less_than" | "greater_than" | "qualitative" | "unknown";
  min?: number;
  max?: number;
  inclusiveMin?: boolean;
  inclusiveMax?: boolean;
  rawText: string;
}

/**
 * Analyzes a reference range string to extract mathematical boundaries
 */
export function parseReferenceRange(rangeStr: string): ReferenceRangeBounds {
  const clean = String(rangeStr || "").trim();
  if (!clean) {
    return { type: "unknown", rawText: "" };
  }

  // Check for "<=" or "<" or "less than" or "up to"
  const lessThanMatch = clean.match(/(?:<=?|<|less\s+than|up\s+to)\s*([0-9]*\.?[0-9]+)/i);
  if (lessThanMatch) {
    const max = parseFloat(lessThanMatch[1]);
    const inclusive = clean.includes("<=") || /up\s+to/i.test(clean);
    return {
      type: "less_than",
      max,
      inclusiveMax: inclusive,
      rawText: clean,
    };
  }

  // Check for ">=" or ">" or "greater than" or "more than"
  const greaterThanMatch = clean.match(/(?:>=?|>|greater\s+than|more\s+than)\s*([0-9]*\.?[0-9]+)/i);
  if (greaterThanMatch) {
    const min = parseFloat(greaterThanMatch[1]);
    const inclusive = clean.includes(">=");
    return {
      type: "greater_than",
      min,
      inclusiveMin: inclusive,
      rawText: clean,
    };
  }

  // Check for interval "A - B", "A to B", "A – B"
  const intervalMatch = clean.match(/([0-9]*\.?[0-9]+)\s*(?:-|–|—|to|~)\s*([0-9]*\.?[0-9]+)/i);
  if (intervalMatch) {
    const min = parseFloat(intervalMatch[1]);
    const max = parseFloat(intervalMatch[2]);
    return {
      type: "interval",
      min: Math.min(min, max),
      max: Math.max(min, max),
      inclusiveMin: true,
      inclusiveMax: true,
      rawText: clean,
    };
  }

  // Check for qualitative norms (e.g. Negative, Non-reactive, Normal, Clear, Upright)
  if (/(?:negative|non-reactive|normal|clear|upright|absent|nil)/i.test(clean)) {
    return {
      type: "qualitative",
      rawText: clean,
    };
  }

  return { type: "unknown", rawText: clean };
}

/**
 * Accurately evaluates investigation status against standard reference ranges
 */
export function evaluateInvestigationStatus(
  value: string,
  referenceRange: string,
  explicitStatus?: string
): {
  status: "within_range" | "above_range" | "below_range" | "undetermined";
  interpretation: string;
} {
  // If explicitly provided and clean
  const normExplicit = String(explicitStatus || "").toLowerCase().trim();
  if (
    normExplicit === "above_range" ||
    normExplicit === "high" ||
    normExplicit === "elevated" ||
    normExplicit === "above" ||
    normExplicit === "h"
  ) {
    return {
      status: "above_range",
      interpretation: "Above reference range (High)",
    };
  }
  if (
    normExplicit === "below_range" ||
    normExplicit === "low" ||
    normExplicit === "below" ||
    normExplicit === "l"
  ) {
    return {
      status: "below_range",
      interpretation: "Below reference range (Low)",
    };
  }
  if (
    normExplicit === "within_range" ||
    normExplicit === "normal" ||
    normExplicit === "wri" ||
    normExplicit === "within" ||
    normExplicit === "desirable" ||
    normExplicit === "n"
  ) {
    return {
      status: "within_range",
      interpretation: "Within standard reference range",
    };
  }

  const numVal = extractNumericValue(value);
  const bounds = parseReferenceRange(referenceRange);

  // If observed value is qualitative
  if (numVal === null) {
    const lowerVal = String(value || "").toLowerCase().trim();
    if (bounds.type === "qualitative") {
      const lowerRef = bounds.rawText.toLowerCase();
      if (
        (lowerRef.includes("negative") && lowerVal.includes("positive")) ||
        (lowerRef.includes("normal") && lowerVal.includes("abnormal")) ||
        (lowerRef.includes("upright") && lowerVal.includes("inversion"))
      ) {
        return {
          status: "above_range",
          interpretation: "Abnormal qualitative finding",
        };
      }
      if (
        (lowerRef.includes("negative") && lowerVal.includes("negative")) ||
        (lowerRef.includes("normal") && lowerVal.includes("normal"))
      ) {
        return {
          status: "within_range",
          interpretation: "Normal / Expected finding",
        };
      }
    }
    return {
      status: "undetermined",
      interpretation: "Requires clinical correlation",
    };
  }

  // Numerical comparison
  if (bounds.type === "interval" && bounds.min !== undefined && bounds.max !== undefined) {
    if (numVal < bounds.min) {
      return {
        status: "below_range",
        interpretation: `Low (${numVal} < min ${bounds.min})`,
      };
    }
    if (numVal > bounds.max) {
      return {
        status: "above_range",
        interpretation: `Elevated (${numVal} > max ${bounds.max})`,
      };
    }
    return {
      status: "within_range",
      interpretation: `Normal (${bounds.min} - ${bounds.max})`,
    };
  }

  if (bounds.type === "less_than" && bounds.max !== undefined) {
    const isAbove = bounds.inclusiveMax ? numVal > bounds.max : numVal >= bounds.max;
    if (isAbove) {
      return {
        status: "above_range",
        interpretation: `Elevated above threshold (< ${bounds.max})`,
      };
    }
    return {
      status: "within_range",
      interpretation: `Optimal (< ${bounds.max})`,
    };
  }

  if (bounds.type === "greater_than" && bounds.min !== undefined) {
    const isBelow = bounds.inclusiveMin ? numVal < bounds.min : numVal <= bounds.min;
    if (isBelow) {
      return {
        status: "below_range",
        interpretation: `Sub-optimal (> ${bounds.min})`,
      };
    }
    return {
      status: "within_range",
      interpretation: `Optimal (> ${bounds.min})`,
    };
  }

  return {
    status: "undetermined",
    interpretation: "Reference range undetermined",
  };
}

/**
 * Normalizes raw investigation objects from OCR or AI responses
 */
export function normalizeInvestigationItem(
  raw: any,
  defaultDate?: string,
  index?: number
): InvestigationItem {
  const testName =
    raw.testName ||
    raw.name ||
    raw.test ||
    raw.parameter ||
    raw.investigation ||
    "Investigation";

  const rawVal = raw.value !== undefined ? String(raw.value) : raw.val || raw.result || "";
  const rawUnit = raw.unit || raw.units || "";
  const { value, unit } = cleanValueAndUnit(rawVal, rawUnit);

  const referenceRange =
    raw.referenceRange ||
    raw.reference_range ||
    raw.reference ||
    raw.normalRange ||
    raw.range ||
    "Not specified";

  const rawStatus = raw.status || raw.flag || raw.comparison || "";
  const evalResult = evaluateInvestigationStatus(value, referenceRange, rawStatus);

  const interpretation =
    raw.interpretation ||
    raw.clinicalInterpretation ||
    evalResult.interpretation;

  const date = raw.date || defaultDate || new Date().toISOString().split("T")[0];
  const id = raw.id || `inv-${Date.now()}-${index ?? Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    testName,
    value,
    unit,
    referenceRange,
    status: evalResult.status,
    interpretation,
    date,
  };
}

/**
 * Normalizes raw medication objects from OCR or AI responses
 */
export function normalizeMedicationItem(
  raw: any,
  index?: number
): MedicationItem {
  const name = raw.name || raw.medicineName || raw.drug || "Medication";
  const dose = raw.dose || raw.dosage || raw.strength || "As directed";
  const frequency = raw.frequency || raw.sig || "Once daily";
  const duration = raw.duration || "As advised";
  const instructions = raw.instructions || raw.route || "";
  const source = raw.source || "extracted-from-document";
  const id = raw.id || `med-${Date.now()}-${index ?? Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    name,
    dose,
    frequency,
    duration,
    instructions,
    source,
  };
}

export interface StandardInvestigationPreset {
  testName: string;
  defaultUnit: string;
  standardReferenceRange: string;
  category: "Biochemistry" | "Hematology" | "Lipid Profile" | "Cardiac" | "Renal" | "Endocrine";
}

export const STANDARD_INVESTIGATION_PRESETS: StandardInvestigationPreset[] = [
  { testName: "Fasting Blood Sugar (FBS)", defaultUnit: "mg/dL", standardReferenceRange: "70 - 99", category: "Biochemistry" },
  { testName: "Post-Prandial Blood Sugar (PPBS)", defaultUnit: "mg/dL", standardReferenceRange: "< 140", category: "Biochemistry" },
  { testName: "HbA1c (Glycated Hemoglobin)", defaultUnit: "%", standardReferenceRange: "< 5.7", category: "Biochemistry" },
  { testName: "Serum Creatinine", defaultUnit: "mg/dL", standardReferenceRange: "0.7 - 1.3", category: "Renal" },
  { testName: "Blood Urea Nitrogen (BUN)", defaultUnit: "mg/dL", standardReferenceRange: "7 - 20", category: "Renal" },
  { testName: "Total Cholesterol", defaultUnit: "mg/dL", standardReferenceRange: "< 200", category: "Lipid Profile" },
  { testName: "Triglycerides", defaultUnit: "mg/dL", standardReferenceRange: "< 150", category: "Lipid Profile" },
  { testName: "HDL Cholesterol", defaultUnit: "mg/dL", standardReferenceRange: "> 40", category: "Lipid Profile" },
  { testName: "LDL Cholesterol", defaultUnit: "mg/dL", standardReferenceRange: "< 100", category: "Lipid Profile" },
  { testName: "Serum Potassium (K+)", defaultUnit: "mEq/L", standardReferenceRange: "3.5 - 5.0", category: "Renal" },
  { testName: "Serum Sodium (Na+)", defaultUnit: "mEq/L", standardReferenceRange: "135 - 145", category: "Renal" },
  { testName: "Hemoglobin (Hb)", defaultUnit: "g/dL", standardReferenceRange: "13.0 - 17.0", category: "Hematology" },
  { testName: "Total Leukocyte Count (WBC)", defaultUnit: "cells/mcL", standardReferenceRange: "4000 - 11000", category: "Hematology" },
  { testName: "Platelet Count", defaultUnit: "/cumm", standardReferenceRange: "150000 - 450000", category: "Hematology" },
  { testName: "Serum Bilirubin (Total)", defaultUnit: "mg/dL", standardReferenceRange: "0.2 - 1.2", category: "Biochemistry" },
  { testName: "SGPT / ALT", defaultUnit: "U/L", standardReferenceRange: "< 45", category: "Biochemistry" },
  { testName: "SGOT / AST", defaultUnit: "U/L", standardReferenceRange: "< 40", category: "Biochemistry" },
  { testName: "High-Sensitivity Troponin I", defaultUnit: "ng/mL", standardReferenceRange: "< 0.04", category: "Cardiac" },
  { testName: "TSH (Thyroid Stimulating Hormone)", defaultUnit: "uIU/mL", standardReferenceRange: "0.4 - 4.2", category: "Endocrine" },
];
