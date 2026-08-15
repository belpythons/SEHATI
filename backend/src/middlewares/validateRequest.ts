import { body, param, query } from "express-validator";

export const validateRequest = [
  body("clientToken")
    .notEmpty()
    .withMessage("clientToken is required")
    .isUUID(4)
    .withMessage("clientToken must be a valid UUID"),

  body("persona")
    .optional()
    .isIn(["ORANG_TUA", "ANAK", "BAYI"])
    .withMessage("persona must be ORANG_TUA, ANAK, or BAYI"),

  body("kelurahan")
    .notEmpty()
    .withMessage("kelurahan is required"),

  body("ageMonths")
    .optional()
    .isInt({ min: 0, max: 239 })
    .withMessage("ageMonths must be between 0 and 239"),

  body("gender")
    .optional()
    .isIn(["L", "P"])
    .withMessage("gender must be L or P"),

  body("weightKg")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("weightKg must be a positive number"),

  body("heightCm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("heightCm must be a positive number"),

  body("exclusiveAsi")
    .optional()
    .isBoolean()
    .withMessage("exclusiveAsi must be a boolean"),

  body("sanitationAccess")
    .optional()
    .isBoolean()
    .withMessage("sanitationAccess must be a boolean"),

  body("cleanWaterAccess")
    .optional()
    .isBoolean()
    .withMessage("cleanWaterAccess must be a boolean"),

  body("smokeExposure")
    .optional()
    .isBoolean()
    .withMessage("smokeExposure must be a boolean"),

  body("economicQuintile")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("economicQuintile must be between 1 and 5"),

  body("diarrheaHistory")
    .optional()
    .isBoolean()
    .withMessage("diarrheaHistory must be a boolean"),

  param("sessionId")
    .optional()
    .isUUID(4)
    .withMessage("sessionId must be a valid UUID"),

  query("sessionId")
    .optional()
    .isUUID(4)
    .withMessage("sessionId query must be a valid UUID"),

  query("query")
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage("query must be between 1 and 500 characters"),
];