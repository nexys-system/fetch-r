import * as M from "./meta.js";
import * as S from "./sql.js";
import * as T from "../type.js";

const model: T.Entity[] = [
  {
    name: "Instance",
    fields: [
      {
        name: "name",
        type: "String",
        optional: false,
      },
      {
        name: "dateAdded",
        type: "LocalDateTime",
        optional: false,
      },
      {
        name: "languageId",
        type: "Int",
        optional: false,
      },
      {
        name: "currencyId",
        type: "Int",
        optional: false,
      },
    ],
    uuid: true,
  },
  {
    name: "Product",
    fields: [
      {
        name: "instance",
        column: "instance_id",
        type: "Instance",
        optional: false,
      },
      {
        name: "name",
        type: "String",
        optional: false,
      },
      {
        name: "description",
        type: "String",
        optional: true,
      },
      {
        name: "secretKey",
        column: "keyy",
        type: "String",
        optional: false,
      },
      {
        name: "status",
        column: "status_id",
        type: "Int",
        optional: false,
      },
      {
        name: "logDateAdded",
        type: "LocalDateTime",
        optional: false,
      },
    ],
    uuid: false,
  },
  {
    name: "Service",
    table: "product_service",
    fields: [
      {
        name: "instance",
        column: "instance_id",
        type: "Instance",
        optional: false,
      },
      {
        name: "product",
        column: "product_id",
        type: "Product",
        optional: false,
      },
      {
        name: "name",
        type: "String",
        optional: false,
      },
      {
        name: "logDateAdded",
        type: "LocalDateTime",
        optional: false,
      },
      {
        name: "repository",
        type: "String",
        optional: true,
      },
      {
        name: "hasTokens",
        column: "has_tokens",
        type: "Boolean",
        optional: true,
      },
      {
        name: "organization",
        type: "String",
        optional: true,
      },
      {
        name: "deploy",
        column: "deploy_id",
        type: "ServiceDeploy",
        optional: true,
      },
    ],
    uuid: true,
  },
  {
    name: "EnvVar",
    table: "product_env_var",
    fields: [
      {
        name: "instance",
        column: "instance_id",
        type: "Instance",
        optional: false,
      },
      {
        name: "product",
        column: "product_id",
        type: "Product",
        optional: false,
      },
      {
        name: "service",
        column: "service_id",
        type: "Service",
        optional: true,
      },

      {
        name: "key",
        column: "keyy",
        type: "String",
        optional: false,
      },
      {
        name: "value",
        type: "String",
        optional: false,
      },

      {
        name: "logDateAdded",
        type: "LocalDateTime",
        optional: false,
      },
    ],
    uuid: false,
  },
  {
    name: "ServiceDeploy",
    fields: [
      {
        name: "packageSubfolder",
        type: "String",
        optional: true,
      },
    ],
    uuid: false,
  },
];

// here if `service deploy` is not given in the projection, the resulting query will be wrong

test("multi filters", () => {
  const q = {
    EnvVar: {
      projection: { service: { deploy: {} } },
      filters: {
        product: { id: 2 },
        service: { deploy: { id: 19 } },
        instance: { uuid: "2c5d0535-26ab-11e9-9284-fa163e41f33d" },
      },
    },
  };

  const entity = "EnvVar";

  const em = M.toMeta(entity, q[entity], model);
  const s = S.toQuery(em, "MySQL");

  const ss = [
    "SELECT t0.`id` AS t0_id, t1.`id` AS t1_id, t2.`id` AS t2_id, t2.`uuid` AS t2_uuid, t3.`id` AS t3_id, t4.`uuid` AS t4_uuid",
    "FROM product_env_var AS t0",
    "JOIN product AS t1 ON t1.id=t0.product_id",
    "LEFT JOIN product_service AS t2 ON t2.id=t0.service_id",
    "LEFT JOIN service_deploy AS t3 ON t3.id=t2.deploy_id",
    "JOIN instance AS t4 ON t4.id=t0.instance_id",
    "WHERE t1.`id`=2 AND t3.`id`=19 AND t4.`uuid`='2c5d0535-26ab-11e9-9284-fa163e41f33d'",
  ];

  expect(s).toEqual(ss);
});

// Bug test for issue #45: deploy is in filters but NOT in projection
test("multi filters - nested filter without projection", () => {
  const q = {
    EnvVar: {
      projection: { key: true, value: true }, // NOT including service.deploy
      filters: {
        product: { id: 2 },
        service: { deploy: { id: 19 } }, // But filtering by it
        instance: { uuid: "2c5d0535-26ab-11e9-9284-fa163e41f33d" },
      },
    },
  };

  const entity = "EnvVar";

  const em = M.toMeta(entity, q[entity], model);
  const s = S.toQuery(em, "MySQL");

  // Expected: should still include JOIN to service_deploy for filtering
  const ss = [
    "SELECT t0.`id` AS t0_id, t0.`keyy` AS t0_key, t0.`value` AS t0_value, t1.`id` AS t1_id, t2.`uuid` AS t2_uuid, t3.`id` AS t3_id, t4.`uuid` AS t4_uuid",
    "FROM product_env_var AS t0",
    "JOIN product AS t1 ON t1.id=t0.product_id",
    "LEFT JOIN product_service AS t2 ON t2.id=t0.service_id",
    "LEFT JOIN service_deploy AS t3 ON t3.id=t2.deploy_id",
    "JOIN instance AS t4 ON t4.id=t0.instance_id",
    "WHERE t1.`id`=2 AND t3.`id`=19 AND t4.`uuid`='2c5d0535-26ab-11e9-9284-fa163e41f33d'",
  ];

  expect(s).toEqual(ss);
});
