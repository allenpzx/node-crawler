const { MongoClient, ObjectId } = require("mongodb");
const assert = require("assert");

export default class Mongo {
  dbUrl = "mongodb://127.0.0.1:27017";
  dbName = "crawler";
  collectionName = "eblock";
  db: any;

  constructor() {
    this.connect = this.connect.bind(this);
    this.read = this.read.bind(this);
    this.insert = this.insert.bind(this);
    this.init = this.init.bind(this);
    this.init();
  }

  init = async function() {
    try {
    console.log("MongoDB init");
      await this.connect();

    //   const all = await this.read({ _id: ObjectId("5e744201d78cd96123034ce3") });
    //   console.log("all: ", all);

    //   const all = await this.delete({ _id: ObjectId("5e744201d78cd96123034ce2") });
    //   console.log("all: ", all);

    //   const all = await this.update({ _id: ObjectId("5e744201d78cd96123034ce3") }, {
    //       $mul: { test: 0 }
    //   });
    //   console.log("all: ", all.result);

      // const all2 = await db.read();
      // console.log('all2: ', all2);
    } catch (e) {
      console.log("init error: ", e);
      return Promise.reject(e)
    }
  };

  connect = async function() {
    try {
      let _this = this;
      await new Promise((resolve, reject) => {
        MongoClient.connect(this.dbUrl, { useUnifiedTopology: true }, function(
          err,
          client
        ) {
          assert.equal(null, err);
          console.log("Connected successfully to server");
          const db = client.db("crawler");
          _this.db = db;
          resolve();
        });
      });
      return _this.db;
    } catch (e) {
      console.log(
        `DB: ${this.dbName}, Collection: ${this.collectionName}, [connect] operate error: ${e}`
      );
      return Promise.reject(e)
    }
  };

  disconnect = function() {};

  insert = async function(data: any[]) {
    try {
      return await new Promise(async (resolve, reject) => {
        if (!this.db) {
          await this.connect();
        }
        const collection = this.db.collection(this.collectionName);
        collection.insertMany(data, function(err, result) {
          assert.equal(err, null);
          resolve(result);
        });
      });
    } catch (e) {
      console.log(
        `DB: ${this.dbName}, Collection: ${this.collectionName}, [create] operate error: ${e}`
      );
      return Promise.reject(e)
    }
  };

  update = async function(filter, data) {
    try {
        if(!filter) return Promise.reject({ message: 'filter is empty!' })
        return await new Promise(async (resolve, reject) => {
          if (!this.db) {
            await this.connect();
          }
          const collection = this.db.collection(this.collectionName);
          collection.updateMany(filter, data, {upsert: true},function(err, result) {
            if(err) {
                return err
            }
            assert.equal(err, null);
            resolve(result);
          });
        });
      } catch (e) {
        console.log(
          `DB: ${this.dbName}, Collection: ${this.collectionName}, [create] operate error: ${e}`
        );
        return Promise.reject(e)
      }
  };

  read = async function(query = {}) {
    try {
      return await new Promise(async (resolve, reject) => {
        if (!this.db) {
          await this.connect();
        }
        const collection = this.db.collection(this.collectionName);
        collection.find(query).toArray(function(err, docs) {
          assert.equal(err, null);
          resolve(docs);
        });
      });
    } catch (e) {
      console.log(
        `DB: ${this.dbName}, Collection: ${this.collectionName}, [read] operate error: ${e}`
      );
      return Promise.reject(e)
    }
  };

  delete = async function(query) {
    try {
    if(!query || Object.keys(query).length === 0 && query.constructor === Object) return Promise.reject({ message: 'query is empty!' })
      return await new Promise((resolve, reject) => {
        const collection = this.db.collection(this.collectionName);
        collection.deleteMany(query, function(err, result) {
        if(err) return reject(err)
          assert.equal(err, null);
          resolve(result);
        });
      });
    } catch (e) {
      console.log(
        `DB: ${this.dbName}, Collection: ${this.collectionName}, [delete] operate error: ${e}`
      );
      return Promise.reject(e)
    }
  };
}
