//import { GraphQLObjectType } from "graphql";
import * as GL from "graphql";
import { Entity } from "../type";
import * as TF from "./type-factory";
import { foreignId } from "./utils";

describe("createTypesFromModel", () => {
  test("empty", () => {
    const def: Entity[] = [];
    expect(TF.createTypesFromModel(def)).toEqual(new Map());
  });

  test("simple, one entity", () => {
    const def: Entity[] = [
      {
        name: "Test",
        fields: [{ name: "test", type: "String", optional: false }],
        uuid: false,
      },
    ];

    const entityContent = {
      args: { test: { type: GL.GraphQLString } },
      objectType: new GL.GraphQLObjectType({
        name: "Test",
        fields: { test: { type: new GL.GraphQLNonNull(GL.GraphQLString) } },
      }),
    };

    const left = TF.createTypesFromModel(def);
    const right = new Map([["Test", entityContent]]);

    // objects can't be compared directly, instead compare attributes individually
    expect(left.get("Test")?.objectType.getFields()).toEqual(
      entityContent.objectType.getFields()
    );
    expect(left.get("Test")?.args).toEqual(entityContent.args);
    expect(left.get("Test")?.objectType.name).toEqual(
      entityContent.objectType.name
    );

    // compare the stringified and re parsed objects
    expect(JSON.parse(JSON.stringify(Object.fromEntries(left)))).toEqual(
      JSON.parse(JSON.stringify(Object.fromEntries(right)))
    );
  });

  test("two entity, with fk", () => {
    const def: Entity[] = [
      {
        name: "Test",
        fields: [{ name: "test", type: "String", optional: false }],
        uuid: false,
      },
      {
        name: "Test2",
        fields: [{ name: "ff", type: "Test", optional: false }],
        uuid: false,
      },
    ];

    const testEntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { test: { type: GL.GraphQLString } },
      objectType: new GL.GraphQLObjectType({
        name: "Test",
        fields: { test: { type: new GL.GraphQLNonNull(GL.GraphQLString) } },
      }),
    };

    const test2EntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { ff: { type: foreignId } },
      objectType: new GL.GraphQLObjectType({
        name: "Test2",
        fields: {
          ff: { type: new GL.GraphQLNonNull(testEntityContent.objectType) },
        },
      }),
    };

    const left = TF.createTypesFromModel(def);
    const right = new Map([
      ["Test", testEntityContent],
      ["Test2", test2EntityContent],
    ]);

    expect(left.get("Test2")?.objectType.getFields()["ff"].args).toEqual(
      test2EntityContent.objectType.getFields()["ff"].args
    );

    // compare the stringified and re parsed objects
    expect(JSON.parse(JSON.stringify(Object.fromEntries(left)))).toEqual(
      JSON.parse(JSON.stringify(Object.fromEntries(right)))
    );
  });

  test("two entity, with fk, wrong order", () => {
    const def: Entity[] = [
      {
        name: "Test2",
        fields: [{ name: "ff", type: "Test", optional: false }],
        uuid: false,
      },
      {
        name: "Test",
        fields: [{ name: "test", type: "String", optional: false }],
        uuid: false,
      },
    ];

    const testEntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { test: { type: GL.GraphQLString } },
      objectType: new GL.GraphQLObjectType({
        name: "Test",
        fields: { test: { type: new GL.GraphQLNonNull(GL.GraphQLString) } },
      }),
    };

    const test2EntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { ff: { type: foreignId } },
      objectType: new GL.GraphQLObjectType({
        name: "Test2",
        fields: {
          ff: { type: new GL.GraphQLNonNull(testEntityContent.objectType) },
        },
      }),
    };

    const left = TF.createTypesFromModel(def);
    const right = new Map([
      ["Test", testEntityContent],
      ["Test2", test2EntityContent],
    ]);

    expect(left.get("Test2")?.objectType.getFields()["ff"].args).toEqual(
      test2EntityContent.objectType.getFields()["ff"].args
    );

    // compare the stringified and re parsed objects
    expect(JSON.parse(JSON.stringify(Object.fromEntries(left)))).toEqual(
      JSON.parse(JSON.stringify(Object.fromEntries(right)))
    );
  });

  test("self referencing entity", () => {
    const def: Entity[] = [
      {
        name: "Test",
        fields: [
          { name: "foo", type: "String", optional: true },
          { name: "foo2", type: "Test", optional: false },
        ],
        uuid: false,
      },
    ];

    const objectType: GL.GraphQLObjectType = new GL.GraphQLObjectType({
      name: "Test",
      fields: () => {
        return {
          foo: { type: GL.GraphQLString },
          foo2: { type: new GL.GraphQLNonNull(objectType) },
        };
      },
    });

    const entityContent = {
      args: {
        foo: { type: GL.GraphQLString },
        foo2: { type: foreignId },
      },
      objectType,
    };

    const left = TF.createTypesFromModel(def);
    const right = new Map([["Test", entityContent]]);

    // objects can't be compared directly, instead compare attributes individually
    expect(
      left.get("Test")?.objectType.getFields()["foo2"].type.toJSON()
    ).toEqual(entityContent.objectType.getFields()["foo2"].type.toJSON());
    expect(left.get("Test")?.objectType.getFields()["foo2"].args).toEqual(
      entityContent.objectType.getFields()["foo2"].args
    );
    expect(left.get("Test")?.args).toEqual(entityContent.args);
    expect(left.get("Test")?.objectType.name).toEqual(
      entityContent.objectType.name
    );

    // compare the stringified and re parsed objects
    expect(JSON.parse(JSON.stringify(Object.fromEntries(left)))).toEqual(
      JSON.parse(JSON.stringify(Object.fromEntries(right)))
    );
  });

  test("two entity, with fk, wrong order + self reference", () => {
    const def: Entity[] = [
      {
        name: "Test2",
        fields: [{ name: "ff", type: "Test", optional: false }],
        uuid: false,
      },
      {
        name: "Test",
        fields: [{ name: "test", type: "Test", optional: false }],
        uuid: false,
      },
    ];

    const objectType: GL.GraphQLObjectType = new GL.GraphQLObjectType({
      name: "Test",
      fields: () => ({ test: { type: new GL.GraphQLNonNull(objectType) } }),
    });

    const testEntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { test: { type: foreignId } },
      objectType,
    };

    const test2EntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { ff: { type: foreignId } },
      objectType: new GL.GraphQLObjectType({
        name: "Test2",
        fields: {
          ff: { type: new GL.GraphQLNonNull(testEntityContent.objectType) },
        },
      }),
    };

    const left = TF.createTypesFromModel(def);
    const right = new Map([
      ["Test", testEntityContent],
      ["Test2", test2EntityContent],
    ]);

    expect(left.get("Test2")?.objectType.getFields()["ff"].args).toEqual(
      test2EntityContent.objectType.getFields()["ff"].args
    );

    // compare the stringified and re parsed objects
    expect(JSON.parse(JSON.stringify(Object.fromEntries(left)))).toEqual(
      JSON.parse(JSON.stringify(Object.fromEntries(right)))
    );
  });
});
