const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const createToken = (user, secret, expiresIn) => {
  console.log(user);
  const { id, email, name, lastName } = user;
  return jwt.sign({ id, email, name, lastName }, secret, { expiresIn });
};
// Resolvers
const resolvers = {
  Query: {
    getUser: async (_, {}, context) => {
      console.log('context: ', context);
      return context.user;
    },
    // Products
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    getProduct: async (_, { id }) => {
      const product = await Product.findById(id);

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    },
    // Customers
    getCustomers: async () => {
      try {
        const customers = await Customer.find({});
        return customers;
      } catch (error) {
        console.log(error);
      }
    },
    getCustomersSeller: async (_, {}, context) => {
      try {
        const customers = await Customer.find({ seller: context.user.id.toString() });
        return customers;
      } catch (error) {
        console.log(error);
      }
    },
    getCustomer: async (_, { id }, context) => {
      const customer = await Customer.findById(id);

      if (!customer) {
        throw new Error('customer not found');
      }

      // Only the creator can get it
      if (customer.seller.toString() !== context.user.id) {
        throw new Error('Missing permission');
      }

      return customer;
    },
    // Orders
    getOrders: async () => {
      try {
        const orders = await Order.find({});
        return orders;
      } catch (error) {
        console.log(error);
      }
    },
    getOrdersSeller: async (_, {}, context) => {
      try {
        const orders = await Order.find({ seller: context.user.id }).populate('customer');

        return orders;
      } catch (error) {
        console.log(error);
      }
    },
    getOrder: async (_, { id }, context) => {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      // Only the creator can get it
      if (order.seller.toString() !== context.user.id) {
        throw new Error('Missing permission');
      }

      return order;
    },
    getOrdersState: async (_, { state }, context) => {
      const orders = await Order.find({ seller: context.user.id, state });

      return orders;
    },
    // Advanced search
    topCustomers: async () => {
      const customers = await Order.aggregate([
        { $match: { state: 'COMPLETED' } },
        {
          $group: {
            _id: '$customer',
            total: { $sum: '$total' },
          },
        },
        {
          $lookup: {
            from: 'customers',
            localField: '_id',
            foreignField: '_id',
            as: 'customer',
          },
        },
        {
          $limit: 10,
        },
        {
          $sort: { total: -1 },
        },
      ]);

      return customers;
    },
    topSellers: async () => {
      const sellers = await Order.aggregate([
        { $match: { state: 'COMPLETED' } },
        {
          $group: {
            _id: '$seller',
            total: { $sum: '$total' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'seller',
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: { total: -1 },
        },
      ]);

      return sellers;
    },
    searchProduct: async (_, { texto: text }) => {
      const products = await Product.find({ $text: { $search: text } }).limit(10);

      return products;
    },
  },
  Mutation: {
    // Users
    newUser: async (_, { input }) => {
      const { email, password } = input;
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error('User exists');
      }

      //Hash password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
        const user = new User(input);
        user.save();
        return user;
      } catch (error) {
        console.log('ERROR:', error);
      }
    },
    authUser: async (_, { input }) => {
      const { email, password } = input;
      // Check if the user exists
      const userExists = await User.findOne({ email });
      if (!userExists) {
        throw new Error('User not found');
      }
      // Compare the password
      const isPasswordCorrect = await bcryptjs.compare(password, userExists.password);
      if (!isPasswordCorrect) {
        throw new Error('Wrong password');
      }
      // Create token
      return {
        token: createToken(userExists, process.env.SECRET, '24h'),
      };
    },
    // Products
    newProduct: async (_, { input }) => {
      try {
        const product = new Product(input);

        // save in bd
        const result = await product.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateProduct: async (_, { id, input }) => {
      let product = await Product.findById(id);

      if (!product) {
        throw new Error('Product not found');
      }

      product = await Product.findOneAndUpdate({ _id: id }, input, { new: true });

      return product;
    },
    deleteProduct: async (_, { id }) => {
      let product = await Product.findById(id);

      if (!product) {
        throw new Error('Product not found');
      }

      await Product.findOneAndDelete({ _id: id });

      return 'Product deleted';
    },
    // Customers
    newCustomer: async (_, { input }, ctx) => {
      console.log('ctx: ', ctx);

      const { email } = input;

      const customer = await Customer.findOne({ email });
      if (customer) {
        throw new Error('Customer already added');
      }

      const newCustomer = new Customer(input);
      console.log('newCustomer: ', newCustomer);

      // assign to seller
      newCustomer.seller = ctx.user.id;

      try {
        const result = await newCustomer.save();
        console.log('result: ', result);

        return result;
      } catch (error) {
        console.log('error: ', error);
      }
    },
    updateCustomer: async (_, { id, input }, product) => {
      let customer = await Customer.findById(id);

      if (!customer) {
        throw new Error('Customer not found');
      }

      if (customer.seller.toString() !== product.user.id) {
        throw new Error('Missing permission');
      }

      customer = await Customer.findOneAndUpdate({ _id: id }, input, { new: true });
      return customer;
    },
    deleteCustomer: async (_, { id }, product) => {
      let customer = await Customer.findById(id);

      if (!customer) {
        throw new Error('Customer not found');
      }

      if (customer.seller.toString() !== product.user.id) {
        throw new Error('Missing permission');
      }

      await Customer.findOneAndDelete({ _id: id });
      return 'Customer deleted';
    },
    // Orders
    newOrder: async (_, { input }, context) => {
      const { customer } = input;

      let customerExists = await Customer.findById(customer);

      if (!customerExists) {
        throw new Error('customer not found');
      }

      if (customerExists.seller.toString() !== context.user.id) {
        throw new Error('Missing permission');
      }

      // check stock
      for await (const orderItem of input.order) {
        const { id } = orderItem;

        const product = await Product.findById(id);

        console.log('product:::: ', product);
        console.log('orderItem:::: ', orderItem);

        if (orderItem.quantity > product.stock) {
          throw new Error(`order item: ${product.nombre} exceeds available quantity`);
        } else {
          product.stock = product.stock - orderItem.quantity;

          await product.save();
        }
      }

      const newOrder = new Order(input);

      newOrder.seller = context.user.id;

      const result = await newOrder.save();
      return result;
    },
    updateOrder: async (_, { id, input }, context) => {
      const { customer } = input;

      const orderExists = await Order.findById(id);
      if (!orderExists) {
        throw new Error('order not found');
      }

      const customerExists = await Customer.findById(customer);
      if (!customerExists) {
        throw new Error('Customer not found');
      }

      if (customerExists.seller.toString() !== context.user.id) {
        throw new Error('Missing permission');
      }

      // Check stock
      if (input.order) {
        for await (const orderItem of input.order) {
          const { id } = orderItem;

          const product = await Product.findById(id);

          if (orderItem.quantity > product.stock) {
            throw new Error(`order item: ${product.nombre} exceeds available quantity`);
          } else {
            // Update products stock
            product.stock = product.stock - orderItem.quantity;

            await product.save();
          }
        }
      }

      const resultado = await Order.findOneAndUpdate({ _id: id }, input, { new: true });
      return resultado;
    },
    deleteOrder: async (_, { id }, context) => {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('order not found');
      }

      if (order.seller.toString() !== context.user.id) {
        throw new Error('Missing permission');
      }

      await Order.findOneAndDelete({ _id: id });
      return 'Order deleted';
    },
  },
};

module.exports = resolvers;
