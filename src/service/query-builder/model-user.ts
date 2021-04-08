export default [
  {
    name: "UserPermission",
    uuid: true,
    fields: [
      {
        type: "PermissionInstance",
        name: "permissionInstance",
        column: "permission_instance_id",
        optional: false,
      },
      {
        type: "User",
        name: "user",
        column: "user_id",
        optional: false,
      },
    ],
  },
  {
    name: "UserAuthenticationType",
    uuid: false,
    fields: [{ type: "String", name: "name", optional: false }],
  },
  {
    name: "UserStatus",
    uuid: false,
    fields: [
      {
        type: "String",
        name: "name",
        column: "col_name",
        optional: false,
      },
    ],
  },
  {
    name: "UserAuthentication",
    uuid: true,
    fields: [
      { type: "String", name: "value", optional: false },
      { type: "Boolean", name: "isEnabled", optional: false },
      {
        type: "UserAuthenticationType",
        name: "type",
        column: "type_id",
        optional: false,
      },
      {
        type: "User",
        name: "user",
        column: "user_id",
        optional: false,
      },
    ],
  },
  {
    name: "PermissionInstance",
    uuid: true,
    fields: [
      {
        type: "Instance",
        name: "instance",
        column: "instance_id",
        optional: false,
      },
      {
        type: "Permission",
        name: "permission",
        column: "permission_id",
        optional: false,
      },
    ],
  },
  {
    name: "Permission",
    uuid: true,
    fields: [{ type: "String", name: "name", optional: false }],
  },
  {
    name: "User",
    uuid: true,
    fields: [
      { type: "String", name: "firstName", optional: false },
      { type: "String", name: "lastName", optional: false },
      { type: "String", name: "email", optional: false },
      {
        type: "UserStatus",
        name: "status",
        column: "status_id",
        optional: false,
      },
      { type: "LocalDateTime", name: "logDateAdded", optional: false },
      {
        type: "Instance",
        name: "instance",
        column: "instance_id",
        optional: false,
      },
      { type: "String", name: "lang", optional: false },
    ],
  },
  {
    name: "Instance",
    uuid: true,
    fields: [
      { type: "String", name: "name", optional: false },
      { type: "LocalDateTime", name: "dateAdded", optional: false },
    ],
  },
];
