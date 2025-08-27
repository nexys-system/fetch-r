import * as T from "../type.js";

// Subset of academy model for SQLite testing
const m: T.Entity[] = [
  {
    name: "ContentStatus",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "description",
        optional: true,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "CompanyStatus",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "description",
        optional: true,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "UserCertificateStatus",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "description",
        optional: true,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "Country",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "iso2",
        optional: false,
        column: "iso_2",
        type: "String",
      },
      {
        name: "iso3",
        optional: false,
        column: "iso_3",
        type: "String",
      },
      {
        name: "market",
        optional: true,
        column: "market_id",
        type: "Int",
      },
    ],
  },
  {
    name: "Company",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "ceId",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "wwId",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "type",
        optional: false,
        column: "type_id",
        type: "Int",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "CompanyStatus",
      },
      {
        name: "country",
        optional: true,
        column: "country_id",
        type: "Country",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
    ],
  },
  {
    name: "User",
    uuid: false,
    fields: [
      {
        name: "firstName",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "lastName",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "email",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "secretKey",
        optional: false,
        column: "keyy",
        type: "String",
      },
      {
        name: "password",
        optional: true,
        column: "password_bcrypt",
        type: "String",
      },
      {
        name: "logIp",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "isAdmin",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "Int",
      },
      {
        name: "language",
        optional: false,
        column: "language_id",
        type: "Int",
      },
      {
        name: "country",
        optional: false,
        column: "country_id",
        type: "Country",
      },
      {
        name: "company",
        optional: true,
        column: "company_id",
        type: "Company",
      },
      {
        name: "simulcationUser",
        optional: true,
        column: "simulcation_user_id",
        type: "Int",
      },
      {
        name: "kyiId",
        optional: true,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "Cert",
    uuid: false,
    fields: [
      {
        name: "points",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "badge",
        optional: true,
        column: "badge_id",
        type: "String",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "ContentStatus",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
    ],
  },
  {
    name: "UserCertificate",
    uuid: false,
    fields: [
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
      {
        name: "cert",
        optional: false,
        column: "cert_id",
        type: "Cert",
      },
      {
        name: "score",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "issued",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "expires",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "printed",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "UserCertificateStatus",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "testUserId",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "reason",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "badgeStatus",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "badgeId",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "isLog",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "logComment",
        optional: true,
        column: undefined,
        type: "String",
      },
    ],
  },
];

export default m;