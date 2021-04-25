const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
  type Query {
    # Users
    getUser: User

    # Products
    getProducts: [Product]
    getProduct(id: ID!): Product

    #Customers
    getCustomers: [Customer]
    getCustomersSeller: [Customer]
    getCustomer(id: ID!): Customer

    # Orders
    getOrders: [Order]
    getOrdersSeller: [Order]
    getOrder(id: ID!): Order
    getOrdersState(state: String!): [Order]

    # Advanced search
    topCustomers: [TopCustomer]
    topSellers: [TopSeller]
    searchProduct(text: String!): [Product]
  }
  input UserInput {
    name: String
    lastName: String
    email: String
    password: String
  }
  type User {
    id: ID
    name: String
    lastName: String
    email: String
    created: String
  }
  type Token {
    token: String
  }
  input AuthUserInput {
    email: String!
    password: String!
  }
  type Mutation {
    # Users
    newUser(input: UserInput!): User
    authUser(input: AuthUserInput!): Token

    # Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    # Customers
    newCustomer(input: CustomerInput): Customer
    updateCustomer(id: ID!, input: CustomerInput): Customer
    deleteCustomer(id: ID!): String

    # Orders
    newOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }

  type Product {
    id: ID
    name: String
    stock: Int
    price: Float
    created: String
  }

  type Customer {
    id: ID
    name: String
    lastName: String
    company: String
    email: String
    phone: String
    created: String
    seller: ID
  }

  type Order {
    id: ID
    order: [OrderGroup]
    total: Float
    customer: Customer
    seller: ID
    state: StateOrder
    date: String
  }

  type OrderGroup {
    id: ID
    quantity: Int
    name: String
    price: Float
  }

  type TopCustomer {
    total: Float
    customer: [Customer]
  }

  type TopSeller {
    total: Float
    seller: [User]
  }

  enum StateOrder {
    PENDING
    COMPLETED
    CANCELED
  }

  input ProductInput {
    name: String!
    stock: Int!
    price: Float!
  }

  input CustomerInput {
    name: String!
    lastName: String!
    company: String!
    email: String!
    phone: String
  }

  input OrderProductInput {
    id: ID
    quantity: Int
    name: String
    price: Float
  }

  input OrderInput {
    order: [OrderProductInput]
    total: Float
    customer: ID
    state: StateOrder
  }
`;

module.exports = typeDefs;
