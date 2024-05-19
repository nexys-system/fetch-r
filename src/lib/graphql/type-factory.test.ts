//import { GraphQLObjectType } from "graphql";
import * as GL from "graphql";
import { Entity } from "../type.js";
import * as TF from "./type-factory.js";
import { foreignId } from "./utils.js";

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
      argsPartial: { test: { type: GL.GraphQLString } },
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
    // expect(left.get("Test")?.args).toEqual(entityContent.args);
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
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { test: { type: GL.GraphQLString } },
      argsPartial: { test: { type: GL.GraphQLString } },
      objectType: new GL.GraphQLObjectType({
        name: "Test",
        fields: { test: { type: new GL.GraphQLNonNull(GL.GraphQLString) } },
      }),
    };

    const test2EntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { ff: { type: foreignId } },
      argsPartial: { ff: { type: foreignId } },
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

    // console.log(left);
    // console.log(left.get("Test2")?.args);
    // console.log(left.get("Test2")?.objectType.getFields());

    //expect(left.get("Test2")?.objectType.getFields()["ff"].args).toEqual(
    //test2EntityContent.objectType.getFields()["ff"].args
    //);

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
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { test: { type: GL.GraphQLString } },
      argsPartial: { test: { type: GL.GraphQLString } },
      objectType: new GL.GraphQLObjectType({
        name: "Test",
        fields: { test: { type: new GL.GraphQLNonNull(GL.GraphQLString) } },
      }),
    };

    const test2EntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { ff: { type: foreignId } },
      argsPartial: { ff: { type: foreignId } },
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

    //expect(left.get("Test2")?.objectType.getFields()["ff"].args).toEqual(
    //  test2EntityContent.objectType.getFields()["ff"].args
    //);

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
      argsPartial: {
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
    /*expect(left.get("Test")?.objectType.getFields()["foo2"].args).toEqual(
      entityContent.objectType.getFields()["foo2"].args
    );
    expect(left.get("Test")?.args).toEqual(entityContent.args);*/
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
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { test: { type: foreignId } },
      argsPartial: { test: { type: foreignId } },
      objectType,
    };

    const test2EntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { ff: { type: foreignId } },
      argsPartial: { ff: { type: foreignId } },
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

    /*expect(left.get("Test2")?.objectType.getFields()["ff"].args).toEqual(
      test2EntityContent.objectType.getFields()["ff"].args
    );*/

    // compare the stringified and re parsed objects
    expect(JSON.parse(JSON.stringify(Object.fromEntries(left)))).toEqual(
      JSON.parse(JSON.stringify(Object.fromEntries(right)))
    );
  });

  test("two entity, with 2 fks", () => {
    const def: Entity[] = [
      {
        name: "Test2",
        fields: [{ name: "t", type: "Test", optional: false }],
        uuid: false,
      },
      {
        name: "Test",
        fields: [{ name: "t2", type: "Test2", optional: false }],
        uuid: false,
      },
    ];

    const ot1: GL.GraphQLObjectType = new GL.GraphQLObjectType({
      name: "Test",
      fields: () => {
        return { t2: { type: new GL.GraphQLNonNull(ot2) } };
      }, //
    });

    const ot2 = new GL.GraphQLObjectType({
      name: "Test2",
      fields: {
        t: { type: new GL.GraphQLNonNull(ot1) },
      },
    });

    const testEntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { t2: { type: foreignId } },
      argsPartial: { t2: { type: foreignId } },
      objectType: ot1,
    };

    const test2EntityContent: {
      args: GL.GraphQLFieldConfigArgumentMap;
      argsPartial: GL.GraphQLFieldConfigArgumentMap;
      objectType: GL.GraphQLObjectType;
    } = {
      args: { t: { type: foreignId } },
      argsPartial: { t: { type: foreignId } },
      objectType: ot2,
    };

    const left = TF.createTypesFromModel(def);
    const right = new Map([
      ["Test", testEntityContent],
      ["Test2", test2EntityContent],
    ]);

    /*  expect(left.get("Test2")?.objectType.getFields()["ff"].args).toEqual(
      test2EntityContent.objectType.getFields()["ff"].args
    );*/

    // compare the stringified and re parsed objects
    expect(JSON.parse(JSON.stringify(Object.fromEntries(left)))).toEqual(
      JSON.parse(JSON.stringify(Object.fromEntries(right)))
    );
  });
});
