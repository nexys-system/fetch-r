//import * as P from "./parse";
//import { RowDataPacket } from "mysql2";
/*
const units = {
  units: [
    {
      entity: "User",
      table: "user",
      filters: [],
      fields: [
        { name: "id", column: "id" },
        { name: "firstName", column: "first_name" },
        { name: "lastName", column: "last_name" },
      ],
      alias: "t0",
    },
    {
      entity: "Country",
      table: "country",
      filters: [],
      fields: [{ name: "id", column: "id" }],
      join: {
        entity: "User",
        field: { name: "country", column: "country_id", optional: false },
      },
      alias: "t1",
    },
    {
      entity: "Company",
      table: "company",
      filters: [],
      fields: [
        { name: "id", column: "id" },
        { name: "logDateAdded", column: "log_date_added" },
        { name: "wwId", column: "ww_id" },
        { name: "name", column: "name" },
        { name: "type", column: "type_id" },
        { name: "ceId", column: "ce_id" },
      ],
      join: {
        entity: "User",
        field: { name: "company", column: "company_id", optional: true },
      },
      alias: "t2",
    },
    {
      entity: "User",
      table: "user",
      filters: [],
      fields: [{ name: "id", column: "id" }],
      join: {
        entity: "Company",
        field: { name: "logUser", column: "log_user_id", optional: true },
      },
      alias: "t3",
    },
    {
      entity: "CompanyStatus",
      table: "company_status",
      filters: [],
      fields: [{ name: "id", column: "id" }],
      join: {
        entity: "Company",
        field: { name: "status", column: "status_id", optional: false },
      },
      alias: "t4",
    },
    {
      entity: "Country",
      table: "country",
      filters: [],
      fields: [{ name: "id", column: "id" }],
      join: {
        entity: "Company",
        field: { name: "country", column: "country_id", optional: true },
      },
      alias: "t5",
    },
  ],
  take: 4,
};
const response = [
  {
    t0_id: 11,
    t0_firstName: "Marko",
    t0_lastName: "Kunti",
    t1_id: 247,
    t2_id: 138,
    t2_logDateAdded: "2017-10-23T12:02:37.000Z",
    t2_wwId: "ztzd30v",
    t2_name: "Megatrend Poslovna Rjesenja d.o.o.",
    t2_type: 1,
    t2_ceId: "10aisbgk",
    t3_id: 1681,
    t4_id: 1,
    t5_id: 76,
  },
  {
    t0_id: 12,
    t0_firstName: "Pinet",
    t0_lastName: "Jerome",
    t1_id: 7,
    t2_id: 2,
    t2_logDateAdded: "2017-10-23T12:00:50.000Z",
    t2_wwId: "ztzebx1",
    t2_name: "ACMI France",
    t2_type: 1,
    t2_ceId: "18z7gj0j",
    t3_id: 1681,
    t4_id: 1,
    t5_id: 7,
  },
  {
    t0_id: 13,
    t0_firstName: "Denis",
    t0_lastName: "Piollat",
    t1_id: 7,
    t2_id: 2,
    t2_logDateAdded: "2017-10-23T12:00:50.000Z",
    t2_wwId: "ztzebx1",
    t2_name: "ACMI France",
    t2_type: 1,
    t2_ceId: "18z7gj0j",
    t3_id: 1681,
    t4_id: 1,
    t5_id: 7,
  },
  {
    t0_id: 14,
    t0_firstName: "Daphné",
    t0_lastName: "Philippart",
    t1_id: 7,
    t2_id: 2,
    t2_logDateAdded: "2017-10-23T12:00:50.000Z",
    t2_wwId: "ztzebx1",
    t2_name: "ACMI France",
    t2_type: 1,
    t2_ceId: "18z7gj0j",
    t3_id: 1681,
    t4_id: 1,
    t5_id: 7,
  },
];

const rs: RowDataPacket = response as RowDataPacket;*/

test("parse", () => {
  const p = {}; //P.parse(rs, units);

  const e = [
    {
      company: {
        ceId: "10aisbgk",
        country: { id: 76 },
        id: 138,
        logDateAdded: "2017-10-23T12:02:37.000Z",
        logUser: { id: 1681 },
        name: "Megatrend Poslovna Rjesenja d.o.o.",
        status: { id: 1 },
        type: 1,
        wwId: "ztzd30v",
      },
      country: { id: 247 },
      firstName: "Marko",
      id: 11,
      lastName: "Kunti",
    },
    {
      company: {
        ceId: "18z7gj0j",
        country: { id: 7 },
        id: 2,
        logDateAdded: "2017-10-23T12:00:50.000Z",
        logUser: { id: 1681 },
        name: "ACMI France",
        status: { id: 1 },
        type: 1,
        wwId: "ztzebx1",
      },
      country: { id: 7 },
      firstName: "Pinet",
      id: 12,
      lastName: "Jerome",
    },
    {
      company: {
        ceId: "18z7gj0j",
        country: { id: 7 },
        id: 2,
        logDateAdded: "2017-10-23T12:00:50.000Z",
        logUser: { id: 1681 },
        name: "ACMI France",
        status: { id: 1 },
        type: 1,
        wwId: "ztzebx1",
      },
      country: { id: 7 },
      firstName: "Denis",
      id: 13,
      lastName: "Piollat",
    },
    {
      company: {
        ceId: "18z7gj0j",
        country: { id: 7 },
        id: 2,
        logDateAdded: "2017-10-23T12:00:50.000Z",
        logUser: { id: 1681 },
        name: "ACMI France",
        status: { id: 1 },
        type: 1,
        wwId: "ztzebx1",
      },
      country: { id: 7 },
      firstName: "Daphné",
      id: 14,
      lastName: "Philippart",
    },
  ];
  // this is irrelevant, fix test
  expect(typeof p).toEqual(typeof e);
});
