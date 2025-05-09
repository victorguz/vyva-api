'use strict';

const { INTEGER } = require('sequelize');
const { FLOAT } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      'DROP VIEW membership_prices; DROP VIEW product_stock_prices',
    );

    await queryInterface.changeColumn('Prices', 'value', {
      type: FLOAT(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('Prices', 'value', {
      type: INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    });
  },
};
