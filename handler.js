'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const expressGraphQL = require("express-graphql").graphqlHTTP;;
const serverless = require("serverless-http");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} = require('graphql');
const app = express();
// global variable to store the data

const products = [
  {"id":1,"name":"Flour - Strong Pizza","price":"$4.46","seller_id":1},
  {"id":2,"name":"Soho Lychee Liqueur","price":"$4.84","seller_id":1},
  {"id":3,"name":"Rosemary - Dry","price":"$9.56","seller_id":2},
  {"id":4,"name":"Cheese - Goat With Herbs","price":"$6.66","seller_id":2},
  {"id":5,"name":"Daikon Radish","price":"$8.59","seller_id":2},
  {"id":6,"name":"Pork - Bacon, Double Smoked","price":"$3.28","seller_id":3},
  {"id":7,"name":"Yogurt - Peach, 175 Gr","price":"$6.44","seller_id":3},
  {"id":8,"name":"Nut - Hazelnut, Ground, Natural","price":"$1.64","seller_id":4},
  {"id":9,"name":"Juice - Ocean Spray Kiwi","price":"$0.36","seller_id":4},
  {"id":10,"name":"Tea - Herbal Sweet Dreams","price":"$2.77","seller_id":5}
]
const sellers = [
  {"id":1,"first_name":"Jany","last_name":"Balderson","email":"jbalderson0@mozilla.com","gender":"Female"},
  {"id":2,"first_name":"Cosimo","last_name":"Baigrie","email":"cbaigrie1@nba.com","gender":"Male"},
  {"id":3,"first_name":"Teressa","last_name":"Luney","email":"tluney2@jimdo.com","gender":"Female"},
  {"id":4,"first_name":"Darrel","last_name":"Dyshart","email":"ddyshart3@hc360.com","gender":"Male"},
  {"id":5,"first_name":"Phedra","last_name":"Caneo","email":"pcaneo4@squidoo.com","gender":"Female"}
]

const ProductType = new GraphQLObjectType({
  name: 'Product',
  description: 'This represents a Product',
  fields: () => ({
      id: {
          type: GraphQLNonNull(GraphQLInt),
          description: 'The product ID'
      },
      name: {
          type:GraphQLNonNull(GraphQLString),
          description: 'The name of the product'
      },
      price: {
          type: GraphQLNonNull(GraphQLString),
          description: 'The price of the product'
      },
      seller_id: {
          type: GraphQLNonNull(GraphQLInt),
          description: 'The seller ID of the product'
      },
      seller: {
          type: SellerType,
          description: 'The seller of the product',
          resolve: (product) => {
              return sellers.find(seller => seller.id === product.seller_id)
          }
      }
  })
});

const SellerType = new GraphQLObjectType({
  name: 'Seller',
  description: 'This represents a Seller',
  fields: () => ({
      id: {
          type: GraphQLNonNull(GraphQLInt),
          description: 'The seller ID'
      },
      first_name: {
          type: GraphQLNonNull(GraphQLString),
          description: 'The first name of the seller'
      },
      last_name: {
          type: GraphQLNonNull(GraphQLString),
          description: 'The last name of the seller'
      },
      email: {
          type: GraphQLNonNull(GraphQLString),
          description: 'The email of the seller'
      },
      products: {
          type: new GraphQLList(ProductType),
          description: 'The products of the seller',
          resolve: (seller) => {
              return products.filter(product => product.seller_id === seller.id)
          }
      }

  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
      product: {
          type: ProductType,
          args: {
              id: {
                  type: GraphQLInt
              }
          },
          resolve: (parent, args) => {
              return products.find(product => product.id === args.id)
          }
      },
      seller: {
          type: SellerType,
          args: {
              id: {
                  type: GraphQLInt
              }
          },
          resolve: (parent, args) => {
              return sellers.find(seller => seller.id === args.id)
          }
      },
      products: {
          type: new GraphQLList(ProductType),
          description: 'List of products',
          resolve: () => products
      },
      sellers: {
          type: new GraphQLList(SellerType),
          description: 'List of sellers',
          resolve: () => sellers
      }
  })
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
      addProduct: {
          type: ProductType,
          args: {
              name: {
                  type: GraphQLNonNull(GraphQLString)
              },
              price: {
                  type: GraphQLNonNull(GraphQLString)
              },
              seller_id: {
                  type: GraphQLNonNull(GraphQLInt)
              }
          },
          resolve: (parent, args) => {
              const product = {
                  id: products.length + 1,
                  name: args.name,
                  price: args.price,
                  seller_id: args.seller_id
              }
              products.push(product)
              return product
          }
      },
      addSeller: {
          type: SellerType,
          args: {
              first_name: {
                  type: GraphQLNonNull(GraphQLString)
              },
              last_name: {
                  type: GraphQLNonNull(GraphQLString)
              },
              email: {
                  type: GraphQLNonNull(GraphQLString)
              }
          },
          resolve: (parent, args) => {
              const seller = {
                  id: sellers.length + 1,
                  first_name: args.first_name,
                  last_name: args.last_name,
                  email: args.email
              }
              sellers.push(seller)
              return seller
          }
      },
      updateProduct: {
          type: ProductType,
          args: {
              id: {
                  type: GraphQLNonNull(GraphQLInt)
              },
              name: {
                  type: GraphQLNonNull(GraphQLString)
              },
              price: {
                  type: GraphQLNonNull(GraphQLString)
              },
              seller_id: {
                  type: GraphQLNonNull(GraphQLInt)
              }
          },
          resolve: (parent, args) => {
              const product = products.find(product => product.id === args.id)
              if (!product) {
                  throw new Error('Product not found')
              }
              product.name = args.name
              product.price = args.price
              product.seller_id = args.seller_id
              return product
          }
      },
      updateSeller: {
          type: SellerType,
          args: {
              id: {
                  type: GraphQLNonNull(GraphQLInt)
              },
              first_name: {
                  type: GraphQLNonNull(GraphQLString)
              },
              last_name: {
                  type: GraphQLNonNull(GraphQLString)
              },
              email: {
                  type: GraphQLNonNull(GraphQLString)
              }
          },
          resolve: (parent, args) => {
              const seller = sellers.find(seller => seller.id === args.id)
              if (!seller) {
                  throw new Error('Seller not found')
              }
              seller.first_name = args.first_name
              seller.last_name = args.last_name
              seller.email = args.email
              return seller
          }
      },
      deleteProduct: {
          type: ProductType,
          args: {
              id: {
                  type: GraphQLNonNull(GraphQLInt)
              }
          },
          resolve: (parent, args) => {
              const product = products.find(product => product.id === args.id)
              if (!product) {
                  throw new Error('Product not found')
              }
              products.splice(products.indexOf(product), 1)
              return product
          }
      },
      deleteSeller: {
          type: SellerType,
          args: {
              id: {
                  type: GraphQLNonNull(GraphQLInt)
              }
          },
          resolve: (parent, args) => {
              const seller = sellers.find(seller => seller.id === args.id)
              if (!seller) {
                  throw new Error('Seller not found')
              }
              sellers.splice(sellers.indexOf(seller), 1)
              return seller
          }
      }
  })
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

app.use(bodyParser.json());
app.use(
  "/",
  expressGraphQL({
    schema: schema,
    graphiql: true
  })
);
module.exports.handler = serverless(app);