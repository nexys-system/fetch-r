import * as T from "../type.js";

const m: T.Entity[] = [
  {
    name: "UserPoints",
    uuid: false,
    fields: [
      {
        name: "reason",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
      {
        name: "points",
        optional: false,
        column: undefined,
        type: "Int",
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
    name: "Geo",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "short",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "awardsPoints",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "language",
        optional: true,
        column: "language_id",
        type: "Int",
      },
    ],
  },
  {
    name: "GeoStatus",
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
    name: "UserAnswer",
    uuid: false,
    fields: [
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
        name: "answer",
        optional: false,
        column: "answer_id",
        type: "Answer",
      },
      {
        name: "isCorrect",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "userQuestion",
        optional: false,
        column: "user_question_id",
        type: "UserQuestion",
      },
    ],
  },
  {
    name: "GeoCertModule",
    uuid: false,
    fields: [
      {
        name: "isDisplayed",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "geoCert",
        optional: false,
        column: "geo_cert_id",
        type: "GeoCert",
      },
      {
        name: "certModule",
        optional: false,
        column: "cert_module_id",
        type: "CertModule",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "isMandatory",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "Company",
    uuid: false,
    fields: [
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "country",
        optional: true,
        column: "country_id",
        type: "Country",
      },
      {
        name: "wwId",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "CompanyStatus",
      },
      {
        name: "type",
        optional: false,
        column: "type_id",
        type: "Int",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "ceId",
        optional: false,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "UserPointsTransfer",
    uuid: false,
    fields: [
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
      {
        name: "points",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "report",
        optional: true,
        column: "report_id",
        type: "Report",
      },
    ],
  },
  {
    name: "LinkType",
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
      {
        name: "label",
        optional: true,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "CertTranslation",
    uuid: false,
    fields: [
      {
        name: "title",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "cert",
        optional: false,
        column: "cert_id",
        type: "Cert",
      },
      {
        name: "language",
        optional: false,
        column: "language_id",
        type: "Int",
      },
      {
        name: "description",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "PreviewStatus",
      },
    ],
  },
  {
    name: "UserModule",
    uuid: false,
    fields: [
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "score",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "passed",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "userCert",
        optional: true,
        column: "user_cert_id",
        type: "UserCertificate",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "module",
        optional: false,
        column: "module_id",
        type: "Module",
      },
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
    ],
  },
  {
    name: "UserCertificate",
    uuid: false,
    fields: [
      {
        name: "issued",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "cert",
        optional: false,
        column: "cert_id",
        type: "Cert",
      },
      {
        name: "printed",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "score",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "expires",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
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
        name: "isLog",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "UserCertificateStatus",
      },
      {
        name: "badgeId",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "logComment",
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
        name: "iso3",
        optional: false,
        column: "iso_3",
        type: "String",
      },
      {
        name: "market",
        optional: true,
        column: "market_id",
        type: "Market",
      },
      {
        name: "iso2",
        optional: false,
        column: "iso_2",
        type: "String",
      },
    ],
  },
  {
    name: "Question",
    uuid: false,
    fields: [
      {
        name: "language",
        optional: false,
        column: "language_id",
        type: "Int",
      },
      {
        name: "reference",
        optional: true,
        column: "ref_id",
        type: "Question",
      },
      {
        name: "weight",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "label",
        optional: false,
        column: undefined,
        type: "String",
      },
    ],
  },
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
    name: "GeoCert",
    uuid: false,
    fields: [
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "geo",
        optional: false,
        column: "geo_id",
        type: "Geo",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "cert",
        optional: false,
        column: "cert_id",
        type: "Cert",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "GeoStatus",
      },
    ],
  },
  {
    name: "ResourceCategory",
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
    name: "ModuleLesson",
    uuid: false,
    fields: [
      {
        name: "module",
        optional: false,
        column: "module_id",
        type: "Module",
      },
      {
        name: "isMandatory",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "position",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "lesson",
        optional: false,
        column: "lesson_id",
        type: "Lesson",
      },
    ],
  },
  {
    name: "UserLessonResource",
    uuid: false,
    fields: [
      {
        name: "lessonResourceId",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "userLesson",
        optional: true,
        column: "user_lesson_id",
        type: "UserLesson",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
    ],
  },
  {
    name: "ResourceType",
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
    name: "LessonResource",
    uuid: false,
    fields: [
      {
        name: "lesson",
        optional: false,
        column: "lesson_id",
        type: "Lesson",
      },
      {
        name: "category",
        optional: false,
        column: "category_id",
        type: "ResourceCategory",
      },
      {
        name: "resource",
        optional: false,
        column: "resource_id",
        type: "Resource",
      },
      {
        name: "label",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "position",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "Resource",
    uuid: false,
    fields: [
      {
        name: "label",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "type",
        optional: false,
        column: "type_id",
        type: "ResourceType",
      },
    ],
  },
  {
    name: "Market",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "geo",
        optional: false,
        column: "geo_id",
        type: "Geo",
      },
      {
        name: "short",
        optional: false,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "UserQuestion",
    uuid: false,
    fields: [
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
        name: "question",
        optional: false,
        column: "question_id",
        type: "Question",
      },
      {
        name: "userLesson",
        optional: true,
        column: "user_lesson_id",
        type: "UserLesson",
      },
      {
        name: "isCorrect",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "UserAddress",
    uuid: false,
    fields: [
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
      {
        name: "street",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "zip",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "country",
        optional: false,
        column: "country_id",
        type: "Country",
      },
      {
        name: "city",
        optional: false,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "ModuleTranslation",
    uuid: false,
    fields: [
      {
        name: "title",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "PreviewStatus",
      },
      {
        name: "language",
        optional: false,
        column: "language_id",
        type: "Int",
      },
      {
        name: "description",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "module",
        optional: false,
        column: "module_id",
        type: "Module",
      },
    ],
  },
  {
    name: "GdprData",
    uuid: false,
    fields: [
      {
        name: "userId",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "requestId",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "entityTypeId",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "dateExpire",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "entityId",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "File",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "keyy",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "size",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "resource",
        optional: false,
        column: "resource_id",
        type: "Resource",
      },
      {
        name: "contentType",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "type",
        optional: false,
        column: "type_id",
        type: "FileType",
      },
    ],
  },
  {
    name: "PreviewStatus",
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
    name: "Tag",
    uuid: false,
    fields: [
      {
        name: "color",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "label",
        optional: false,
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
    name: "ReportType",
    uuid: false,
    fields: [
      {
        name: "label",
        optional: true,
        column: undefined,
        type: "String",
      },
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
    name: "Cert",
    uuid: false,
    fields: [
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "ContentStatus",
      },
      {
        name: "badge",
        optional: true,
        column: "badge_id",
        type: "String",
      },
      {
        name: "points",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "User",
    uuid: false,
    fields: [
      {
        name: "secretKey",
        optional: false,
        column: "keyy",
        type: "String",
      },
      {
        name: "email",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "firstName",
        optional: false,
        column: undefined,
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
        name: "simulcationUser",
        optional: true,
        column: "simulcation_user_id",
        type: "Int",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "lastName",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "isAdmin",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "company",
        optional: true,
        column: "company_id",
        type: "Company",
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
        name: "kyiId",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "country",
        optional: false,
        column: "country_id",
        type: "Country",
      },
    ],
  },
  {
    name: "UserCompany",
    uuid: false,
    fields: [
      {
        name: "leaveDateTime",
        optional: true,
        column: "leave_date",
        type: "LocalDateTime",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "startDateTime",
        optional: false,
        column: "start_date",
        type: "LocalDateTime",
      },
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
      {
        name: "retention",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "company",
        optional: false,
        column: "company_id",
        type: "Company",
      },
    ],
  },
  {
    name: "Report",
    uuid: false,
    fields: [
      {
        name: "modulePoints",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "printType",
        optional: true,
        column: "print_type_id",
        type: "Int",
      },
      {
        name: "modules",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "certificatePoints",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "bonusPoints",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "contentType",
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
        name: "users",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "certificates",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "reportType",
        optional: false,
        column: "report_type_id",
        type: "ReportType",
      },
    ],
  },
  {
    name: "FileType",
    uuid: false,
    fields: [
      {
        name: "name",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "label",
        optional: true,
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
    name: "CertModule",
    uuid: false,
    fields: [
      {
        name: "cert",
        optional: false,
        column: "cert_id",
        type: "Cert",
      },
      {
        name: "isMandatory",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "position",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "module",
        optional: false,
        column: "module_id",
        type: "Module",
      },
    ],
  },
  {
    name: "UserLesson",
    uuid: false,
    fields: [
      {
        name: "testPercCorrect",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "userModule",
        optional: true,
        column: "user_module_id",
        type: "UserModule",
      },
      {
        name: "testNumCorrect",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "keyy",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "lesson",
        optional: false,
        column: "lesson_id",
        type: "Lesson",
      },
      {
        name: "logUser",
        optional: true,
        column: "log_user_id",
        type: "User",
      },
      {
        name: "passed",
        optional: true,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "Lesson",
    uuid: false,
    fields: [
      {
        name: "description",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "title",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "testNQuestion",
        optional: true,
        column: "test_n_question",
        type: "Int",
      },
      {
        name: "reference",
        optional: true,
        column: "ref_id",
        type: "Lesson",
      },
      {
        name: "language",
        optional: false,
        column: "language_id",
        type: "Int",
      },
      {
        name: "testWeight",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "externalId",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "testPassrate",
        optional: true,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "LessonQuestion",
    uuid: false,
    fields: [
      {
        name: "lesson",
        optional: false,
        column: "lesson_id",
        type: "Lesson",
      },
      {
        name: "question",
        optional: false,
        column: "question_id",
        type: "Question",
      },
      {
        name: "position",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "Module",
    uuid: false,
    fields: [
      {
        name: "externalId",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "tag",
        optional: true,
        column: "tag_id",
        type: "Tag",
      },
      {
        name: "label",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "points",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "color",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "status",
        optional: false,
        column: "status_id",
        type: "ContentStatus",
      },
    ],
  },
  {
    name: "GdprRequest",
    uuid: false,
    fields: [
      {
        name: "fullName",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "typeId",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "statusId",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "email",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "countryId",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "date",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "explanation",
        optional: true,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "UserStatusSurvey",
    uuid: true,
    fields: [
      {
        name: "user",
        optional: false,
        column: "user_id",
        type: "User",
      },
      {
        name: "confirmed",
        optional: false,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "phase",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "Link",
    uuid: false,
    fields: [
      {
        name: "type",
        optional: false,
        column: "type_id",
        type: "LinkType",
      },
      {
        name: "resource",
        optional: false,
        column: "resource_id",
        type: "Resource",
      },
      {
        name: "url",
        optional: false,
        column: undefined,
        type: "String",
      },
    ],
  },
  {
    name: "Answer",
    uuid: false,
    fields: [
      {
        name: "question",
        optional: false,
        column: "question_id",
        type: "Question",
      },
      {
        name: "label",
        optional: false,
        column: undefined,
        type: "String",
      },
      {
        name: "position",
        optional: false,
        column: undefined,
        type: "Int",
      },
      {
        name: "correct",
        optional: false,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "UserLoginInfo",
    uuid: false,
    fields: [
      {
        name: "user",
        optional: true,
        column: "user_id",
        type: "User",
      },
      {
        name: "tokenExp",
        optional: true,
        column: undefined,
        type: "Int",
      },
      {
        name: "uaMinor",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "uaMajor",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "date",
        optional: true,
        column: undefined,
        type: "LocalDateTime",
      },
      {
        name: "osFamily",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "uaFamily",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "ip",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "devFamily",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "osMinor",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "osMajor",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "host",
        optional: true,
        column: undefined,
        type: "String",
      },
      {
        name: "adminUserId",
        optional: true,
        column: undefined,
        type: "Int",
      },
    ],
  },
  {
    name: "UserCertificateLog",
    uuid: false,
    fields: [
      {
        name: "userCertificate",
        optional: false,
        column: "",
        type: "UserCertificate",
      },
      {
        name: "logDateAdded",
        optional: false,
        column: "",
        type: "LocalDateTime",
      },
      {
        name: "description",
        optional: true,
        column: "",
        type: "String",
      },
      {
        name: "logUser",
        optional: false,
        column: "",
        type: "User",
      },
      {
        name: "status",
        optional: true,
        column: "",
        type: "Int",
      },
    ],
  },
];

export default m;
